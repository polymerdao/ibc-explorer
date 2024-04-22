import { NextRequest, NextResponse } from 'next/server';
import { getClients, getConnections } from '@/api/utils/peptide';

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: NextRequest,
  {params}: {params: { type: 'channels' | 'connections' | 'clients' }}
) {
  const reqType = params.type;

  try {
    switch (reqType) {
      case "connections":
        return NextResponse.json(await getConnections());
      case 'clients':
        return NextResponse.json(await getClients());
    }
  } catch {
    return NextResponse.json({error: 'An error occurred while fetching data'});
  }
}
