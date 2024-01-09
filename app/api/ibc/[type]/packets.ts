import { ethers } from "ethers";
// import CachingJsonRpcProvider from "./provider";
// import Abi from "../../contracts/Dispatcher.json";
import { NextRequest, NextResponse } from "next/server";
import { CHAIN, CHAIN_CONFIGS } from "../../../chains";
import CachingJsonRpcProvider from "../../metrics/provider";
import Abi from "../../../contracts/Dispatcher.json";


export const dynamic = 'force-dynamic' // defaults to auto

export async function getPackets(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const chain = searchParams.get('chain')
  const dispatcher = searchParams.get('dispatcher')

  if (!from || !to || !chain) {
    return NextResponse.error()
  }

  const fromBlock = Number(from)
  const toBlock = Number(to)
  const chainId = chain as CHAIN
  const dispatcherAddress = dispatcher ?? CHAIN_CONFIGS[chainId].dispatcher;

  const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
  const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);

  const ackLogs = (await contract.queryFilter('Acknowledgement', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const sendPacketLogs = (await contract.queryFilter('SendPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const recvPacketLogs = (await contract.queryFilter('RecvPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;

  console.log("ackLogs: ", ackLogs, "sendPacketLogs: ", sendPacketLogs, "recvPacketLogs: ", recvPacketLogs)

  return Response.json({dispatcherAddress})
}