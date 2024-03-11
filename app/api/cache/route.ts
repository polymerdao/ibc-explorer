import { NextRequest, NextResponse } from 'next/server';
import { getCacheTTL, SimpleCache } from '@/api/utils/cosmos';
import { getPackets } from '@/api/packets/route';

export async function GET(request: NextRequest) {
  const TOKEN = process.env.TOKEN;

  if (request.headers.get('Authorization') !== `Bearer ${TOKEN}`) {
    console.error('Unauthorized request');
    return NextResponse.error();
  }

  const cache = SimpleCache.getInstance();
  try {
    const packets = await getPackets('1', null);
    cache.set('allPackets', packets, getCacheTTL());
    return NextResponse.json(packets);
  } catch (e) {
    return NextResponse.error();
  }
}