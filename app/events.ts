import { ethers, Networkish } from "ethers";
import Abi from "./contracts/Dispatcher.json"

export type CHAIN = 'Optimism' | 'Base';

const CHAIN_IDS: {
  [key in CHAIN]: { id: number; rpc: string };
} = {
  Optimism: {
    id: 11155420,
    rpc: "https://opt-sepolia.g.alchemy.com/v2/RN7slh_2cUIuzhxo4M9VgYCbqRcPOmkJ"
  },
  Base: {
    id: 84532,
    rpc: "https://base-sepolia.g.alchemy.com/v2/zGVxj0T-xvSR29_t7MlIhqRskkSwugVM"
  }
};

const DISPATCHER_ADDRESSES: { [key in CHAIN]: string } = {
  Optimism: '0x7a1d713f80BFE692D7b4Baa4081204C49735441E',
  Base: '0xab6AEF0311954C40AcD4D1DED56CAAE9cc074975'
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


export async function fetchEvmData(fromBlock: number, toBlock: number, chainId: CHAIN) {
  console.log(`Fetching EVM data from block ${fromBlock} to ${toBlock}`);
  const provider = new ethers.JsonRpcProvider(CHAIN_IDS[chainId].rpc, CHAIN_IDS[chainId].id);

  if (!(chainId in DISPATCHER_ADDRESSES)) {
    throw new Error(`Dispatcher address not found for chainId: ${chainId}`);
  }

  const contract = new ethers.Contract(DISPATCHER_ADDRESSES[chainId], Abi.abi, provider);

  const ackLogs = (await contract.queryFilter('Acknowledgement', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const sendPacketLogs = (await contract.queryFilter('SendPacket', fromBlock, toBlock)) as Array<ethers.EventLog>;
  const logPairs = createLogPairs(ackLogs, sendPacketLogs);

  let txLatencies: number[] = [];
  for (let i = 0; i < logPairs.length; i++) {
    const pair = logPairs[i];
    const end = (await provider.getBlock(pair.ackLog.blockNumber))?.timestamp!
    const start = (await provider.getBlock(pair.sendPacketLog.blockNumber))?.timestamp!

    const txLatency = end - start
    txLatencies.push(txLatency);
  }
  return txLatencies
}


export async function getLatestBlock(chainId: CHAIN) {
  const provider = new ethers.JsonRpcProvider(CHAIN_IDS[chainId].rpc);
  return await provider.getBlock("latest");
}
