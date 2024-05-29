import { NextRequest, NextResponse } from 'next/server';
import { getChannel, getUniversalChannels } from 'api/channels/helpers';
import logger from 'utils/logger';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const channelId = request.nextUrl.searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json(await getUniversalChannels())
  }

  try {
    return NextResponse.json(await getChannel(channelId));
  }
  catch (err) {
    logger.error(`Error searching for channel ${channelId}: ${err}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
