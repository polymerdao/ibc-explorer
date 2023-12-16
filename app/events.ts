import { ethers } from "ethers";
import Abi from "./contracts/Dispatcher.json"

const createLogPairs = (ackLogs: Array<ethers.EventLog>, sendPacketLogs: Array<ethers.EventLog>) => {
  const logPairs: { ackLog: ethers.EventLog; sendPacketLog: ethers.EventLog; }[] = []

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

export async function fetchEvmData(fromBlock: number, toBlock: number) {
  const provider = new ethers.JsonRpcProvider('https://opt-sepolia.g.alchemy.com/v2/RN7slh_2cUIuzhxo4M9VgYCbqRcPOmkJ', 11155420);

  const contractAddress = '0x7a1d713f80BFE692D7b4Baa4081204C49735441E';
  const contract = new ethers.Contract(contractAddress, Abi.abi, provider);

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
