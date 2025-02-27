import { NextRequest, NextResponse } from 'next/server';
import {
  PacketRes,
  getAllPackets,
  searchTxHashes,
  searchSenderAddresses,
  searchPacketId,
  searchChannels
} from './request-handlers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  let searchValue = searchParams.get('searchValue') || '';
  const limit = Number(searchParams.get('limit'));
  const offset = Number(searchParams.get('offset'));
  let start = searchParams.get('start') || '';
  let end = searchParams.get('end') || '';
  let states = searchParams.get('states') || 'SENT,RECV,WRITE_ACK,ACK';
  let src = searchParams.get('src') || '';
  let dest = searchParams.get('dest') || '';

  // Format as strings for graphql query
  if (start) { start = `"${start}"`; }
  if (end) { end = `"${end}"`; }
  if (src) { src = `"${src}"`; }
  if (dest) { dest = `"${dest}"` }
  if (states) {
    states = states.toUpperCase();
    states = `[${states}]`;
  }
 
  // No search value provided, return all packets
  if (!searchValue) {
    const packetRes: PacketRes = await getAllPackets(start, end, limit, offset, states, src, dest);
    if (packetRes.error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    return NextResponse.json(packetRes);
  }

  let emptyRes: PacketRes = { type: 'none', packets: [] };
  searchValue = searchValue.trim();
  searchValue = `"${searchValue}"`;

  // Search packets by channel id
  if (searchValue.toLocaleLowerCase().startsWith('"channel-')) {
    let packetRes: PacketRes = await searchChannels(searchValue, start, end, limit, offset, states, src, dest);
    if (packetRes.error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    if (packetRes.packets?.length) {
      return NextResponse.json(packetRes);
    }

    return NextResponse.json(emptyRes);
  }

  // Nothing besides channel id is this short and searchable
  if (searchValue.length < 40) {
    return NextResponse.json(emptyRes);
  }

  // Address searches
  if (searchValue.slice(1, 3) === '0x') {
    // Search Tx Hashes
    let packetRes: PacketRes = await searchTxHashes(searchValue);
    if (packetRes.error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    if (packetRes.packets?.length) {
      return NextResponse.json(packetRes);
    }

    // Search Sender Addresses
    packetRes = await searchSenderAddresses(searchValue, start, end, limit, offset, states, src, dest);
    if (packetRes.error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    if (packetRes.packets?.length) {
      return NextResponse.json(packetRes);
    }
  }

  // Search Packet Id
  let packetRes = await searchPacketId(searchValue);
  if (packetRes.error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  if (packetRes.packets?.length) {
    return NextResponse.json(packetRes);
  }

  return NextResponse.json(emptyRes);
}
