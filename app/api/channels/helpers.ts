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
  const registry = await fetchRegistry();

  for (const chain in registry) {
    const clients = registry[chain].clients;
    for (const client in clients) {
      const clientProps = clients[client];
      if (!clientProps.universalChannels) {
        continue;
      }

      for (const channel of clientProps.universalChannels) {
        if (!channel.id) {
          logger.info(`No universal channel found for ${chain} ${client}`);
          continue;
        }

        try {
          const universalChannel = await getChannel(channel.id);
          if (universalChannel.length === 0) {
            logger.info(`Could not find universal channel ${chain} ${client} ${channel.id}`);
            continue;
          }
          universalChannels.push(universalChannel[0]);
        }
        catch (error) {
          logger.error(`Error fetching universal channel for ${chain} ${client}: ${error}`);
        }
      }
    }
  }

  return universalChannels;
}

export async function getIncompleteChannels(limit: number = 100, offset: number = 0): Promise<IdentifiedChannel[]> {
  const channelsRequest = {
    query: `query Channels($limit:Int! $offset:Int!){
              channels(where: {state_not_eq: OPEN}, limit: $limit, offset: $offset, orderBy: blockTimestamp_DESC){
                state
                ordering
                version
                portId
                channelId
                counterpartyPortId
                counterpartyChannelId
                connectionHops
                blockTimestamp
                transactionHash
              }
            }`,
    variables: { limit: limit, offset: offset }
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
                blockTimestamp
                transactionHash
              }
            }`,
    variables: { searchId: searchId }
  };

  return await processChannelRequest(channelRequest);
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
      },
      createTime: item.blockTimestamp ? item.blockTimestamp / 1000 : undefined,
      transactionHash: item.transactionHash || undefined
    };
    channels.push(channel);
  }
  return channels;
}


async function fetchRegistry() {
  let data;

  try {
    let res;

    if (process.env.GITHUB_TOKEN) {
      res = await fetch(process.env.REGISTRY_URL!, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
        cache: 'no-store'
      });
    } else {
      res = await fetch(process.env.REGISTRY_URL!);
    }

    if (!res.ok) {
      logger.error('Error fetching polymer-registry: ' + res.statusText);
      return {};
    }
    data = await res.json();
  }
  catch (error) {
    logger.error('Error fetching polymer-registry: ' + error);
    return {};
  }

  return data;
}
