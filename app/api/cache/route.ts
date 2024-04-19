import { NextRequest, NextResponse } from 'next/server';
import { SimpleCache } from '@/api/utils/cache';
import { isLocalEnv } from '@/api/utils/helpers';
import { getChannelsConcurrently } from '@/api/utils/peptide';
import { getPackets } from '@/api/packets/helpers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const AUTH_TOKEN = process.env.AUTH_TOKEN;

  if (!isLocalEnv() && request.headers.get('Authorization') !== `Bearer ${AUTH_TOKEN}`) {
    console.warn(`Unauthorized request to /api/cache with auth token ${request.headers.get('Authorization')}`);
    return NextResponse.error();
  }

  const cache = SimpleCache.getInstance();
  const start = Date.now();
  try {

    // Run requests concurrently
    const [packets] = await Promise.all([
      getPackets(),
    ]);

    console.log("Saving packets to cache");

    // Set cache concurrently
    await Promise.all([
      cache.set('allPackets', packets, -1),
    ]);

    console.log(`Fetched packets and channels in ${Date.now() - start}ms`);
    return NextResponse.json({'packets': packets});
  } catch (e) {
    console.error('Error fetching packets', e);
    return NextResponse.error();
  }
}