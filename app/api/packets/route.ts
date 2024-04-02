import { NextRequest, NextResponse } from 'next/server';
import { SimpleCache } from 'api/utils/cache';
import { getPacket } from 'api/packets/helpers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const txHash = request.nextUrl.searchParams.get('txHash');
  if (!txHash) {
    const cache = SimpleCache.getInstance();
    const allPackets = await cache.get('allPackets');
    return NextResponse.json(allPackets || []);
  }

  try {
    const packet = await getPacket(txHash);
    return NextResponse.json(packet);
  }
  catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
