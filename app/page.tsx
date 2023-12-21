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
    Promise.all(Object.keys(CHAIN_CONFIGS).map(async (chain) => {
      const blockTime = CHAIN_CONFIGS[chain as CHAIN].blockTime;
      const latestBlock = await getLatestBlock(chain as CHAIN);

      const blockStartNumber = calculateBlockNumber(dateRange[0].getTime() / 1000, latestBlock!, blockTime);
      const blockEndNumber = calculateBlockNumber(dateRange[1].getTime() / 1000, latestBlock!, blockTime);

      console.log(`Block Number for ${chain} for Start Date: ${blockStartNumber}`);
      console.log(`Block Number for ${chain} End Date ${blockEndNumber}`);


      const response = await fetch(`/api/metrics?from=${blockStartNumber}&to=${blockEndNumber}&chain=${chain}`);
      const evmData: EvmData[] = await response.json()

      const statsTemplate = {
        txLatency: `${_.capitalize(chain)} E2E Tx Latency in seconds`,
        ackTransactionCost: `${_.capitalize(chain)} Ack Gas Cost in gwei`,
        sendPacketTransactionCost: `${_.capitalize(chain)} Send Packet Gas Cost in gwei`,
      }

      return Object.keys(statsTemplate).map((key) => {
        const title = statsTemplate[key as keyof typeof statsTemplate];
        const data = _.map(evmData, key);

        const stats = calculateStats(data);

        return {
          category: title,
          stat: data.length,
          data: [
            {name: "Avg", value: stats.avg},
            {name: "Min", value: stats.min},
            {name: "Median", value: stats.median},
            {name: "Max", value: stats.max},
          ],
        };
      });
    })).then((data) => {
      setIsLoading(false);
      setData(_.flatten(data));
    });
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
      <Divider>Filter</Divider>
      <DateTimeRangePicker onRangeChange={handleRangeChange} initialStartDate={startOfDay} initialEndDate={now}/>
      <Divider>KPI</Divider>
      <Card className="max-w-xs" decoration="top" decorationColor="slate">
        <Text>Connected chains</Text>
        <Metric>{Object.keys(CHAIN_CONFIGS).length}</Metric>
      </Card>
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

