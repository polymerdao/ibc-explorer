import { setupPolyIbcExtension } from './cosmos/index';
import { QueryChannelsResponse } from 'cosmjs-types/ibc/core/channel/v1/query';
import { QueryConnectionsResponse } from 'cosmjs-types/ibc/core/connection/v1/query';
import { IdentifiedChannel } from 'cosmjs-types/ibc/core/channel/v1/channel';
import process from 'process';
import { QueryClient } from '@cosmjs/stargate';
import { GetTmClient } from '@/api/utils/cosmos';
import {
  QueryClientStateRequest, QueryClientStateResponse,
} from './cosmos/_generated/polyibc/core/query';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import * as opstackv2 from './cosmos/_generated/polyibc/lightclients/opstackv2/opstackv2';
import * as optimism from './cosmos/_generated/polyibc/lightclients/optimism/optimism';
import * as sim from './cosmos/_generated/polyibc/lightclients/sim/sim';
import { ethers } from 'ethers';


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

function getClientStateProps(polyIbcClientState: QueryClientStateResponse) {
  const clientState = {
    dispatcherAddr: '',
    chainId: '',
    chainMemo: ''
  }

  const polyState = polyIbcClientState.clientState?.clientState;
  let decodedClientState;

  switch (polyState?.typeUrl) {
    case '/polyibc.lightclients.opstackv2.ClientState':
      decodedClientState = opstackv2.ClientState.decode(polyState.value);
      clientState.dispatcherAddr = ethers.hexlify(decodedClientState.dispatcherAddr);
      clientState.chainId = decodedClientState.chainId;
      clientState.chainMemo = decodedClientState.chainMemo;
      return clientState;
    case '/polyibc.lightclients.optimism.ClientState':
      decodedClientState = optimism.ClientState.decode(polyState.value);
      clientState.dispatcherAddr = ethers.hexlify(decodedClientState.dispatcherAddr);
      clientState.chainId = decodedClientState.chainId;
      clientState.chainMemo = decodedClientState.chainMemo;
      return clientState;
    case '/polyibc.lightclients.sim.ClientState':
      decodedClientState = sim.ClientState.decode(polyState.value);
      clientState.chainId = decodedClientState.chainId;
      clientState.chainMemo = decodedClientState.chainMemo;
      return clientState;
  }
  return clientState;
}

export async function getClients() {
  const tmClient = await GetTmClient();
  const client = await Tendermint37Client.connect(process.env.API_URL!);
  const queryClient = QueryClient.withExtensions(client, setupPolyIbcExtension);

  let clientIds = new Set<string>();
  let clients = [];
  const connections = await getConnections();
  for (const connection of connections) {
    if (clientIds.has(connection.clientId)) {
      continue;
    }
    const ibcClientState = await tmClient.ibc.client.state(connection.clientId);

    let clientState = {
      revisionHeight: String(ibcClientState.proofHeight.revisionHeight),
      revisionNumber: String(ibcClientState.proofHeight.revisionNumber),
      dispatcherAddr: '',
      chainId: '',
      chainMemo: ''
    };

    try {
      const polyIbcClientId = connection.clientId.split('-').slice(0, -1).join('-');
      const polyIbcClientState = await queryClient.polyibc.ClientState(QueryClientStateRequest.fromPartial({ clientId: polyIbcClientId }));

      clientState = {...clientState, ...getClientStateProps(polyIbcClientState)}

    } catch (e) {
    // Suppress error: Query failed with (22): rpc error: code = NotFound desc = polymer: client not found: key not found
    }


    clients.push({
      clientId: connection.clientId,
      clientState: clientState
    });
    clientIds.add(connection.clientId);
  }
  return clients;
}