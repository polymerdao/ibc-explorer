import { ethers } from "ethers";
// import CachingJsonRpcProvider from "./provider";
// import Abi from "../../contracts/Dispatcher.json";
import { NextRequest, NextResponse } from "next/server";
import { CHAIN, CHAIN_CONFIGS } from "../../../chains";
import CachingJsonRpcProvider from "../../metrics/provider";
import Abi from "../../../contracts/Dispatcher.json";


export const dynamic = 'force-dynamic' // defaults to auto

export interface PacketData {
  sequence: string;
  sourcePortAddress: string;
  sourceChannelId: string;
  packet: string;
  timeout: string;
  fee: string;
  id: string;
  state: string;
}

export async function getPackets(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const chainFrom = searchParams.get('chainFrom')
  const chainTo = searchParams.get('chainTo')
  const dispatcher = searchParams.get('dispatcher')

  if (!from || !chainFrom || !chainTo) {
    return NextResponse.error()
  }

  const fromBlock = Number(from)
  const toBlock = to ? Number(to) : "latest"
  const chainFromId = chainFrom as CHAIN
  const chainToId = chainTo as CHAIN
  const dispatcherFromAddress = dispatcher ?? CHAIN_CONFIGS[chainFromId].dispatcher;

  const providerFrom = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainFromId].rpc, CHAIN_CONFIGS[chainFromId].id);
  const contractFrom = new ethers.Contract(dispatcherFromAddress, Abi.abi, providerFrom);

  const ackLogs = (await contractFrom.queryFilter('Acknowledgement', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const sendPacketLogs = (await contractFrom.queryFilter('SendPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const recvPacketLogs = (await contractFrom.queryFilter('RecvPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;

  console.log("ackLogs: ", ackLogs, "sendPacketLogs: ", sendPacketLogs, "recvPacketLogs: ", recvPacketLogs)

  const response: PacketData[] = []
  sendPacketLogs.forEach((sendPacketLog) => {
    const [sourcePortAddress, sourceChannelId, packet, sequence, timeout, fee] = sendPacketLog.args;
    const key = `${sourcePortAddress}-${sourceChannelId}-${sequence}`;
    response.push({
      sourcePortAddress,
      sourceChannelId,
      packet,
      fee,
      sequence: sequence.toString(),
      timeout: timeout.toString(),
      id: key,
      state: "SENT"
    })
  });


  return Response.json(response)
}