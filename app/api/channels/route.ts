import { NextRequest, NextResponse } from 'next/server';
import { getChannel, getUniversalChannels, getIncompleteChannels } from 'api/channels/helpers';
import logger from 'utils/logger';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const channelId = searchParams.get('channelId');
  const inProgress = searchParams.get('inProgress');

  if (!channelId) {
    if (inProgress) {
      const limit = Number(searchParams.get('limit'));
      const offset = Number(searchParams.get('offset'));
      try {
        return NextResponse.json(await getIncompleteChannels(limit, offset));
      } catch (err) {
        logger.error(`Error fetching incomplete channels: ${err}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    } else {
      try {
        return NextResponse.json(await getUniversalChannels())
      } catch (err) {
        logger.error(`Error fetching universal channels: ${err}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  }

  try {
    return NextResponse.json(await getChannel(channelId));
  }
  catch (err) {
    logger.error(`Error searching for channel ${channelId}: ${err}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
