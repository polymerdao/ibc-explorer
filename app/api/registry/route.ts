import { NextRequest, NextResponse } from 'next/server';
import { getChainId } from 'utils/chains/id-maps';
import { fetchRegistry } from './fetch-registry';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  let chainName = searchParams.get('chain') || '';
  chainName = chainName.toLowerCase();
  let info = searchParams.get('info') || '';
  let env = searchParams.get('env') || '';

  if (!chainName || !info || !env) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  let chainId: number;
  try {
    chainId = getChainId(chainName, env);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }

  if (info === 'explorerUrl') {
    return getExplorerUrl(chainId);
  } else {
    return NextResponse.json({ error: 'Invalid info request' }, { status: 400 });
  }
}

async function getExplorerUrl(chainId: number) {
  const registry = await fetchRegistry();

  let explorerUrl = '';
  const chainData = registry[chainId];
  if (chainData && Array.isArray(chainData.explorers) && chainData.explorers.length > 0) {
    explorerUrl = chainData.explorers[0].url;
  }

  if (!explorerUrl) {
    return NextResponse.json({ error: 'Explorer URL not found' }, { status: 404 });
  }

  return NextResponse.json({ explorerUrl }, { status: 200 });
}
