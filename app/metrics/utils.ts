import * as stats from 'stats-lite';
import _ from 'lodash';
import { CHAIN, CHAIN_CONFIGS } from 'utils/chains/configs';
import { PacketData } from 'api/metrics/helpers';
import logger from 'utils/logger';

export const calculateStats = (
  latencies: number[]
): {
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

export async function calcMetrics(baseUrl: string = '', chainId: string) {
  const results = await Promise.all(
    Object.keys(CHAIN_CONFIGS).map(async (chainKey) => {
      const chainConfig = CHAIN_CONFIGS[chainKey as CHAIN];

      return await Promise.all(chainConfig.clients.map(async (client, i) => {
        let dispatcherAddress = chainConfig.dispatchers[i];

        let response;
        const requestUrl = baseUrl + `/api/metrics?chain=${chainKey}&dispatcher=${dispatcherAddress}&chainId=${chainId}`;
        try {
          response = await fetch(requestUrl);
        } catch (error) {
          logger.error(`Failed to fetch metrics for chain ${chainKey}: ` + error);
          return []; // Skip this chain's metrics calculation on error
        }
        const evmData: PacketData[] = await response.json();

        const statsTemplate = {
          txLatency: `${_.capitalize(chainKey)} E2E Tx Latency in seconds`,
          ackTransactionCost: `${_.capitalize(chainKey)} Ack Gas Cost in gwei`,
          sendPacketTransactionCost: `${_.capitalize(chainKey)} Send Packet Gas Cost in gwei`
        };

        return Object.keys(statsTemplate).map((key) => {
          const title = statsTemplate[key as keyof typeof statsTemplate];
          const data = _.map(evmData, key);

          const stats = calculateStats(data);

          return {
            key: key,
            category: title,
            chain: chainKey,
            client: client,
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
    })
  );

  // Flatten the array of results for each chain
  return results.flat();
}
