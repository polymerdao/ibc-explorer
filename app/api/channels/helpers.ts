import { IdentifiedChannel, State } from 'utils/types/channel';
import logger from 'utils/logger';

function stringToState(state: string) {
  switch (state) {
    case 'OPEN': return State.STATE_OPEN
    case 'INIT': return State.STATE_INIT
    case 'CLOSED': return State.STATE_CLOSED
    case 'TRY': return State.STATE_TRYOPEN
    default:
      return State.UNRECOGNIZED
  }
}

export async function getUniversalChannels(): Promise<IdentifiedChannel[]> {
  const universalChannels: IdentifiedChannel[] = [];
  // Fetch polymer-registry to get Universal Channel IDs
  const registry = await getPolymerRegistry();

  for (const chain in registry) {
    const clients = registry[chain].clients;
    for (const client in clients) {
      const clientProps = clients[client];
      if (!clientProps.universalChannelId) {
        logger.info(`No universal channel found for ${chain} ${client}`);
        continue;
      }
      try {
        const universalChannel = await getChannel(clientProps.universalChannelId);
        if (universalChannel.length === 0) {
          logger.info(`Could not find universal channel ${chain} ${client} ${clientProps.universalChannelId}`);
          continue;
        }
        universalChannels.push(universalChannel[0]);
      }
      catch (err) {
        logger.error(`Error fetching universal channel for ${chain} ${client}: ` + err);
      }
    }
  }

  return universalChannels;
}

async function processChannelRequest(channelRequest: {
  variables: { searchId?: string, limit?: number };
  query: string
}) {
  const channelOptions = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(channelRequest)
  };

  const channelRes = await (await fetch(process.env.INDEXER_URL!, channelOptions)).json();

  const channels = [];
  for (const item of channelRes.data.channels) {
    const channel: IdentifiedChannel = {
      portId: item.portId,
      channelId: item.channelId,
      state: stringToState(item.state),
      ordering: item.ordering,
      version: item.version,
      connectionHops: item.connectionHops,
      counterparty: {
        portId: item.counterpartyPortId,
        channelId: item.counterpartyChannelId
      }
    };
    channels.push(channel);
  }
  return channels;
}

export async function getChannels(limit: number = 100) {
  const channelsRequest = {
    query: `query Channels($limit:Int!){
              channels(limit: $limit, orderBy: blockTimestamp_DESC){
                state
                ordering
                version
                portId
                channelId
                counterpartyPortId
                counterpartyChannelId
                connectionHops
              }
            }`,
    variables: { limit: limit }
  };

  return await processChannelRequest(channelsRequest);
}

export async function getChannel(searchId: string) {
  const channelRequest = {
    query: `query Channel($searchId:String!){
              channels(where: {
                OR: [
                  {channelId_eq: $searchId}
                ]
              }){
                state
                ordering
                version
                portId
                channelId
                counterpartyPortId
                counterpartyChannelId
                connectionHops
              }
            }`,
    variables: { searchId: searchId }
  };

  return await processChannelRequest(channelRequest);
}

async function getPolymerRegistry() {
  try {
    const res = await fetch(process.env.REGISTRY_URL!);
    if (!res.ok) {
      logger.error('Error fetching polymer-registry: ' + res.statusText);
      return {};
    }
    const data = await res.json();
    return data;
  } catch (error) {
    logger.error('Error fetching polymer-registry: ' + error);
    return {};
  }
}
