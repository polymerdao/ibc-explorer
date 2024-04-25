import { NextRequest, NextResponse } from 'next/server';
import { CHAIN, CHAIN_CONFIGS } from 'utils/chains/configs';
import { PacketData, getPackets } from './helpers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const dispatcher = searchParams.get('dispatcher');
  const chain = searchParams.get('chain');
  const chainName = chain as CHAIN;

  let packets: PacketData[] = [];
  try {
    packets = await getPackets(Number(from), Number(to));
  } catch (error) {
    console.error('Failed to fetch packets for metrics: ', error);
    return NextResponse.error();
  }

  if (chain) {
    const chainId = CHAIN_CONFIGS[chainName].id;
    packets = packets.filter((packet) => packet.chainId === chainId);
  }

  if (dispatcher) {
    packets = packets.filter((packet) => packet.dispatcherAddress === dispatcher);
  }

  return NextResponse.json(packets);
}
