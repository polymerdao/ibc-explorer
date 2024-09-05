import { NextRequest, NextResponse } from 'next/server';
import { CHAIN_CONFIGS, CHAIN } from 'utils/chains/configs';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  let chainId = Number(searchParams.get('chainId') || '');

  if (!chainId) {
    return NextResponse.json({ error: 'Invalid chainId' }, { status: 400 });
  }

  let chainRpc = '';
  for (const chain of Object.keys(CHAIN_CONFIGS)) {
    const chainName = chain as CHAIN;
    const chainVals = CHAIN_CONFIGS[chainName];
    if (chainId === chainVals.id) {
      chainRpc = chainVals.rpc;
      break;
    }
  }

  if (!chainRpc) {
    return NextResponse.json({ error: 'Chain not found' }, { status: 404 });
  }

  const provider = new ethers.JsonRpcProvider(chainRpc)
  const feeData = await provider.getFeeData();

  return NextResponse.json(feeData, { status: 200 });
}
