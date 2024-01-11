import { IbcExtension, QueryClient, setupIbcExtension } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { QueryConnectionsResponse } from "cosmjs-types/ibc/core/connection/v1/query";
import { QueryClientStatesResponse } from "cosmjs-types/ibc/core/client/v1/query";
import { QueryChannelsResponse } from "cosmjs-types/ibc/core/channel/v1/query";

export async function getTmClient(rpc: string): Promise<QueryClient & IbcExtension> {
  const tmClient = await Tendermint37Client.connect(rpc);
  return QueryClient.withExtensions(tmClient, setupIbcExtension)
}

export async function getConnections(apiUrl: string) {
  const tmClient = await getTmClient(apiUrl)
  const connections = await tmClient.ibc.connection.allConnections()
  return (QueryConnectionsResponse.toJSON(connections) as QueryConnectionsResponse).connections
}

export async function getClients(apiUrl: string) {
  const tmClient = await getTmClient(apiUrl)
  const states = await tmClient.ibc.client.allStates()
  return (QueryClientStatesResponse.toJSON(states) as QueryClientStatesResponse).clientStates
}

export async function getChannels(apiUrl: string) {
  const tmClient = await getTmClient(apiUrl)
  const channels = await tmClient.ibc.channel.allChannels()
  return (QueryChannelsResponse.toJSON(channels) as QueryChannelsResponse).channels
}
