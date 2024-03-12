import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { Packet, PacketStates } from 'utils/types/packet';
import { CHAIN, CHAIN_CONFIGS } from 'utils/chains/configs';
import { CachingJsonRpcProvider } from 'api/utils/provider-cache';
import { getCacheTTL, GetTmClient, SimpleCache } from 'api/utils/cosmos';
import { IdentifiedChannel } from 'cosmjs-types/ibc/core/channel/v1/channel';
import Abi from 'utils/dispatcher.json';

import { getChannelsConcurrently } from '@/api/utils/peptide';

export const dynamic = 'force-dynamic'; // defaults to auto

function getLookbackTime() {
  return process.env.LOOKBACK_TIME ? parseInt(process.env.LOOKBACK_TIME) : 10 * 60 * 60;
}

export async function GET(request: NextRequest) {
  const cache = SimpleCache.getInstance();
  const allPackets = cache.get('allPackets');
  if (allPackets) {
    return NextResponse.json(allPackets);
  }

  let sendLogs: Array<[ethers.EventLog, CHAIN, string]> = [];
  let srcChainProviders: Record<CHAIN, CachingJsonRpcProvider> = {} as Record<CHAIN, CachingJsonRpcProvider>;
  let srcChainContracts: Array<[ethers.Contract, CHAIN, number, string]> = [];
  for (const chain in CHAIN_CONFIGS) {
    const chainId = chain as CHAIN;
    const dispatcherAddresses = CHAIN_CONFIGS[chainId].dispatchers;
    const clients = CHAIN_CONFIGS[chainId].clients;

    for (let i=0; i < dispatcherAddresses.length; i++) {
      let dispatcherAddress = dispatcherAddresses[i];
      let client = clients[i];
      const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
      const block = await provider.getBlock('latest');
      const blockNumber = block!.number;
      const fromBlock = blockNumber - getLookbackTime() / CHAIN_CONFIGS[chainId].blockTime;

      srcChainProviders[chainId] = provider;
      const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);
      srcChainContracts.push([contract, chainId, fromBlock, client]);

      console.log(`Getting sent packets for chain ${chainId} from block ${fromBlock} for client ${client} and dispatcher ${dispatcherAddress}`)
      const newSendLogs = (await contract.queryFilter('SendPacket', fromBlock, 'latest')) as Array<ethers.EventLog>;
      sendLogs = sendLogs.concat(newSendLogs.map((eventLog) => [eventLog, chainId, client]));
    }
  }
  const tmClient = await GetTmClient();

  // Collect all packets and their properties from the send logs
  const unprocessedPacketKeys = new Set<string>();
  const packets: Record<string, Packet> = {};

  console.log(`Processing ${sendLogs.length} send logs...`)
  async function processSendLog(sendLog: [ethers.EventLog, CHAIN, string]) {
    const [sendEvent, srcChain, client] = sendLog;
    let [srcPortAddress, srcChannelId, packet, sequence, timeout, fee] = sendEvent.args;
    srcChannelId = ethers.decodeBytes32String(srcChannelId);
    const portId = `polyibc.${client}.${srcPortAddress.slice(2)}`;

    let channel;
    try {
      console.log(portId, srcChannelId)
      channel = await tmClient.ibc.channel.channel(portId, srcChannelId);
    } catch (e) {
      console.log('Skipping packet for channel: ', srcChannelId);
      return;
    }

    if (!channel.channel) {
      console.warn('No channel found for packet: ', srcChannelId, srcPortAddress);
      return;
    }

    const key = `${portId}-${srcChannelId}-${sequence}`;
    console.log("send key", key)
    const srcProvider = srcChainProviders[srcChain];
    const srcBlock = await srcProvider.getBlock(sendEvent.blockNumber);

    packets[key] = {
      sourcePortAddress: srcPortAddress,
      sourceChannelId: srcChannelId,
      destPortAddress: channel.channel.counterparty.portId,
      destChannelId: channel.channel.counterparty.channelId,
      fee,
      sequence: sequence.toString(),
      timeout: timeout.toString(),
      id: key,
      state: PacketStates.SENT,
      createTime: srcBlock!.timestamp,
      sendTx: sendEvent.transactionHash,
      sourceChain: srcChain,
      destChain: channel.channel.counterparty.portId.split('.')[1]
    };
    unprocessedPacketKeys.add(key);
  }

  await Promise.allSettled(sendLogs.map(processSendLog));

  // Start by searching for ack events on the source chains
  const ackLogsPromises = srcChainContracts.map(async ([contract, chain, fromBlock, client]) => {
    const newAckLogs = (await contract.queryFilter('Acknowledgement', fromBlock, 'latest')) as Array<ethers.EventLog>;
    return newAckLogs.map((eventLog) => [eventLog, chain, client] as [ethers.EventLog, CHAIN, string]);
  });

  const ackLogsResults = await Promise.allSettled(ackLogsPromises);
  let ackLogs: Array<[ethers.EventLog, CHAIN, string]> = [];

  for (const result of ackLogsResults) {
    if (result.status === 'fulfilled') {
      ackLogs = ackLogs.concat(result.value);
    }
  }

  async function processAckLog(ackLog: [ethers.EventLog, CHAIN, string]) {
    const [ackEvent, srcChain, client] = ackLog;
    let [srcPortAddress, srcChannelId, sequence] = ackEvent.args;
    const key = `polyibc.${client}.${srcPortAddress.slice(2)}-${ethers.decodeBytes32String(srcChannelId)}-${sequence}`;

    if (!packets[key]) {
      console.log('No packet found for ack: ', key);
      return;
    }

    const srcProvider = srcChainProviders[srcChain];
    const srcBlock = await srcProvider.getBlock(ackEvent.blockNumber);
    if (srcBlock!.timestamp < packets[key].createTime) {
      return;
    }

    packets[key].endTime = srcBlock!.timestamp;
    packets[key].state = PacketStates.ACK;
    packets[key].ackTx = ackEvent.transactionHash;
    unprocessedPacketKeys.delete(key);
  }

  // Wait for all promises to settle
  await Promise.allSettled(ackLogs.map(processAckLog));

  // Set up providers and contracts to interact with the destination chains
  let destChainProviders: Record<CHAIN, CachingJsonRpcProvider> = {} as Record<CHAIN, CachingJsonRpcProvider>;
  let destChainContracts: Array<[ethers.Contract, CHAIN, number, string]> = [];
  for (const chain in CHAIN_CONFIGS) {
    const chainId = chain as CHAIN;
    const dispatcherAddresses = CHAIN_CONFIGS[chainId].dispatchers;
    const clients = CHAIN_CONFIGS[chainId].clients;

    for (let i=0; i < dispatcherAddresses.length; i++) {
      let dispatcherAddress = dispatcherAddresses[i];
      let client = clients[i];
      const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
      const block = await provider.getBlock('latest');
      const blockNumber = block!.number;
      const fromBlock = blockNumber - getLookbackTime() / CHAIN_CONFIGS[chainId].blockTime;

      destChainProviders[chainId] = provider;
      const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);
      destChainContracts.push([contract, chainId, fromBlock, client]);
    }
  }

  const writeAckLogsPromises = destChainContracts.map(async ([destContract, destChain, fromBlock, client]) => {
    const newWriteAckLogs = await destContract.queryFilter('WriteAckPacket', fromBlock, 'latest');
    return newWriteAckLogs.map((eventLog) => [eventLog, destChain, client] as [ethers.EventLog, CHAIN, string]);
  });

  let writeAckLogs: Array<[ethers.EventLog, CHAIN, string]> = [];
  for (const result of await Promise.allSettled(writeAckLogsPromises)) {
    if (result.status === 'fulfilled') {
      writeAckLogs = writeAckLogs.concat(result.value);
    }
  }

  console.log("Processing write ack logs...")

  for (const writeAckLog of writeAckLogs) {
    const [writeAckEvent, destChain, client] = writeAckLog;
    let [receiver, destChannelId, sequence, ack] = writeAckEvent.args;
    destChannelId = ethers.decodeBytes32String(destChannelId);

    let channel
    try {
      console.log(`polyibc.${client}.${receiver.slice(2)}`, destChannelId)
      channel = await tmClient.ibc.channel.channel(`polyibc.${client}.${receiver.slice(2)}`, destChannelId);
    } catch (e) {
      console.log('Skipping packet for channel: ', destChannelId);
      continue;
    }

    if (!channel.channel) {
      console.warn('No channel found for write ack: ', destChannelId, receiver);
      continue;
    }

    const key = `${channel.channel.counterparty.portId}-${channel.channel.counterparty.channelId}-${sequence}`;
    console.log("write ack key", key)
    if (key in unprocessedPacketKeys) {
      packets[key].state = PacketStates.WRITE_ACK;
      unprocessedPacketKeys.delete(key);
    }
  }

  // Match any recv packet events on destination chains to packets
  const recvPacketPromises = destChainContracts.map(async (destChainContract) => {
    const [destContract, destChain, fromBlock, client] = destChainContract;
    const newRecvPacketLogs = await destContract.queryFilter('RecvPacket', fromBlock, 'latest');
    return newRecvPacketLogs.map((eventLog) => [eventLog, destChain, client] as [ethers.EventLog, CHAIN, string]);
  });

  let recvPacketLogs: Array<[ethers.EventLog, CHAIN, string]> = [];
  for (const result of await Promise.allSettled(recvPacketPromises)) {
    if (result.status === 'fulfilled') {
      recvPacketLogs = recvPacketLogs.concat(result.value);
    }
  }

  console.log(`Processing ${recvPacketLogs.length} recv packet logs...`)
  const promises = recvPacketLogs.map(async (recvPacketLog) => {
    const [recvPacketEvent, destChain, client] = recvPacketLog;
    let [destPortAddress, destChannelId, sequence] = recvPacketEvent.args;
    destChannelId = ethers.decodeBytes32String(destChannelId);

    let channel;
    try {
      console.log(`polyibc.${client}.${destPortAddress.slice(2)}`, destChannelId)
      channel = await tmClient.ibc.channel.channel(`polyibc.${client}.${destPortAddress.slice(2)}`, destChannelId);
    } catch (e) {
      console.log('Skipping packet for channel: ', destChannelId);
      return
    }

    if (!channel.channel) {
      console.warn('No channel found for write ack: ', destChannelId, destPortAddress);
      return
    }

    const key = `${channel.channel.counterparty.portId}-${channel.channel.counterparty.channelId}-${sequence}`;
    console.log("recv key", key)

    if (packets[key]) {
      const recvBlock = await destChainProviders[destChain].getBlock(recvPacketEvent.blockNumber);

      if (recvBlock!.timestamp < packets[key].createTime) {
        return;
      }

      if (key in unprocessedPacketKeys) {
        packets[key].state = PacketStates.RECV;
        unprocessedPacketKeys.delete(key);
      }

      packets[key].rcvTx = recvPacketEvent.transactionHash;
    } else {
      console.log('No packet found for recv: ', key);
    }
  });

  await Promise.allSettled(promises);

  const response: Packet[] = [];
  Object.keys(packets).forEach((key) => {
    response.push(packets[key]);
  });

  cache.set('allPackets', response, getCacheTTL());
  return NextResponse.json(response);
}
