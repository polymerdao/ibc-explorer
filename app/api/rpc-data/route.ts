import { NextRequest, NextResponse } from 'next/server';
import { CHAIN_CONFIGS, CHAIN } from 'utils/chains/configs';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  let chainName = searchParams.get('chain') || '';
  if (!chainName) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  chainName = chainName.toLowerCase();
  return await getFeeData(chainName);
}

async function getFeeData(chainName: string) {
  let chainRpc = '';
  for (const chain of Object.keys(CHAIN_CONFIGS)) {
    if (chainName === chain.toLowerCase()) {
      const chainVals = CHAIN_CONFIGS[chain as CHAIN];
      chainRpc = chainVals.rpc;
      break;
    }
  }

  if (!chainRpc) {
    return NextResponse.json({ error: 'Chain not found' }, { status: 404 });
  }

  const provider = new ethers.JsonRpcProvider(chainRpc)
  const feeData = await provider.getFeeData();
  if (!feeData) {
    return NextResponse.json({ error: 'Fee data not found' }, { status: 404 });
  }

  return NextResponse.json(feeData, { status: 200 });
}
