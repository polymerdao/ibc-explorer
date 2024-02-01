import { register, Gauge } from 'prom-client';
import { calcMetrics } from '../utils';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto

let gauges: { [key: string]: Gauge } = {};

export async function GET(request: NextRequest) {
  const now = new Date();
  const oneHourAgo = new Date();
  oneHourAgo.setHours(now.getHours() - 1);


  const metrics = await calcMetrics([oneHourAgo, now], request.nextUrl.origin);
  for (let chainMetrics of metrics) {
    for (let metric of chainMetrics) {
      if (metric.stat == 0) {
        continue
      }

      for (let stat of metric.data) {
        let gauge = gauges[metric.key] ?? new Gauge({
          name: metric.key,
          help: metric.category,
          labelNames: ['chainName', 'statName']
        });
        gauge.labels(metric.chain, stat.name).set(stat.value);
        gauges[metric.key] = gauge
      }
    }
  }

  let defaultMetrics = await register.metrics();

  return new Response(defaultMetrics, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-type': register.contentType
    }
  });

}
