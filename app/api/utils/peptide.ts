import { GetTmClient } from '@/api/utils/cosmos';
import { QueryChannelsResponse } from 'cosmjs-types/ibc/core/channel/v1/query';
import { QueryConnectionsResponse } from 'cosmjs-types/ibc/core/connection/v1/query';
import { IdentifiedChannel } from 'cosmjs-types/ibc/core/channel/v1/channel';

async function getChannels() {
  const tmClient = await GetTmClient();
  const channels = await tmClient.ibc.channel.allChannels();
  return (QueryChannelsResponse.toJSON(channels) as QueryChannelsResponse).channels;
}

export async function getChannelsConcurrently() {
  const tmClient = await GetTmClient();
  const connections = await tmClient.ibc.connection.allConnections();

  const channelsPromises = connections.connections.map(function(connection) {
      return tmClient.ibc.channel.connectionChannels(connection.id);
    }
  );
  const channelsArrays = await Promise.all(channelsPromises);
  return ([] as IdentifiedChannel[]).concat(...channelsArrays.map(res => res.channels));
}

export async function getConnections() {
  const tmClient = await GetTmClient();
  const connections = await tmClient.ibc.connection.allConnections();
  return (QueryConnectionsResponse.toJSON(connections) as QueryConnectionsResponse).connections;
}

export async function getClients() {
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
        revisionNumber: String(clientState.proofHeight.revisionNumber)
      }
    });
    clientIds.add(connection.clientId);
  }
  return clients;
}