import { setupPolyIbcExtension } from './cosmos/index';
import { QueryChannelsResponse } from 'cosmjs-types/ibc/core/channel/v1/query';
import { QueryConnectionsResponse } from 'cosmjs-types/ibc/core/connection/v1/query';
import { IdentifiedChannel } from 'cosmjs-types/ibc/core/channel/v1/channel';
import process from 'process';
import { QueryClient } from '@cosmjs/stargate';
import { GetTmClient } from '@/api/utils/cosmos';
import { QueryClientStatesRequest as QueryPolyIbcClientStatesRequest } from './cosmos/_generated/polyibc/core/query'
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import * as optimism from './cosmos/_generated/polyibc/lightclients/opstackv2/opstackv2'


async function getChannels() {
  const tmClient = await GetTmClient();
  const channels = await tmClient.ibc.channel.allChannels();
  return (QueryChannelsResponse.toJSON(channels) as QueryChannelsResponse).channels;
}

export async function getPaginatedChannels() {
  const tmClient = await GetTmClient();
  const channels = await tmClient.ibc.channel.channels();
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
  const client = await Tendermint37Client.connect(process.env.API_URL!);
  const queryClient = QueryClient.withExtensions(client, setupPolyIbcExtension)

  const polyClients = await queryClient.polyibc.ClientStates(QueryPolyIbcClientStatesRequest.fromPartial({pagination: {
      limit: "10"
    }}))

  for (const state of polyClients.clientStates) {
    console.log(state.clientId)
    console.log(state.clientState)
    console.log(optimism.ClientState.decode(state.clientState!.value))
  }

  return []
}