import { IdentifiedChannel } from 'api/utils/cosmos/_generated/ibc/core/channel/v1/channel';
import { State } from 'cosmjs-types/ibc/core/channel/v1/channel';

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

async function getChannelByGQQuery(channelRequest: {
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
  for (const item of channelRes.data.channels.items) {
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
              channels(limit:$limit, orderBy: "blockTimestamp", orderDirection: "desc"){
                items {
                  state
                  ordering
                  version
                  portId
                  channelId
                  counterpartyPortId
                  counterpartyChannelId
                  connectionHops
                }
              }
            }`,
    variables: { limit: limit }
  };
  return await getChannelByGQQuery(channelsRequest);
}

export async function getChannel(searchId: string) {
  const channelRequest = {
    query: `query Channel($searchId:String!){
              channels(where:{
                OR: [
                  {channelId: $searchId},
                  {counterpartyChannelId: $searchId},
                  {portId: $searchId},
                  {counterpartyPortId: $searchId},
                ]
              }){
                items {
                  state
                  ordering
                  version
                  portId
                  channelId
                  counterpartyPortId
                  counterpartyChannelId
                  connectionHops
                }
              }
            }`,
    variables: { searchId: searchId }
  };
  return await getChannelByGQQuery(channelRequest);
}
