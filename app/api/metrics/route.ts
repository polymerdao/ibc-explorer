import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import Abi from 'utils/dispatcher.json';
import { CHAIN, CHAIN_CONFIGS } from 'utils/chains/configs';
import { CachingJsonRpcProvider } from 'api/utils/provider';
import { getConcurrencyLimit } from 'api/utils/helpers';
import { pLimit } from 'plimit-lit';

export const dynamic = 'force-dynamic'; // defaults to auto

const limit = pLimit(getConcurrencyLimit()); // Adjust this number to the maximum concurrency you want

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const chain = searchParams.get('chain');
  const dispatcher = searchParams.get('dispatcher');

  if (!from || !to || !chain) {
    return NextResponse.error();
  }

  const fromBlock = Number(from);
  const toBlock = Number(to);
  const chainId = chain as CHAIN;
  const evmData = await fetchEvmData(fromBlock, toBlock, chainId, dispatcher!);
  return Response.json(evmData);
}

const createLogPairs = (ackLogs: Array<ethers.EventLog>, sendPacketLogs: Array<ethers.EventLog>) => {
  const logPairs: {
    ackLog: ethers.EventLog;
    sendPacketLog: ethers.EventLog;
  }[] = [];

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
      if (ackLog.blockNumber > sendPacketLog.blockNumber) {
        logPairs.push({ ackLog, sendPacketLog });
      }
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

  const [ackLogs, sendPacketLogs] = await Promise.all([
    contract.queryFilter('Acknowledgement', fromBlock, toBlock) as Promise<Array<ethers.EventLog>>,
    contract.queryFilter('SendPacket', fromBlock, toBlock) as Promise<Array<ethers.EventLog>>
  ]);

  console.log(`Found ${ackLogs.length} Acknowledgement logs and ${sendPacketLogs.length} SendPacket logs for chain ${chainId} and dispatcher ${dispatcherAddress}`);

  const logPairs = createLogPairs(ackLogs, sendPacketLogs);

  const transactionDataPromises = logPairs.map((pair) => limit(async () => {
    const [endBlock, startBlock, ackTx, sendPacketTx] = await Promise.all([
      provider.getBlock(pair.ackLog.blockNumber),
      provider.getBlock(pair.sendPacketLog.blockNumber),
      provider.getTransactionReceipt(pair.ackLog.transactionHash),
      provider.getTransactionReceipt(pair.sendPacketLog.transactionHash)
    ]);

    const end = endBlock?.timestamp!;
    const start = startBlock?.timestamp!;
    const txLatency = end - start;

    // Calculate gas costs for Acknowledgement transaction
    const ackGasUsed = ackTx!.gasUsed;
    const ackGasPrice = ackTx!.gasPrice;
    const ackTransactionCost = Number(ethers.formatUnits(ackGasUsed * ackGasPrice, 'gwei'));

    // Calculate gas costs for SendPacket transaction
    const sendPacketGasUsed = sendPacketTx!.gasUsed;
    const sendPacketGasPrice = sendPacketTx!.gasPrice;
    const sendPacketTransactionCost = Number(ethers.formatUnits(sendPacketGasUsed * sendPacketGasPrice, 'gwei'));

    return {
      txLatency,
      ackTransactionCost,
      sendPacketTransactionCost
    };
  }));

  const transactionData: EvmData[] = await Promise.all(transactionDataPromises);
  return transactionData;
}
