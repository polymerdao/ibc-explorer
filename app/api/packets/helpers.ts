import { pLimit } from 'plimit-lit';
import { getConcurrencyLimit, getLookbackTime } from '@/api/utils/helpers';
import { ethers } from 'ethers';
import { CHAIN, CHAIN_CONFIGS } from '@/utils/chains/configs';
import { CachingJsonRpcProvider } from '@/api/utils/provider';
import Abi from '@/utils/dispatcher.json';
import { GetTmClient } from '@/api/utils/cosmos';
import { Packet, PacketStates } from '@/utils/types/packet';
import { NextResponse } from 'next/server';

export async function getPackets() {
  const limit = pLimit(getConcurrencyLimit()); // Adjust this number to the maximum concurrency you want
  let sendLogs: Array<[ethers.EventLog, CHAIN, string]> = [];
  let srcChainProviders: Record<CHAIN, CachingJsonRpcProvider> = {} as Record<CHAIN, CachingJsonRpcProvider>;
  let srcChainContracts: Array<[ethers.Contract, CHAIN, number, string]> = [];

  let chainPromises = Object.keys(CHAIN_CONFIGS).map(async (chain) => {
    const chainId = chain as CHAIN;
    const dispatcherAddresses = CHAIN_CONFIGS[chainId].dispatchers;
    const clients = CHAIN_CONFIGS[chainId].clients;

    const dispatcherPromises = dispatcherAddresses.map((dispatcherAddress, i) => limit(async () => {
      let client = clients[i];
      const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
      const block = await provider.getBlock('latest');
      const blockNumber = block!.number;
      const fromBlock = blockNumber - getLookbackTime() / CHAIN_CONFIGS[chainId].blockTime;

      srcChainProviders[chainId] = provider;
      const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);
      srcChainContracts.push([contract, chainId, fromBlock, client]);

      console.log(`Getting sent packets for chain ${chainId} from block ${fromBlock} for client ${client} and dispatcher ${dispatcherAddress}`);
      const newSendLogs = (await contract.queryFilter('SendPacket', fromBlock, 'latest')) as Array<ethers.EventLog>;
      sendLogs = sendLogs.concat(newSendLogs.map((eventLog) => [eventLog, chainId, client]));
    }));

    await Promise.all(dispatcherPromises);
  });

  await Promise.all(chainPromises);

  console.log('Getting a tm client');
  const tmClient = await GetTmClient();

  // Collect all packets and their properties from the send logs
  const unprocessedPacketKeys = new Set<string>();
  const packets: Record<string, Packet> = {};

  console.log(`Processing ${sendLogs.length} send logs...`);

  async function processSendLog(sendLog: [ethers.EventLog, CHAIN, string]) {
    const [sendEvent, srcChain, client] = sendLog;
    let [srcPortAddress, srcChannelId, packet, sequence, timeout, fee] = sendEvent.args;
    srcChannelId = ethers.decodeBytes32String(srcChannelId);
    const portId = `polyibc.${client}.${srcPortAddress.slice(2)}`;

    let channel;
    try {
      console.log(`Getting channel for port ${portId} and channel ${srcChannelId} and sequence ${sequence}`);
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

  const processSendLogLimited = (sendLog: [ethers.EventLog, CHAIN, string]) => limit(() => processSendLog(sendLog));

  await Promise.allSettled(sendLogs.map(processSendLogLimited));

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

  chainPromises = Object.keys(CHAIN_CONFIGS).map(async (chain) => {
    const chainId = chain as CHAIN;
    const dispatcherAddresses = CHAIN_CONFIGS[chainId].dispatchers;
    const clients = CHAIN_CONFIGS[chainId].clients;

    const dispatcherPromises = dispatcherAddresses.map(async (dispatcherAddress, i) => {
      let client = clients[i];
      const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
      const block = await provider.getBlock('latest');
      const blockNumber = block!.number;
      const fromBlock = blockNumber - getLookbackTime() / CHAIN_CONFIGS[chainId].blockTime;

      destChainProviders[chainId] = provider;
      const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);
      destChainContracts.push([contract, chainId, fromBlock, client]);
    });

    await Promise.all(dispatcherPromises);
  });

  await Promise.all(chainPromises);

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

  console.log(`Processing ${writeAckLogs.length} write ack logs...`);

  for (const writeAckLog of writeAckLogs) {
    const [writeAckEvent, destChain, client] = writeAckLog;
    let [receiver, destChannelId, sequence, ack] = writeAckEvent.args;
    destChannelId = ethers.decodeBytes32String(destChannelId);

    let channel;
    try {
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
    if (unprocessedPacketKeys.has(key)) {
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

  console.log(`Processing ${recvPacketLogs.length} recv packet logs...`);
  const promises = recvPacketLogs.map(async (recvPacketLog) => {
    const [recvPacketEvent, destChain, client] = recvPacketLog;
    let [destPortAddress, destChannelId, sequence] = recvPacketEvent.args;
    destChannelId = ethers.decodeBytes32String(destChannelId);

    let channel;
    try {
      channel = await tmClient.ibc.channel.channel(`polyibc.${client}.${destPortAddress.slice(2)}`, destChannelId);
    } catch (e) {
      console.log('Skipping packet for channel: ', destChannelId);
      return;
    }

    if (!channel.channel) {
      console.warn('No channel found for write ack: ', destChannelId, destPortAddress);
      return;
    }

    const key = `${channel.channel.counterparty.portId}-${channel.channel.counterparty.channelId}-${sequence}`;

    if (packets[key]) {
      const recvBlock = await destChainProviders[destChain].getBlock(recvPacketEvent.blockNumber);

      if (recvBlock!.timestamp < packets[key].createTime) {
        return;
      }

      if (unprocessedPacketKeys.has(key)) {
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
  return response;
}

export async function getPacket(txHash: string) {
  const headers = {'content-type': 'application/json'};
  let packetResponse;

  try {
    const packetRequest = {
      query: `query Packet($txHash:String!){
                packets(where:{sendTx:$txHash}){
                  items {
                    sendPacket {
                      sequence
                      sourcePortAddress
                      sourceChannelId
                      dispatcherAddress
                      blockTimestamp
                      timeoutTimestamp
                    }
                    recvPacket {
                      destPortAddress
                      destChannelId
                      blockTimestamp
                    }
                    writeAckPacket {
                      dispatcherAddress
                      blockTimestamp
                    }
                    ackPacket {
                      blockTimestamp
                    }
                    id
                    state
                    sendTx
                    recvTx
                    writeAckTx
                    ackTx
                  }
                }
              }`,
      variables: { txHash }
    };

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(packetRequest)
    };

    const res = await (await fetch(process.env.INDEXER_URL!, options)).json();
    if (res?.data?.packets?.items.length > 0) {
      packetResponse = res.data.packets.items[0];
      console.log(packetResponse);
    } else {
      return [];
    }
  }
  catch (err) {
    console.log('Error fetching packet: ', err);
    return [];
  }

  // Find channel associated with the packet to parse out src and dest chains
  const sourceChannelId = packetResponse.sendPacket.sourceChannelId;
  let channelResponse;

  try {
    const channelRequest = {
      query: `query Channel($sourceChannelId:String!){
                channels(where:{channelId:$sourceChannelId}){
                  items {
                    portId
                    counterpartyPortId
                  }
                }
              }`,
      variables: { sourceChannelId }
    };

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(channelRequest)
    };

    const res = await (await fetch(process.env.INDEXER_URL!, options)).json();
    if (res?.data?.channels?.items.length > 0) {
      console.log(res.data.channels)
      channelResponse = res.data.channels.items[0];
    } else {
      return [];
    }
  }
  catch (err) {
    console.log('Error fetching channel: ', err);
    return [];
  }

  const packet: Packet = {
    sequence: packetResponse.sendPacket.sequence,
    sourcePortAddress: packetResponse.sendPacket.sourcePortAddress,
    sourceChannelId: packetResponse.sendPacket.sourceChannelId,
    destPortAddress: '',
    destChannelId: '',
    timeout: packetResponse.sendPacket.timeoutTimestamp,
    fee: '',
    id: packetResponse.id,
    state: packetResponse.state,
    createTime: packetResponse.sendPacket.blockTimestamp,
    endTime: packetResponse.recvPacket?.blockTimestamp,
    sendTx: packetResponse.sendTx,
    rcvTx: packetResponse.recvTx,
    ackTx: packetResponse.ackTx,
    sourceChain: channelResponse.portId?.split('.')[1],
    destChain: channelResponse.counterpartyPortId?.split('.')[1]
  };

  return packet;
}
