import { ethers } from "ethers";
import CachingJsonRpcProvider from "./provider";
import Abi from "../../contracts/Dispatcher.json";
import { CHAIN, CHAIN_CONFIGS } from "../../chains";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: NextRequest) {
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
  const evmData = await fetchEvmData(fromBlock, toBlock, chainId, dispatcherAddress);
  return Response.json(evmData)
}


const createLogPairs = (ackLogs: Array<ethers.EventLog>, sendPacketLogs: Array<ethers.EventLog>) => {
  const logPairs: {
    ackLog: ethers.EventLog;
    sendPacketLog: ethers.EventLog;
  }[] = []

  // Organize ackLogs by port address, channel ID, and sequence
  const ackLogsMap: Map<string, ethers.EventLog> = new Map();
  ackLogs.forEach((log) => {
    const [sourcePortAddress, sourceChannelId, sequence] = log.args;
    const key = `${sourcePortAddress}-${sourceChannelId}-${sequence}`;
    ackLogsMap.set(key, log);
  });

  // Check sendPacketLogs against ackLogsMap and create pairs
  sendPacketLogs.forEach((sendPacketLog) => {
    const [sourcePortAddress, sourceChannelId, packet, sequence, timeout, fee] = sendPacketLog.args;
    const key = `${sourcePortAddress}-${sourceChannelId}-${sequence}`;

    if (ackLogsMap.has(key)) {
      const ackLog = ackLogsMap.get(key)!;
      logPairs.push({ackLog, sendPacketLog});
    }
  });

  return logPairs;
};


export interface EvmData {
  txLatency: number;
  ackTransactionCost: number;
  sendPacketTransactionCost: number;
}

async function fetchEvmData(fromBlock: number, toBlock: number, chainId: CHAIN, dispatcherAddress: string) {
  console.log(`Fetching EVM data from block ${fromBlock} to ${toBlock} using chain ${chainId} and dispatcher ${dispatcherAddress}`);
  const provider = new CachingJsonRpcProvider(CHAIN_CONFIGS[chainId].rpc, CHAIN_CONFIGS[chainId].id);
  const contract = new ethers.Contract(dispatcherAddress, Abi.abi, provider);

  const ackLogs = (await contract.queryFilter('Acknowledgement', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const sendPacketLogs = (await contract.queryFilter('SendPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;
  console.log(`Found ${ackLogs.length} Acknowledgement logs and ${sendPacketLogs.length} SendPacket logs`)

  const logPairs = createLogPairs(ackLogs, sendPacketLogs);

  const transactionData: EvmData[] = [];

  for (let i = 0; i < logPairs.length; i++) {
    const pair = logPairs[i];
    const end = (await provider.getBlock(pair.ackLog.blockNumber))?.timestamp!
    const start = (await provider.getBlock(pair.sendPacketLog.blockNumber))?.timestamp!

    const txLatency = end - start

    // Calculate gas costs for Acknowledgement transaction
    const ackTx = await provider.getTransactionReceipt(pair.ackLog.transactionHash);
    const ackGasUsed = ackTx!.gasUsed;
    const ackGasPrice = ackTx!.gasPrice;
    const ackTransactionCost = Number(ethers.formatUnits(ackGasUsed * ackGasPrice, "gwei"));

    // Calculate gas costs for SendPacket transaction
    const sendPacketTx = await provider.getTransactionReceipt(pair.sendPacketLog.transactionHash);
    const sendPacketGasUsed = sendPacketTx!.gasUsed;
    const sendPacketGasPrice = sendPacketTx!.gasPrice;
    const sendPacketTransactionCost = Number(ethers.formatUnits(sendPacketGasUsed * sendPacketGasPrice, "gwei"));


    transactionData.push({
      txLatency,
      ackTransactionCost,
      sendPacketTransactionCost,
    });
  }
  return transactionData
}
