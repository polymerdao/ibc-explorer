import { Block } from 'ethers';
import * as stats from 'stats-lite';
import { CHAIN, CHAIN_CONFIGS, getLatestBlock } from './chains';
import { EvmData } from './api/metrics/route';
import _ from 'lodash';

export const calculateBlockNumber = (timestamp: number, latestBlock: Block, blockTime: number) => {
  return Math.ceil(latestBlock.number - (latestBlock.timestamp - timestamp) / blockTime);
};
export const calculateStats = (latencies: number[]): {
  avg: number;
  min: number;
  median: number;
  max: number;
} => {
  const avg = stats.mean(latencies);
  const min = Math.min(...latencies);
  const median = stats.median(latencies);
  const max = Math.max(...latencies);

  return { avg, min, median, max };
};

export async function calcMetrics(dateRange: [Date, Date], origin: string= '') {
  return await Promise.all(Object.keys(CHAIN_CONFIGS).map(async (chain) => {
    const blockTime = CHAIN_CONFIGS[chain as CHAIN].blockTime;
    const latestBlock = await getLatestBlock(chain as CHAIN);

    const blockStartNumber = calculateBlockNumber(dateRange[0].getTime() / 1000, latestBlock!, blockTime);
    const blockEndNumber = calculateBlockNumber(dateRange[1].getTime() / 1000, latestBlock!, blockTime);

    console.log(`Block Number for ${chain} for Start Date: ${blockStartNumber}`);
    console.log(`Block Number for ${chain} End Date ${blockEndNumber}`);

    let response;
    try {
      response = await fetch(`${origin}/api/metrics?from=${blockStartNumber}&to=${blockEndNumber}&chain=${chain}`);
    } catch (error) {
      console.error(`Failed to fetch metrics for chain ${chain} origin ${origin}:`, error);
      return []; // Skip this chain's metrics calculation on error
    }
    const evmData: EvmData[] = await response.json();

    const statsTemplate = {
      txLatency: `${_.capitalize(chain)} E2E Tx Latency in seconds`,
      ackTransactionCost: `${_.capitalize(chain)} Ack Gas Cost in gwei`,
      sendPacketTransactionCost: `${_.capitalize(chain)} Send Packet Gas Cost in gwei`
    };

    return Object.keys(statsTemplate).map((key) => {
      const title = statsTemplate[key as keyof typeof statsTemplate];
      const data = _.map(evmData, key);

      const stats = calculateStats(data);

      return {
        key: key,
        category: title,
        chain: chain,
        stat: data.length,
        data: [
          { name: 'Avg', value: stats.avg },
          { name: 'Min', value: stats.min },
          { name: 'Median', value: stats.median },
          { name: 'Max', value: stats.max }
        ]
      };
    });
  }));
}