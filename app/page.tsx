'use client';

// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import { Card, Metric, Text, Title, BarList, Flex, Grid, Divider } from '@tremor/react';
import * as stats from 'stats-lite';
import { CHAIN, fetchEvmData, getLatestBlock } from "./events";
import DateTimeRangePicker from "./components/DateTimePicker";
import { Block } from "ethers";

const calculateStats = (latencies: number[]): {
  avg: number;
  min: number;
  median: number
} => {
  const avg = stats.mean(latencies);
  const min = Math.min(...latencies);
  const median = stats.median(latencies);

  return {avg, min, median};
};

const calculateBlockNumber = (timestamp: number, latestBlock: Block, blockTime: number) => {
  return Math.ceil(latestBlock.number - (latestBlock.timestamp - timestamp) / blockTime);
};

interface MetricData {
  category: string;
  stat: number;
  data: {
    name: string;
    value: number
  }[];
}

const CHAINS: CHAIN[] = ['Optimism', 'Base'];

const MetricsPage: React.FC = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const [dateRange, setDateRange] = useState<[Date, Date]>([startOfDay, now]);
  const [data, setData] = useState<MetricData[]>([]);

  const fetchData = async () => {
    const newData = await Promise.all(CHAINS.map(async (chain) => {
      // Assuming block time is 2 seconds
      const blockTime = 2;

      const latestBlock = await getLatestBlock(chain);

      const blockStartNumber = calculateBlockNumber(dateRange[0].getTime() / 1000, latestBlock!, blockTime);
      const blockEndNumber = calculateBlockNumber(dateRange[1].getTime() / 1000, latestBlock!, blockTime);

      console.log(`Block Number for ${chain} for Start Date: ${blockStartNumber}`);
      console.log(`Block Number for ${chain} End Date ${blockEndNumber}`);


      const txLatencies = await fetchEvmData(blockStartNumber, blockEndNumber, chain);
      const latencyStats = calculateStats(txLatencies);

      const latencies = [
        { name: "Avg", value: latencyStats.avg },
        { name: "Min", value: latencyStats.min },
        { name: "Median", value: latencyStats.median },
      ];

      return {
        category: `${chain} E2E Tx Latency in seconds`,
        stat: txLatencies.length,
        data: latencies,
      };
    }));

    setData(newData);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleRangeChange = async (newStartDate: Date, newEndDate: Date) => {
    setDateRange([newStartDate, newEndDate])
  };

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <DateTimeRangePicker onRangeChange={handleRangeChange} initialStartDate={startOfDay} initialEndDate={now}/>
      <Divider>Sepolia</Divider>
      <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
        {data.map((item) => (
          <Card key={item.category}>
            <Title>{item.category}</Title>
            <Flex
              justifyContent="start"
              alignItems="baseline"
              className="space-x-2"
            >
              <Metric>{item.stat}</Metric>
              <Text>Total packets </Text>
            </Flex>
            <Flex className="mt-6">
              <Text>Statistics</Text>
              <Text className="text-right">Value</Text>
            </Flex>
            <BarList
              data={item.data}
              valueFormatter={(number: number) =>
                Intl.NumberFormat('us').format(number).toString()
              }
              className="mt-2"
            />
          </Card>
        ))}
      </Grid>
    </main>
  );
};

export default MetricsPage;

