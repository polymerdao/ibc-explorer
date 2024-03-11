import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { Packet, PacketStates } from 'utils/types/packet';
import { CHAIN, CHAIN_CONFIGS } from 'utils/chains/configs';
import { CachingJsonRpcProvider } from 'api/utils/provider-cache';
import { getCacheTTL, GetTmClient, SimpleCache } from 'api/utils/cosmos';
import { IdentifiedChannel } from 'cosmjs-types/ibc/core/channel/v1/channel';
import { QueryChannelsResponse } from 'cosmjs-types/ibc/core/channel/v1/query';
import Abi from 'utils/dispatcher.json';

export const dynamic = 'force-dynamic' // defaults to auto

async function getChannels() {
  const tmClient = await GetTmClient();
  const channels = await tmClient.ibc.channel.allChannels();
  return (QueryChannelsResponse.toJSON(channels) as QueryChannelsResponse).channels;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to')

  if (!from) {
    return NextResponse.error();
  }

  const cache = SimpleCache.getInstance()
  const allPackets = cache.get("allPackets");
  if (allPackets) {
    return NextResponse.json(allPackets);
  }

  const channelsResponse = await getChannels();
  if (!channelsResponse) {
    return NextResponse.error();
  }
  const channels = channelsResponse as Array<IdentifiedChannel>;
  const openChannels = channels.filter((channel) => {
    return (
      channel.portId.startsWith(`polyibc.`) &&
      channel.counterparty.portId.startsWith(`polyibc.`)
    );
  })
  if (openChannels.length === 0) {
    return NextResponse.json([]);
  }

  const validChannelIds = new Set<string>();
  openChannels.forEach((channel) => {
    validChannelIds.add(channel.channelId);
  })

  const fromBlock = Number(from);
  const toBlock = to ? Number(to) : "latest";

  // Collect send logs from all chains
  let sendLogs: Array<[ethers.EventLog, CHAIN]> = [];
  let srcChainProviders: Record<CHAIN, CachingJsonRpcProvider> = {} as Record<CHAIN, CachingJsonRpcProvider>;
  let srcChainContracts: Array<[ethers.Contract, CHAIN]> = [];
  for (const chain in CHAIN_CONFIGS) {
    const chainId = chain as CHAIN;
    const dispatcherAddresses = CHAIN_CONFIGS[chainId].dispatchers;
    for (const dispatcherAddress of dispatcherAddresses) {
      const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
      srcChainProviders[chainId] = provider;
      const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);
      srcChainContracts.push([contract, chainId]);
      const newSendLogs = (await contract.queryFilter('SendPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;
      sendLogs = sendLogs.concat(newSendLogs.map((eventLog) => [eventLog, chainId]));
    }
  }

  // Collect all packets and their properties from the send logs
  const unprocessedPacketKeys = new Set<string>();
  const packets: Record<string, Packet> = {};

  async function processSendLog(sendLog: [ethers.EventLog, CHAIN]) {
    const [sendEvent, srcChain] = sendLog;
    let [srcPortAddress, srcChannelId, packet, sequence, timeout, fee] = sendEvent.args;
    srcChannelId = ethers.decodeBytes32String(srcChannelId);

    if (!validChannelIds.has(srcChannelId)) {
      console.log("Skipping packet for channel: ", srcChannelId);
      return;
    }

    const channel = openChannels.find(channel => (
      channel.channelId === srcChannelId &&
      channel.portId.startsWith(`polyibc.${srcChain}`) &&
      channel.portId.endsWith(srcPortAddress.slice(2))
    ));
    if (!channel) {
      console.warn("No channel found for packet: ", srcChannelId, srcPortAddress);
      return;
    }

    const key = `${srcPortAddress}-${srcChannelId}-${sequence}`;
    const srcProvider = srcChainProviders[srcChain];
    const srcBlock = await srcProvider.getBlock(sendEvent.blockNumber);

    packets[key] = {
      sourcePortAddress: srcPortAddress,
      sourceChannelId: srcChannelId,
      destPortAddress: channel.counterparty.portId,
      destChannelId: channel.counterparty.channelId,
      fee,
      sequence: sequence.toString(),
      timeout: timeout.toString(),
      id: key,
      state: PacketStates.SENT,
      createTime: srcBlock!.timestamp,
      sendTx: sendEvent.transactionHash,
      sourceChain: channel.portId.split(".")[1],
      destChain: channel.counterparty.portId.split(".")[1],
    };
    unprocessedPacketKeys.add(key);
  }
  await Promise.allSettled(sendLogs.map(processSendLog))

  /*
  ** Find the state of each packet
  ** States could be like:
  ** SENT (event on L2), POLY_RECV (received by Polymer), POLY_SENT (committed on Polymer), RECV (event on L2),
  ** WRITE_ACK (event on L2), POLY_ACK_RECV (ack received on Polymer), POLY_WRITE_ACK (ack written on Polymer), ACK (event on L2)
  **
  ** To set a proper state for each packet, start with SENT state for all relevant packets, then:
  ** For each packet go into the reverse direction of the packet flow starting from ACK
  ** If a packet reached the corresponding state, set it as the state for the packet and move on to the next packet
  ** Otherwise move to the next state until SENT state is reached
  */

  // Start by searching for ack events on the source chains
  const ackLogsPromises = srcChainContracts.map(async ([contract, chain]) => {
    const newAckLogs = (await contract.queryFilter('Acknowledgement', fromBlock, toBlock)) as Array<ethers.EventLog>;
    return newAckLogs.map((eventLog) => [eventLog, chain] as [ethers.EventLog, CHAIN]);
  });

  const ackLogsResults = await Promise.allSettled(ackLogsPromises);
  let ackLogs: Array<[ethers.EventLog, CHAIN]> = [];

  for (const result of ackLogsResults) {
    if (result.status === 'fulfilled') {
      ackLogs = ackLogs.concat(result.value);
    }
  }


  async function processAckLog(ackLog: [ethers.EventLog, CHAIN]) {
    const [ackEvent, srcChain] = ackLog;
    let [srcPortAddress, srcChannelId, sequence] = ackEvent.args;
    const key = `${srcPortAddress}-${ethers.decodeBytes32String(srcChannelId)}-${sequence}`;

    if (!packets[key]) {
      console.log("No packet found for ack: ", key);
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
  let destChainContracts: Array<[ethers.Contract, CHAIN]> = [];
  for (const chain in CHAIN_CONFIGS) {
    const chainId = chain as CHAIN;
    const dispatcherAddresses = CHAIN_CONFIGS[chainId].dispatchers;
    for (const dispatcherAddress of dispatcherAddresses) {
      const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
      destChainProviders[chainId] = provider;
      const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);
      destChainContracts.push([contract, chainId]);
    }
  }

  // const tmClient = await GetTmClient();

  // Match ack events on Polymer to packets
  // const processPacket = async (key: string) => {
  //   const packet = packets[key];

  //   try {
  //     const ack = await tmClient.ibc.channel.packetAcknowledgement(packet.destPortAddress, packet.destChannelId, Number(packet.sequence));
  //     if (ack.acknowledgement) {
  //       packet.state = PacketStates.POLY_WRITE_ACK;
  //       unprocessedPacketKeys.delete(key);
  //     }
  //   } catch (e) {
  //   }
  // };

  // await Promise.allSettled(Array.from(unprocessedPacketKeys).map(processPacket));

  // It seems that due to short circuiting POLY_ACK_RECV can't be distinguished as a separate state so this state is skipped

  const writeAckLogsPromises = destChainContracts.map(async ([destContract, destChain]) => {
    const newWriteAckLogs = await destContract.queryFilter('WriteAckPacket', 1, "latest");
    return newWriteAckLogs.map((eventLog) => [eventLog, destChain] as [ethers.EventLog, CHAIN]);
  });

  let writeAckLogs: Array<[ethers.EventLog, CHAIN]> = [];
  for (const result of await Promise.allSettled(writeAckLogsPromises)) {
    if (result.status === 'fulfilled') {
      writeAckLogs = writeAckLogs.concat(result.value);
    }
  }

  for (const writeAckLog of writeAckLogs) {
    const [writeAckEvent, destChain] = writeAckLog;
    const [receiver, destChannelId, sequence, ack] = writeAckEvent.args;

    const channel = openChannels.find((channel) => {
      return (
        channel.counterparty.channelId === ethers.decodeBytes32String(destChannelId) && 
        channel.counterparty.portId.startsWith(`polyibc.${destChain}`) &&
        channel.counterparty.portId.endsWith(receiver.slice(2))
      );
    })

    if (!channel) {
      console.log("Unable to find channel for write ack: ", destChannelId, "receiver: ", receiver);
      continue;
    }

    const key = `${channel.portId}-${channel.channelId}-${sequence}`;
    if (key in unprocessedPacketKeys) {
      packets[key].state = PacketStates.WRITE_ACK;
      unprocessedPacketKeys.delete(key);
    }
  }

  // Match any recv packet events on destination chains to packets
  const recvPacketPromises = destChainContracts.map(async (destChainContract) => {
    const [destContract, destChain] = destChainContract;
    const newRecvPacketLogs = await destContract.queryFilter('RecvPacket', 1, "latest");
    return newRecvPacketLogs.map((eventLog) => [eventLog, destChain] as [ethers.EventLog, CHAIN]);
  });

  let recvPacketLogs: Array<[ethers.EventLog, CHAIN]> = [];
  for (const result of await Promise.allSettled(recvPacketPromises)) {
    if (result.status === 'fulfilled') {
      recvPacketLogs = recvPacketLogs.concat(result.value);
    }
  }

  const promises = recvPacketLogs.map(async (recvPacketLog) => {
    const [recvPacketEvent, destChain] = recvPacketLog;
    const [destPortAddress, destChannelId, sequence] = recvPacketEvent.args;

    const channel = openChannels.find((channel) => {
      return (
        channel.counterparty.channelId === ethers.decodeBytes32String(destChannelId) &&
        channel.counterparty.portId.startsWith(`polyibc.${destChain}`) &&
        channel.counterparty.portId.endsWith(destPortAddress.slice(2))
      );
    });

    if (!channel) {
      console.log("Unable to find channel for recv packet: ", destChannelId, "receiver: ", destPortAddress);
      return;
    }

    const key = `0x${channel.portId.split(".")[2]}-${channel.channelId}-${sequence}`;
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
    }
  });

  await Promise.allSettled(promises);

  // Match any write ack events on Polymer to packets
  // await Promise.allSettled(
  //   Array.from(unprocessedPacketKeys).map(async (key) => {
  //     const packet = packets[key];

  //     try {
  //       const packetCommitment = await tmClient.ibc.channel.packetCommitment(packet.sourcePortAddress, packet.sourceChannelId, Number(packet.sequence));
  //       if (packetCommitment.commitment) {
  //         packet.state = PacketStates.POLY_WRITE_ACK;
  //         unprocessedPacketKeys.delete(key);
  //       }
  //     } catch (e) {
  //     }
  //   })
  // );

  // Match any recv packet events on Polymer to packets
  // await Promise.allSettled(Array.from(unprocessedPacketKeys).map(async key => {
  //   const packet = packets[key]; // Assuming `packets` is defined and contains the details for each key

  //   try {
  //     const packetReceipt = await tmClient.ibc.channel.packetReceipt(
  //       packet.destPortAddress, packet.destChannelId, Number(packet.sequence)
  //     );

  //     if (packetReceipt.received) {
  //       packet.state = PacketStates.POLY_RECV;
  //       unprocessedPacketKeys.delete(key);
  //     }
  //   } catch (error) {
  //     console.error(`Error processing packet with key ${key}:`, error);
  //   }
  // }));

  const response: Packet[] = [];
  Object.keys(packets).forEach((key) => {
    response.push(packets[key]);
  });

  cache.set("allPackets", response, getCacheTTL());
  return NextResponse.json(response);
}
