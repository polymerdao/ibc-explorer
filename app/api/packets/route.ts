import { NextRequest, NextResponse } from 'next/server';
import { getPacket, getRecentPackets } from 'api/packets/helpers';
import logger from 'utils/logger';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const txHash = request.nextUrl.searchParams.get('txHash');

  if (!txHash) {
    try {
      return NextResponse.json(await getRecentPackets());
    } catch (err) {
      logger.error('Error getting recent packets: ' + err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  try {
    return NextResponse.json(await getPacket(txHash));
  } catch (err) {
    logger.error(`Error finding packet ${txHash}: ` + err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
