'use client';

// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import { Card, Metric, Text, Title, BarList, Flex, Grid, Divider } from '@tremor/react';
import * as stats from 'stats-lite';
import { fetchEvmData, getLatestBlock } from "./events";
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

const MetricsPage: React.FC = () => {
  const [blockRange, setBlockRange] = useState<[number, number]>([0, 0]);
  const [data, setData] = useState<MetricData[]>([
    {
      category: 'Optimism Tx Latency in seconds',
      stat: 0,
      data: [],
    },
  ]);

  const fetchData = async () => {
    const txLatencies = await fetchEvmData(...blockRange, 'Optimism');
    const latencyStats = calculateStats(txLatencies);

    const latencies = [
      {name: "Avg", value: latencyStats.avg},
      {name: "Min", value: latencyStats.min},
      {name: "Median", value: latencyStats.median},
    ];

    setData([
      {
        category: 'E2E Tx Latency in seconds',
        stat: txLatencies.length,
        data: latencies,
      },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [blockRange]);

  const handleRangeChange = async (newStartDate: Date, newEndDate: Date) => {
    console.log('Range Changed:', newStartDate, 'to', newEndDate);

    // Assuming block time is 2 seconds
    const blockTime = 2;

    const latestBlock = await getLatestBlock();

    const blockStartNumber = calculateBlockNumber(newStartDate.getTime() / 1000, latestBlock!, blockTime);
    const blockEndNumber = calculateBlockNumber(newEndDate.getTime() / 1000, latestBlock!, blockTime);

    console.log('Block Number for Start Date:', blockStartNumber);
    console.log('Block Number for End Date:', blockEndNumber);
    setBlockRange([blockStartNumber, blockEndNumber]);
  };

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">

      <DateTimeRangePicker onRangeChange={handleRangeChange}/>
      <Divider>Optimism Sepolia</Divider>
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

