import { NextRequest, NextResponse } from 'next/server';
import { SimpleCache } from '@/api/utils/cache';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const cache = SimpleCache.getInstance();
  const allPackets = await cache.get('allPackets');
  return NextResponse.json(allPackets || []);
}
