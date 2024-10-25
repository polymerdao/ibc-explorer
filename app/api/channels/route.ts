import { NextRequest, NextResponse } from 'next/server';
import { getChannel, getUniversalChannels, getChannels } from 'api/channels/helpers';
import logger from 'utils/logger';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const channelId = searchParams.get('channelId');
  const channelType = searchParams.get('channelType');

  let rawLimit = searchParams.get('limit');
  let rawOffset = searchParams.get('offset');
  if (!channelId && (rawLimit === null || rawOffset === null)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const limit = Number(rawLimit);
  const offset = Number(rawOffset);
  if (isNaN(limit) || isNaN(offset)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!channelId) {
    if (!channelType) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (channelType === 'in-progress' || channelType === 'recent') {
      try {
        return NextResponse.json(await getChannels(channelType, limit, offset));
      } catch (err) {
        logger.error(`Error fetching incomplete channels: ${err}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
    else if (channelType === 'universal') {
      try {
        return NextResponse.json(await getUniversalChannels())
      } catch (err) {
        logger.error(`Error fetching universal channels: ${err}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }

    else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
