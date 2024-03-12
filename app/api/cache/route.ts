import { NextRequest, NextResponse } from 'next/server';
import { getPackets } from '@/api/packets/route';
import { SimpleCache } from '@/api/utils/cache';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  // const TOKEN = process.env.TOKEN;
  //
  // if (request.headers.get('Authorization') !== `Bearer ${TOKEN}`) {
  //   console.error('Unauthorized request');
  //   return NextResponse.error();
  // }

  const cache = SimpleCache.getInstance();
  try {
    const packets = await getPackets();
    console.log("Saving packets to cache");
    await cache.set('allPackets', packets, -1);
    return NextResponse.json(packets);
  } catch (e) {
    console.error('Error fetching packets', e);
    return NextResponse.error();
  }
}