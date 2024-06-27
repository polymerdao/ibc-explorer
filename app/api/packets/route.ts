import { NextRequest, NextResponse } from 'next/server';
import {
  PacketRes,
  getAllPackets,
  searchTxHashes,
  searchSenderAddresses,
  searchPacketId
} from './request-handlers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  let searchValue = request.nextUrl.searchParams.get('searchValue');
  let from = request.nextUrl.searchParams.get('from');
  let to = request.nextUrl.searchParams.get('to');
  const limit = Number(request.nextUrl.searchParams.get('limit'));
  const offset = Number(request.nextUrl.searchParams.get('offset'));

  // Format as strings for graphql query
  if (from) {
    from = '"' + from + '"';
  } else {
    from = '';
  }
  if (to) {
    to = '"' + to + '"';
  } else {
    to = '';
  }
 
  // No txHash provided, return all packets
  if (!searchValue) {
    const packetRes: PacketRes = await getAllPackets(from, to, limit, offset);
    if (packetRes.error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    return NextResponse.json(packetRes.packets);
  }

  searchValue = '"' + searchValue + '"';

  // Currently nothing this short is searchable
  if (searchValue.length < 40) {
    return NextResponse.json([]);
  }

  // Address searches
  if (searchValue.slice(1, 3) === '0x') {
    // Search Tx Hashes
    let packetRes: PacketRes = await searchTxHashes(searchValue);
    if (packetRes.error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    else if (packetRes.packets?.length) {
      return NextResponse.json(packetRes.packets);
    }

    // Search Sender Addresses
    packetRes = await searchSenderAddresses(searchValue, from, to, limit, offset);
    if (packetRes.error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    else if (packetRes.packets?.length) {
      return NextResponse.json(packetRes.packets);
    }
  }

  // Search Packet Id
  let packetRes = await searchPacketId(searchValue);
  if (packetRes.error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  else if (packetRes.packets?.length) {
    return NextResponse.json(packetRes.packets);
  }

  return NextResponse.json([]);
}
