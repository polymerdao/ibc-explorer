import { GetTmClient } from "api/utils/cosmos";
import { QueryConnectionsResponse } from "cosmjs-types/ibc/core/connection/v1/query";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET() {
  const tmClient = await GetTmClient(process.env.API_URL!);
  const connections = await tmClient.ibc.connection.allConnections();
  return NextResponse.json((QueryConnectionsResponse.toJSON(connections) as QueryConnectionsResponse).connections);
}
