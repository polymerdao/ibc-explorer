import { Card, Metric, Text, Title, BarList, Flex, Grid } from '@tremor/react';
import * as stats from 'stats-lite';
import { fetchEvmData } from "./events";


const calculateStats = (latencies: number[]): { avg: number; min: number; median: number } => {
  const avg = stats.mean(latencies);
  const min = Math.min(...latencies);
  const median = stats.median(latencies);

  return {avg, min, median};
};


export default async function MetricsPage() {

  const txLatencies = await fetchEvmData(5340727, 5437287)
  const latencyStats = calculateStats(txLatencies);

  let latencies = [];
  latencies.push({name: "Avg", value: latencyStats.avg})
  latencies.push({name: "Min", value: latencyStats.min})
  latencies.push({name: "Median", value: latencyStats.median})

  const data = [
    {
      category: 'Optimism Tx Latency',
      stat: txLatencies.length,
      data: latencies
    },
  ];


  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
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
              <Text>Total packets</Text>
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
}
