import { Packet, PacketStates } from 'utils/types/packet';
import logger from 'utils/logger';

function stringToState(state: string) {
  switch (state) {
    case 'ACK':
      return PacketStates.ACK;
    case 'RECV':
    case 'WRITE_ACK':
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

  let packetRes;
  try {
    packetRes = await (await fetch(process.env.INDEXER_URL!, packetOptions)).json();
  } catch (err) {
    logger.error('Error processing packet request: ' + err);
    return [];
  }

  if (packetRes.errors) {
    logger.error('Error processing packet request: ' + packetRes.errors);
    return [];
  }

  if (packetRes?.data?.packets) {
    return processPacketResponse(packetRes.data.packets);
  }
  else if (packetRes?.data?.sendPackets) {
    return processSendPacketResponse(packetRes.data.sendPackets);
  }

  return [];
}

function processPacketResponse(packetResponse: any[]): Packet[] {
  const packets: Packet[] = [];
  for (const packet of packetResponse) {
    const state = stringToState(packet.state);

    const createTime = packet.sendPacket?.blockTimestamp ? packet.sendPacket.blockTimestamp / 1000 : 0;
    const recvTime = packet.recvPacket?.blockTimestamp ? packet.recvPacket.blockTimestamp / 1000 : undefined;
    const endTime = packet.ackPacket?.blockTimestamp ? packet.ackPacket.blockTimestamp / 1000 : undefined;

    const newPacket: Packet = {
      sequence: packet.sendPacket?.sequence,
      sourcePortAddress: packet.sendPacket?.sourcePortAddress,
      sourceChannelId: packet.sendPacket?.sourceChannel?.channelId,
      destPortAddress: packet.recvPacket?.destPortAddress,
      destChannelId: packet.sendPacket?.sourceChannel?.counterpartyChannelId,
      timeout: packet.sendPacket?.timeoutTimestamp,
      id: packet.id,
      state: state,
      createTime,
      recvTime,
      endTime,
      sendTx: packet.sendPacket?.transactionHash,
      rcvTx: packet.recvPacket?.transactionHash,
      ackTx: packet.ackPacket?.transactionHash,
      sourceClient: packet.sendPacket?.sourceChannel?.portId.split('.')[1],
      destClient: packet.sendPacket?.sourceChannel?.counterpartyPortId.split('.')[1],
    };
    packets.push(newPacket);
  }

  return packets;
}

function processSendPacketResponse(packetResponse: any[]): Packet[] {
  const packets: Packet[] = [];
  for (const packet of packetResponse) {
    const state = stringToState(packet.packetRelation.state);

    const createTime = packet.blockTimestamp / 1000;
    const recvTime = packet.packetRelation.recvPacket?.blockTimestamp ? packet.packetRelation.recvPacket.blockTimestamp / 1000 : undefined;
    const endTime = packet.packetRelation.ackPacket?.blockTimestamp ? packet.packetRelation.ackPacket.blockTimestamp / 1000 : undefined;

    const newPacket: Packet = {
      sequence: packet.sequence,
      sourcePortAddress: packet.sourcePortAddress,
      sourceChannelId: packet.sourceChannel.channelId,
      destPortAddress: packet.packetRelation.recvPacket?.destPortAddress,
      destChannelId: packet.sourceChannel.counterpartyChannelId,
      timeout: packet.timeoutTimestamp,
      id: packet.packetRelation.id,
      state: state,
      createTime,
      recvTime,
      endTime,
      sendTx: packet.transactionHash,
      rcvTx: packet.packetRelation.recvPacket?.transactionHash,
      ackTx: packet.packetRelation.ackPacket?.transactionHash,
      sourceClient: packet.sourceChannel.portId.split('.')[1],
      destClient: packet.sourceChannel.counterpartyPortId.split('.')[1],
    };
    packets.push(newPacket);
  }
  return packets;
}

export async function getPacket(txHash: string): Promise<Packet[]> {
  const sendPacketSearch = {
    query: `query Packet($txHash:String!){
              packets(where: {sendPacket: {transactionHash_eq: $txHash}}){
                id
                sendPacket {
                  blockTimestamp
                  sourcePortAddress
                  sequence
                  dispatcherAddress
                  timeoutTimestamp
                  transactionHash
                  sourceChannel {
                    channelId
                    counterpartyChannelId
                    portId
                    counterpartyPortId
                  }
                }
                recvPacket {
                  destPortAddress
                  blockTimestamp
                  transactionHash
                }
                writeAckPacket {
                  dispatcherAddress
                  blockTimestamp
                  transactionHash
                }
                ackPacket {
                  blockTimestamp
                  transactionHash
                }
                state
              }
            }`,
    variables: { txHash }
  };

  const recvPacketSearch = {
    query: `query Packet($txHash:String!){
              packets(where: {recvPacket: {transactionHash_eq: $txHash}}){
                id
                sendPacket {
                  blockTimestamp
                  sourcePortAddress
                  sequence
                  dispatcherAddress
                  timeoutTimestamp
                  transactionHash
                  sourceChannel {
                    channelId
                    counterpartyChannelId
                    portId
                    counterpartyPortId
                  }
                }
                recvPacket {
                  destPortAddress
                  blockTimestamp
                  transactionHash
                }
                writeAckPacket {
                  dispatcherAddress
                  blockTimestamp
                  transactionHash
                }
                ackPacket {
                  blockTimestamp
                  transactionHash
                }
                state
              }
            }`,
    variables: { txHash }
  };

  const writeAckPacketSearch = {
    query: `query Packet($txHash:String!){
              packets(where: {writeAckPacket: {transactionHash_eq: $txHash}}){
                id
                sendPacket {
                  blockTimestamp
                  sourcePortAddress
                  sequence
                  dispatcherAddress
                  timeoutTimestamp
                  transactionHash
                  sourceChannel {
                    channelId
                    counterpartyChannelId
                    portId
                    counterpartyPortId
                  }
                }
                recvPacket {
                  destPortAddress
                  blockTimestamp
                  transactionHash
                }
                writeAckPacket {
                  dispatcherAddress
                  blockTimestamp
                  transactionHash
                }
                ackPacket {
                  blockTimestamp
                  transactionHash
                }
                state
              }
            }`,
    variables: { txHash }
  };

  const ackPacketSearch = {
    query: `query Packet($txHash:String!){
              packets(where: {ackPacket: {transactionHash_eq: $txHash}}){
                id
                sendPacket {
                  blockTimestamp
                  sourcePortAddress
                  sequence
                  dispatcherAddress
                  timeoutTimestamp
                  transactionHash
                  sourceChannel {
                    channelId
                    counterpartyChannelId
                    portId
                    counterpartyPortId
                  }
                }
                recvPacket {
                  destPortAddress
                  blockTimestamp
                  transactionHash
                }
                writeAckPacket {
                  dispatcherAddress
                  blockTimestamp
                  transactionHash
                }
                ackPacket {
                  blockTimestamp
                  transactionHash
                }
                state
              }
            }`,
    variables: { txHash }
  };

  const sendPacketRequest = () => processPacketRequest(sendPacketSearch);
  const recvPacketRequest = () => processPacketRequest(recvPacketSearch);
  const writeAckPacketRequest = () => processPacketRequest(writeAckPacketSearch);
  const ackPacketRequest = () => processPacketRequest(ackPacketSearch);

  const requests = [sendPacketRequest, recvPacketRequest, writeAckPacketRequest, ackPacketRequest];

  try {
    const results = await Promise.all(requests.map(request => request()));
    for (const result of results) {
      if (result.length > 0) {
        return result;
      }
    }
  } catch (err) {
    logger.error(`Error finding packet packet with txHash ${txHash}: ` + err);
    return [];
  }

  return [];
}

export async function getRecentPackets(limit: number = 1000): Promise<Packet[]> {
  const packetRequest = {
    query: `query Packet($limit:Int!){
              sendPackets(limit: $limit, orderBy: blockTimestamp_DESC) {
                id
                blockTimestamp
                sourcePortAddress
                sequence
                dispatcherAddress
                timeoutTimestamp
                transactionHash
                sourceChannel {
                  channelId
                  counterpartyChannelId
                  portId
                  counterpartyPortId
                }
                packetRelation {
                  recvPacket {
                    destPortAddress
                    blockTimestamp
                    transactionHash
                  }
                  writeAckPacket {
                    dispatcherAddress
                    blockTimestamp
                    transactionHash
                  }
                  ackPacket {
                    blockTimestamp
                    transactionHash
                  }
                  id
                  state
                }
              }
            }`,
    variables: { limit }
  };

  try {
    return await processPacketRequest(packetRequest);
  } catch (err) {
    logger.error('Error getting recent packets: ' + err);
    return [];
  }
}
