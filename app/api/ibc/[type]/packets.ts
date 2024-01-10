import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import { CHAIN, CHAIN_CONFIGS } from "../../../chains";
import CachingJsonRpcProvider from "../../metrics/provider";
import Abi from "../../../contracts/Dispatcher.json";
import { getChannels } from "./ibc";


export const dynamic = 'force-dynamic' // defaults to auto

export interface PacketData {
  sequence: string;
  sourcePortAddress: string;
  sourceChannelId: string;
  timeout: string;
  fee: string;
  id: string;
  state: string;
  createTime: number;
  endTime?: number;
  sendTx: string;
  rcvTx?: string;
  ackTx?: string;
  sourceChain: string;
  destChain: string;
}

interface Channel {
  version: string;
  ordering: string; // Adjust the type based on your ChannelOrder type
  feeEnabled: boolean;
  connectionHops: string[];
  counterpartyPortId: string;
  counterpartyChannelId: string; // Assuming bytes32 is represented as a string
}

export async function getPackets(request: NextRequest, apiUrl: string) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const chainFrom = searchParams.get('chainFrom')
  const chainTo = searchParams.get('chainTo')
  const dispatcher = searchParams.get('dispatcher')

  if (!from || !chainFrom || !chainTo) {
    return NextResponse.error()
  }

  const channels = await getChannels(apiUrl)
  const openChannels = channels.filter((channel) => {
    return channel.state === "STATE_OPEN" && channel.port_id.startsWith(`polyibc.${chainFrom}.`) && channel.counterparty.port_id.startsWith(`polyibc.${chainTo}.`)
  })

  if (openChannels.length === 0) {
    return []
  }

  console.log(openChannels)

  const fromBlock = Number(from)
  const toBlock = to ? Number(to) : "latest"
  const chainFromId = chainFrom as CHAIN
  const chainToId = chainTo as CHAIN
  const dispatcherFromAddress = dispatcher ?? CHAIN_CONFIGS[chainFromId].dispatcher;
  const dispatcherToAddress = CHAIN_CONFIGS[chainToId].dispatcher;

  const providerFrom = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainFromId].rpc, CHAIN_CONFIGS[chainFromId].id);
  const providerTo = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainToId].rpc, CHAIN_CONFIGS[chainToId].id);
  const contractFrom = new ethers.Contract(dispatcherFromAddress, Abi.abi, providerFrom);
  const contractTo = new ethers.Contract(dispatcherToAddress, Abi.abi, providerTo);

  const ackLogs = (await contractFrom.queryFilter('Acknowledgement', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const sendPacketLogs = (await contractFrom.queryFilter('SendPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const recvPacketLogs = (await contractTo.queryFilter('RecvPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;
  // const connectChannelLogs = (await contractFrom.queryFilter('ConnectIbcChannel', fromBlock, toBlock)) as Array<ethers.EventLog>;

  // console.log("ackLogs: ", ackLogs, "sendPacketLogs: ", sendPacketLogs, "recvPacketLogs: ", recvPacketLogs)
  // console.log("connectChannelLogs: ", connectChannelLogs)

  const packets: Record<string, PacketData> = {};
  for (const sendPacketLog of sendPacketLogs) {
    // console.log("sendPacketLog: ", sendPacketLog)
    const [sourcePortAddress, sourceChannelId, packet, sequence, timeout, fee] = sendPacketLog.args;
    const key = `${sourcePortAddress}-${sourceChannelId}-${sequence}`;

    const blockFrom = await providerFrom.getBlock(sendPacketLog.blockNumber)


    packets[key] = {
      sourcePortAddress,
      sourceChannelId: ethers.decodeBytes32String(sourceChannelId),
      fee,
      sequence: sequence.toString(),
      timeout: timeout.toString(),
      id: key,
      state: "SENT",
      createTime: blockFrom!.timestamp,
      sendTx: sendPacketLog.transactionHash,
      sourceChain: chainFromId,
      destChain: chainToId,
    };
  }

  // console.log("packets: ", packets)

  // for (const recvPacketLog of recvPacketLogs) {
  //   const [destPortAddress, destChannelId, sequence] = recvPacketLog.args;
  //   console.log("destPortAddress: ", destPortAddress, "destChannelId: ", destChannelId, "sequence: ", sequence)
  //   const channelValue = await contractFrom.portChannelMap(destPortAddress, destChannelId)
  //   const channel: Channel = {
  //     version: channelValue.version,
  //     ordering: channelValue.ordering, // Adjust the field name based on the actual field name in your contract
  //     feeEnabled: channelValue.feeEnabled,
  //     connectionHops: channelValue.connectionHops,
  //     counterpartyPortId: channelValue.counterpartyPortId.split(".")[2],
  //     counterpartyChannelId: ethers.hexlify(channelValue.counterpartyChannelId), // Convert bytes32 to hex string
  //   };
  //   console.log("channel: ", channel)
  //
  //   const key = `${channel.counterpartyPortId}-${channel.counterpartyChannelId}-${sequence}`;
  //   if (packets[key]) {
  //     packets[key].state = "RECV";
  //   }
  // }

  for (const ackLog of ackLogs) {
    const [sourcePortAddress, sourceChannelId, sequence] = ackLog.args;
    const key = `${sourcePortAddress}-${sourceChannelId}-${sequence}`;
    if (packets[key]) {
      const blockFrom = await providerFrom.getBlock(ackLog.blockNumber)
      packets[key].endTime = blockFrom!.timestamp;
      packets[key].state = "ACK";
      packets[key].ackTx = ackLog.transactionHash;
    }
  }


  const response: PacketData[] = [];
  Object.keys(packets).forEach((key) => {
    response.push(packets[key]);
  });
  return response
}