import { NextRequest, NextResponse } from 'next/server';
import { PacketData, getPackets } from './helpers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const dispatcher = searchParams.get('dispatcher');
  const chainId = Number(searchParams.get('chainId'));
  const chain = searchParams.get('chain');

  let packets: PacketData[] = [];
  try {
    if (from && to) {
      packets = await getPackets(Number(from), Number(to));
    } else {
      packets = await getPackets();
    }
  } catch (error) {
    console.error('Failed to fetch packets for metrics: ', error);
    return NextResponse.error();
  }

  if (chain) {
    packets = packets.filter((packet) => packet.chainId === chainId);
  }

  if (dispatcher) {
    packets = packets.filter((packet) => {
      return packet.dispatcherAddress.toLowerCase() === dispatcher.toLowerCase();
    });
  }

  return NextResponse.json(packets || []);
}
