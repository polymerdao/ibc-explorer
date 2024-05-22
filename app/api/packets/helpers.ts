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

  const responseItems = packetRes?.data?.packets;
  if (!responseItems) {
    return [];
  }

  const packets: Packet[] = [];
  for (const packet of responseItems) {
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

export async function getPacket(txHash: string): Promise<Packet[]> {
  const packetRequest = {
    query: `query Packet($txHash:String!){
              packets(where: {
                OR: [
                  {sendPacket: {transactionHash_eq: $txHash}},
                  {recvPacket: {transactionHash_eq: $txHash}},
                  {ackPacket: {transactionHash_eq: $txHash}}
                ]
              }){
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

  try {
    return await processPacketRequest(packetRequest);
  } catch (err) {
    logger.error(`Error finding packet packet with txHash ${txHash}: ` + err);
    return [];
  }
}

export async function getRecentPackets(limit: number = 1000): Promise<Packet[]> {
  const packetRequest = {
    query: `query Packet($limit:Int!){
              packets(limit: $limit, orderBy: sendPacket_blockTimestamp_DESC) {
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
    variables: { limit }
  };

  try {
    return await processPacketRequest(packetRequest);
  } catch (err) {
    logger.error('Error getting recent packets: ' + err);
    return [];
  }
}
