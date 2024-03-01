import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import { Packet, PacketStates } from "utils/types/packet";
import { CHAIN, CHAIN_CONFIGS } from "utils/chains/configs";
import { CachingJsonRpcProvider } from "api/utils/provider-cache";
import { GetTmClient } from "api/utils/cosmos";
import { GET as getChannels, IdentifiedChannel } from "api/channels/route";
import Abi from "utils/dispatcher.json";

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: NextRequest) {
  const apiUrl = process.env.API_URL!;
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to')
  const dispatcher = searchParams.get('dispatcher');

  if (!from) {
    return NextResponse.error();
  }

  const channelsResponse = await getChannels();
  if (!channelsResponse.ok) {
    return NextResponse.error();
  }
  const channels = await channelsResponse.json() as Array<IdentifiedChannel>;
  const openChannels = channels.filter((channel) => {
    return channel.state.toString() === "STATE_OPEN"
      && (channel.portId.startsWith(`polyibc.`) && channel.counterparty.portId.startsWith(`polyibc.`));
  })
  if (openChannels.length === 0) {
    return NextResponse.json([]);
  }

  const tmClient = await GetTmClient(apiUrl)

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
    const dispatcherAddresses = [dispatcher] ?? CHAIN_CONFIGS[chainId].dispatchers;
    for (const dispatcherAddress in dispatcherAddresses) {
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

  for (const sendLog of sendLogs) {
    const [sendEvent, srcChain] = sendLog;
    let [srcPortAddress, srcChannelId, packet, sequence, timeout, fee] = sendEvent.args;
    srcChannelId = ethers.decodeBytes32String(srcChannelId);

    if (!validChannelIds.has(srcChannelId)) {
      console.log("Skipping packet for channel: ", srcChannelId);
      continue;
    }

    const channel = openChannels.find((channel) => {
      return channel.channelId === srcChannelId && channel.portId === `polyibc.${srcChain}.${srcPortAddress.slice(2)}`;
    })
    if (!channel) {
      console.warn("No channel found for packet: ", srcChannelId, srcPortAddress);
      continue;
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
      sourceChain: channel.portId.split(".")[1] as CHAIN,
      destChain: channel.counterparty.portId.split(".")[1] as CHAIN,
    };
    unprocessedPacketKeys.add(key);
  }

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
  let ackLogs: Array<[ethers.EventLog, CHAIN]> = [];
  for (const srcChainContract of srcChainContracts) {
    const [contract, chain] = srcChainContract;
    const newAckLogs = (await contract.queryFilter('Acknowledgement', fromBlock, toBlock)) as Array<ethers.EventLog>;
    ackLogs = ackLogs.concat(newAckLogs.map((eventLog) => [eventLog, chain]));
  }

  for (const ackLog of ackLogs) {
    const [ackEvent, srcChain] = ackLog;
    let [srcPortAddress, srcChannelId, sequence] = ackEvent.args;
    const key = `${srcPortAddress}-${ethers.decodeBytes32String(srcChannelId)}-${sequence}`;
    if (packets[key]) {
      const srcProvider = srcChainProviders[srcChain];
      const srcBlock = await srcProvider.getBlock(ackEvent.blockNumber);
      if (srcBlock!.timestamp < packets[key].createTime) {
        continue;
      }

      packets[key].endTime = srcBlock!.timestamp;
      packets[key].state = PacketStates.ACK;
      packets[key].ackTx = ackEvent.transactionHash;
      unprocessedPacketKeys.delete(key);
    } else {
      console.log("No packet found for ack: ", key);
    }
  }

  // Set up providers and contracts to interact with the destination chains
  let destChainProviders: Record<CHAIN, CachingJsonRpcProvider> = {} as Record<CHAIN, CachingJsonRpcProvider>;
  let destChainContracts: Array<[ethers.Contract, CHAIN]> = [];
  for (const chain in CHAIN_CONFIGS) {
    const chainId = chain as CHAIN;
    const dispatcherAddresses = [dispatcher] ?? CHAIN_CONFIGS[chainId].dispatchers;
    for (const dispatcherAddress in dispatcherAddresses) {
      const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
      destChainProviders[chainId] = provider;
      const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);
      destChainContracts.push([contract, chainId]);
    }
  }

  // Match ack events on Polymer to packets
  for (const key of unprocessedPacketKeys) {
    const packet = packets[key];

    try {
      const ack = await tmClient.ibc.channel.packetAcknowledgement(packet.destPortAddress, packet.destChannelId, Number(packet.sequence));
      console.log("Ack: ", ack);
      if (ack.acknowledgement) {
        packet.state = PacketStates.POLY_WRITE_ACK;
        unprocessedPacketKeys.delete(key);
      }
    } catch (e) {
      return NextResponse.error();
    }
  }

  // It seems that due to short circuiting POLY_ACK_RECV can't be distinguished as a separate state so this state is skipped

  // Match any write ack events on destination chains to packets
  let writeAckLogs: Array<[ethers.EventLog, CHAIN]> = [];
  for (const destChainContract of destChainContracts) {
    const [destContract, destChain] = destChainContract;
    const newWriteAckLogs = (await destContract.queryFilter('WriteAckPacket', 1, "latest")) as Array<ethers.EventLog>;
    writeAckLogs = writeAckLogs.concat(newWriteAckLogs.map((eventLog) => [eventLog, destChain]));
  }

  for (const writeAckLog of writeAckLogs) {
    const [writeAckEvent, destChain] = writeAckLog;
    const [receiver, destChannelId, sequence, ack] = writeAckEvent.args;

    const channel = openChannels.find((channel) => {
      return channel.counterparty.channelId === ethers.decodeBytes32String(destChannelId) && channel.counterparty.portId === `polyibc.${destChain}.${receiver.slice(2)}`;
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
  let recvPacketLogs: Array<[ethers.EventLog, CHAIN]> = [];
  for (const destChainContract of destChainContracts) {
    const [destContract, destChain] = destChainContract;
    const newRecvPacketLogs = (await destContract.queryFilter('RecvPacket', 1, "latest")) as Array<ethers.EventLog>;
    recvPacketLogs = recvPacketLogs.concat(newRecvPacketLogs.map((eventLog) => [eventLog, destChain]));
  }

  for (const recvPacketLog of recvPacketLogs) {
    const [recvPacketEvent, destChain] = recvPacketLog;
    const [destPortAddress, destChannelId, sequence] = recvPacketEvent.args;

    const channel = openChannels.find((channel) => {
      return channel.counterparty.channelId === ethers.decodeBytes32String(destChannelId) && channel.counterparty.portId === `polyibc.${destChain}.${destPortAddress.slice(2)}`;
    })

    if (!channel) {
      console.log("Unable to find channel for recv packet: ", destChannelId, "receiver: ", destPortAddress);
      continue;
    }

    const key = `0x${channel.portId.split(".")[2]}-${channel.channelId}-${sequence}`;
    const recvBlock = await destChainProviders[destChain].getBlock(recvPacketEvent.blockNumber);

    if (recvBlock!.timestamp < packets[key].createTime) {
      continue;
    }

    if (key in unprocessedPacketKeys) {
      packets[key].state = PacketStates.RECV;
      unprocessedPacketKeys.delete(key);
    }

    if (packets[key]) {
      packets[key].rcvTx = recvPacketEvent.transactionHash;
    }
  }

  // Match any write ack events on Polymer to packets
  for (const key of unprocessedPacketKeys) {
    const packet = packets[key];

    try {
      const packetCommitment = await tmClient.ibc.channel.packetCommitment(packet.sourcePortAddress, packet.sourceChannelId, Number(packet.sequence));
      console.log("Packet commitment: ", packetCommitment);
      if (packetCommitment.commitment) {
        packet.state = PacketStates.POLY_WRITE_ACK;
        unprocessedPacketKeys.delete(key);
      }
    } catch (e) {
      return NextResponse.error();
    }
  }

  // Match any recv packet events on Polymer to packets
  for (const key of unprocessedPacketKeys) {
    const packet = packets[key]

    const packetReceipt = await tmClient.ibc.channel.packetReceipt(packet.destPortAddress, packet.destChannelId, Number(packet.sequence));
    if (packetReceipt.received) {
      packet.state = PacketStates.POLY_RECV;
      unprocessedPacketKeys.delete(key);
    }
  }

  const response: Packet[] = [];
  Object.keys(packets).forEach((key) => {
    response.push(packets[key]);
  });
  return NextResponse.json(response);
}
