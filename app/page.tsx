'use client';

import React, { useEffect, useState } from 'react';
import { BarList, Card, Divider, Flex, Grid, Metric, Text, Title } from '@tremor/react';
import * as stats from 'stats-lite';
import { CHAIN, CHAIN_CONFIGS, getLatestBlock } from "./chains";
import DateTimeRangePicker from "./components/DateTimePicker";
import { Block } from "ethers";
import _ from "lodash";
import { Spinner } from "@nextui-org/react";
import { EvmData } from "./api/metrics/route";

const calculateStats = (latencies: number[]): {
  avg: number;
  min: number;
  median: number;
  max: number;
} => {
  const avg = stats.mean(latencies);
  const min = Math.min(...latencies);
  const median = stats.median(latencies);
  const max = Math.max(...latencies);

  return {avg, min, median, max};
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
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

  const [dateRange, setDateRange] = useState<[Date, Date]>([startOfDay, now]);
  const [data, setData] = useState<MetricData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const newData = await Promise.all(Object.keys(CHAIN_CONFIGS).map(async (chain) => {
      // Assuming block time is 2 seconds
      const blockTime = 2;

      const latestBlock = await getLatestBlock(chain as CHAIN);

      const blockStartNumber = calculateBlockNumber(dateRange[0].getTime() / 1000, latestBlock!, blockTime);
      const blockEndNumber = calculateBlockNumber(dateRange[1].getTime() / 1000, latestBlock!, blockTime);

      console.log(`Block Number for ${chain} for Start Date: ${blockStartNumber}`);
      console.log(`Block Number for ${chain} End Date ${blockEndNumber}`);


      const response = await fetch(`/api/metrics?from=${blockStartNumber}&to=${blockEndNumber}&chain=${chain}`);
      const evmData: EvmData[] = await response.json()
      const latencyStats = calculateStats(_.map(evmData, 'txLatency'))

      const latencies = [
        {name: "Avg", value: latencyStats.avg},
        {name: "Min", value: latencyStats.min},
        {name: "Median", value: latencyStats.median},
        {name: "Max", value: latencyStats.max},
      ];

      return {
        category: `${_.capitalize(chain)} E2E Tx Latency in seconds`,
        stat: evmData.length,
        data: latencies,
      };
    }));

    setIsLoading(false);
    setData(newData);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [dateRange]);

  const handleRangeChange = async (newStartDate: Date, newEndDate: Date) => {
    setDateRange([newStartDate, newEndDate])
  };

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <DateTimeRangePicker onRangeChange={handleRangeChange} initialStartDate={startOfDay} initialEndDate={now}/>
      <Divider>Sepolia</Divider>
      {isLoading && <Spinner label="Loading..."/>}
      {!isLoading &&
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
      }
    </main>
  );
};

export default MetricsPage;

