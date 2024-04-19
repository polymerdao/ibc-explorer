import { NextRequest, NextResponse } from 'next/server';
import { getChannel, getChannels } from '@/api/channels/helpers';
import logger from '@/utils/logger';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const searchId = request.nextUrl.searchParams.get('searchId');
  if (!searchId) {
    return NextResponse.json(await getChannels())
  }

  try {
    const channels = await getChannel(searchId);
    return NextResponse.json(channels);
  }
  catch (err) {
    logger.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
