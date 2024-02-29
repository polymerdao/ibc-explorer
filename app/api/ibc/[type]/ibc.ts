import { IbcExtension, QueryClient, setupIbcExtension } from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { QueryConnectionsResponse } from 'cosmjs-types/ibc/core/connection/v1/query';
import { QueryChannelsResponse } from 'cosmjs-types/ibc/core/channel/v1/query';

export async function getTmClient(
  rpc: string
): Promise<QueryClient & IbcExtension> {
  console.log('getTmClient');
  const tmClient = await Tendermint37Client.connect(rpc);
  console.log('got TMclient');
  return QueryClient.withExtensions(tmClient, setupIbcExtension);
}

export async function getConnections(apiUrl: string) {
  const tmClient = await getTmClient(apiUrl);
  const connections = await tmClient.ibc.connection.allConnections();
  return (
    QueryConnectionsResponse.toJSON(connections) as QueryConnectionsResponse
  ).connections;
}

export async function getClients(apiUrl: string) {
  const tmClient = await getTmClient(apiUrl);

  let clientIds = new Set<string>();
  let clients = [];
  const connections = await getConnections(apiUrl);
  for (const connection of connections) {
    if (clientIds.has(connection.clientId)) {
      continue;
    }
    const clientState = await tmClient.ibc.client.state(connection.clientId);

    clients.push({
      clientId: connection.clientId,
      clientState: {
        revisionHeight: String(clientState.proofHeight.revisionHeight),
        revisionNumber: String(clientState.proofHeight.revisionNumber)
      }
    });
    clientIds.add(connection.clientId);
  }
  return clients;
}

export async function getChannels(apiUrl: string) {
  console.log('getChannels');
  const tmClient = await getTmClient(apiUrl);
  const channels = await tmClient.ibc.channel.allChannels();
  return (QueryChannelsResponse.toJSON(channels) as QueryChannelsResponse)
    .channels;
}
