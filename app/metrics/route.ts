import { register, Gauge } from 'prom-client';
import { calcMetrics } from './utils';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto

let gauges: { [key: string]: Gauge } = {};

export async function GET(request: NextRequest) {
  const now = new Date();
  const oneHourAgo = new Date();
  oneHourAgo.setHours(now.getHours() - 1);

  let metrics;
  try {
    metrics = await calcMetrics(
      [oneHourAgo, now],
      'http://' + request.nextUrl.host
    );
  } catch (error) {
    console.error('Failed to calculate metrics:', error);
    return new Response('Internal Server Error', { status: 500 });
  }

  for (let chainMetrics of metrics) {
    for (let metric of chainMetrics) {
      if (metric.stat == 0) {
        continue;
      }

      for (let stat of metric.data) {
        let gauge =
          gauges[metric.key] ??
          new Gauge({
            name: metric.key,
            help: metric.category,
            labelNames: ['chainName', 'statName', 'client']
          });
        gauge.labels(metric.chain, stat.name, metric.client).set(stat.value);
        gauges[metric.key] = gauge;
      }
    }
  }

  let defaultMetrics = await register.metrics();

  return new Response(defaultMetrics, {
    headers: {
      'Content-type': register.contentType
    }
  });
}
