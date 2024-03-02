import { NextRequest, NextResponse } from "next/server";
import { GetTmClient } from "api/utils/cosmos";
import { QueryConnectionsResponse } from "cosmjs-types/ibc/core/connection/v1/query";
import { QueryChannelsResponse } from "cosmjs-types/ibc/core/channel/v1/query";

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: NextRequest,
  {params}: {params: { type: "channels" | "connections" | "clients" }}
) {
  const reqType = params.type;
  try {
    switch (reqType) {
      case "channels":
        return NextResponse.json(await getChannels());
      case "connections":
        return NextResponse.json(await getConnections());
      case "clients":
        return NextResponse.json(await getClients());
    }
  } catch {
    return NextResponse.json({error: "An error occurred while fetching data"});
  }
}

async function getChannels() {
  const tmClient = await GetTmClient();
  const channels = await tmClient.ibc.channel.allChannels();
  return (QueryChannelsResponse.toJSON(channels) as QueryChannelsResponse).channels;
}

async function getConnections() {
  const tmClient = await GetTmClient();
  const connections = await tmClient.ibc.connection.allConnections();
  return (QueryConnectionsResponse.toJSON(connections) as QueryConnectionsResponse).connections;
}

async function getClients() {
  const tmClient = await GetTmClient();

  let clientIds = new Set<string>();
  let clients = [];
  const connections = await getConnections();
  for (const connection of connections) {
    if (clientIds.has(connection.clientId)) {
      continue;
    }
    const clientState = await tmClient.ibc.client.state(connection.clientId);

    clients.push({
      clientId: connection.clientId,
      clientState: {
        revisionHeight: String(clientState.proofHeight.revisionHeight),
        revisionNumber: String(clientState.proofHeight.revisionNumber),
      }
    });
    clientIds.add(connection.clientId);
  }
  return clients;
}
