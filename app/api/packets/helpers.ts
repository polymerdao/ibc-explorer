import { Packet, PacketStates } from 'utils/types/packet';
import logger from 'utils/logger';

function stringToState(state: string) {
  switch (state) {
    case "ACK":
      return PacketStates.ACK;
    case "RECV":
    case "WRITE_ACK":
      return PacketStates.RECV;
    default:
      return PacketStates.SENT;
  }
}

async function processPacketRequest(packetRequest: {
  query: string
  variables: { txHash?: string, limit?: number }
}): Promise<Packet[]>{
  const headers = {'content-type': 'application/json'};
  const packetOptions = {
    method: 'POST',
    headers,
    body: JSON.stringify(packetRequest)
  };

  const packetRes = await (await fetch(process.env.INDEXER_URL!, packetOptions)).json();
  const responseItems = packetRes?.data?.packets?.items;
  if (!responseItems) {
    return [];
  }

  const packets: Packet[] = [];

  for (const packet of responseItems) {
    // Find channel associated with the packet to parse out src and dest chains
    const sourceChannelId = packet.sendPacket?.sourceChannelId;

    const channelRequest = {
      query: `query Channel($sourceChannelId:String!){
                channels(where:{channelId:$sourceChannelId}){
                  items {
                    portId
                    counterpartyPortId
                  }
                }
              }`,
      variables: { sourceChannelId }
    };

    const channelOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(channelRequest)
    };

    let channelResponse;
    try {
      const channelRes = await (await fetch(process.env.INDEXER_URL!, channelOptions)).json();
      channelResponse = channelRes?.data?.channels?.items[0];
      if (!channelResponse) {
        logger.info(`Channel not found for packet ${packet.id}`);
        continue;
      }
    } catch (err) {
      logger.error(`Error processing packet ${packet.id}`);
      continue;
    }

    const state = stringToState(packet.state);

    const newPacket: Packet = {
      sequence: packet.sendPacket?.sequence,
      sourcePortAddress: packet.sendPacket?.sourcePortAddress,
      sourceChannelId: packet.sendPacket?.sourceChannelId,
      destPortAddress: packet.recvPacket?.destPortAddress,
      destChannelId: packet.recvPacket?.destChannelId,
      timeout: packet.sendPacket?.timeoutTimestamp,
      id: packet.id,
      state: state,
      createTime: packet.sendPacket?.blockTimestamp,
      recvTime: packet.recvPacket?.blockTimestamp,
      endTime: packet.ackPacket?.blockTimestamp,
      sendTx: packet.sendTx,
      rcvTx: packet.recvTx,
      ackTx: packet.ackTx,
      sourceChain: channelResponse?.portId?.split('.')[1],
      destChain: channelResponse?.counterpartyPortId?.split('.')[1]
    };

    packets.push(newPacket);
  }

  return packets;
}

export async function getPacket(txHash: string): Promise<Packet[]> {
  const packetRequest = {
    query: `query Packet($txHash:String!){
              packets(where:{
                OR:[
                  {sendTx:$txHash},
                  {recvTx:$txHash},
                  {writeAckTx:$txHash},
                  {ackTx:$txHash}
                ]  
              }){
                items {
                  sendPacket {
                    sequence
                    sourcePortAddress
                    sourceChannelId
                    dispatcherAddress
                    blockTimestamp
                    timeoutTimestamp
                  }
                  recvPacket {
                    destPortAddress
                    destChannelId
                    blockTimestamp
                  }
                  writeAckPacket {
                    dispatcherAddress
                    blockTimestamp
                  }
                  ackPacket {
                    blockTimestamp
                  }
                  id
                  state
                  sendTx
                  recvTx
                  writeAckTx
                  ackTx
                }
              }
            }`,
    variables: { txHash }
  };

  return await processPacketRequest(packetRequest);
}

export async function getRecentPackets(limit: number = 100): Promise<Packet[]> {
  const packetRequest = {
    query: `query Packet($limit:Int!){
              packets(limit:$limit, orderBy: "sendBlockTimestamp", orderDirection: "desc") {
                items {
                  sendPacket {
                    sequence
                    sourcePortAddress
                    sourceChannelId
                    dispatcherAddress
                    blockTimestamp
                    timeoutTimestamp
                  }
                  recvPacket {
                    destPortAddress
                    destChannelId
                    blockTimestamp
                  }
                  writeAckPacket {
                    dispatcherAddress
                    blockTimestamp
                  }
                  ackPacket {
                    blockTimestamp
                  }
                  id
                  state
                  sendTx
                  recvTx
                  writeAckTx
                  ackTx
                }
              }
            }`,
    variables: { limit }
  };

  return await processPacketRequest(packetRequest);
}
