'use client';

import React, { useEffect, useState } from 'react';
import { BarList, Card, Divider, Flex, Grid, Metric, Text, Title } from '@tremor/react';
import { CHAIN_CONFIGS } from './chains';
import DateTimeRangePicker from './components/DateTimePicker';
import _ from 'lodash';
import { Spinner } from '@nextui-org/react';
import { IdentifiedChannel } from 'cosmjs-types/ibc/core/channel/v1/channel';
import { calcMetrics } from './utils';

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
  const [dapps, setDapps] = React.useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    fetch(`/api/ibc/channels`).then(res => res.json()).then(data => {
      let ports = new Set<string>();
      data.map((item: IdentifiedChannel) => {
        ports.add(item.portId);
        ports.add(item.counterparty.portId);
      });
      setDapps(ports.size);
    });
  }, [dateRange]);

  const fetchData = async () => {
    calcMetrics(dateRange).then((data) => {
      setData(_.flatten(data));
    }).catch((e) => {
      console.error('Failed to fetch metrics data:', e);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [dateRange]);

  const handleRangeChange = async (newStartDate: Date, newEndDate: Date) => {
    setDateRange([newStartDate, newEndDate]);
  };

  return (
    <main className='p-4 md:p-10 mx-auto max-w-7xl'>
      <Divider>Filter</Divider>
      <DateTimeRangePicker onRangeChange={handleRangeChange} initialStartDate={startOfDay} initialEndDate={now} />
      {isLoading && <Spinner label='Loading...' />}
      {!isLoading &&
        <>
          <Divider>KPI</Divider>
          <Grid numItemsSm={2} numItemsLg={3} className='gap-6'>
            <Card className='' decoration='top' decorationColor='slate'>
              <Text>Connected chains</Text>
              <Metric>{Object.keys(CHAIN_CONFIGS).length}</Metric>
            </Card>
            <Card className='' decoration='top' decorationColor='slate'>
              <Text>Number of DApps</Text>
              <Metric>{dapps}</Metric>
            </Card>
          </Grid>
          <Divider>Sepolia</Divider>
          <Grid numItemsSm={2} numItemsLg={3} className='gap-6'>
            {data.map((item) => (
              <Card key={item.category}>
                <Title>{item.category}</Title>
                <Flex
                  justifyContent='start'
                  alignItems='baseline'
                  className='space-x-2'
                >
                  <Metric>{item.stat}</Metric>
                  <Text>Total packets </Text>
                </Flex>
                <Flex className='mt-6'>
                  <Text>Statistics</Text>
                  <Text className='text-right'>Value</Text>
                </Flex>
                <BarList
                  data={item.data}
                  valueFormatter={(number: number) =>
                    Intl.NumberFormat('us').format(number).toString()
                  }
                  className='mt-2'
                />
              </Card>
            ))}
          </Grid>
        </>
      }
    </main>
  );
};

export default MetricsPage;

