import { Packet, PacketStates } from 'utils/types/packet';
import { packet } from '../utils/cosmos/polyibc';
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

export async function processRequest(packetRequest: { query: string }): Promise<Packet[]>{
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
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
      senderAddress: packet.sendPacket?.uchEventSender || packet.sendPacket?.packetDataSender || ''
    };
    packets.push(newPacket);
  }

  return packets;
}

function processSendPacketResponse(packetResponse: any[]): Packet[] {
  const packets: Packet[] = [];
  for (const sendPacket of packetResponse) {
    const state = stringToState(sendPacket.packetRelation?.state);

    const createTime = sendPacket.blockTimestamp / 1000;
    const recvTime = sendPacket.packetRelation?.recvPacket?.blockTimestamp ? sendPacket.packetRelation?.recvPacket.blockTimestamp / 1000 : undefined;
    const endTime = sendPacket.packetRelation?.ackPacket?.blockTimestamp ? sendPacket.packetRelation?.ackPacket.blockTimestamp / 1000 : undefined;

    const newPacket: Packet = {
      sequence: sendPacket.sequence,
      sourcePortAddress: sendPacket.sourcePortAddress,
      sourceChannelId: sendPacket.sourceChannel?.channelId,
      destPortAddress: sendPacket.packetRelation?.recvPacket?.destPortAddress || '',
      destChannelId: sendPacket.sourceChannel?.counterpartyChannelId,
      timeout: sendPacket.timeoutTimestamp,
      id: sendPacket.packetRelation?.id || '',
      state: state,
      createTime,
      recvTime,
      endTime,
      sendTx: sendPacket.transactionHash,
      rcvTx: sendPacket.packetRelation?.recvPacket?.transactionHash,
      ackTx: sendPacket.packetRelation?.ackPacket?.transactionHash,
      sourceClient: sendPacket.sourceChannel?.portId.split('.')[1],
      destClient: sendPacket.sourceChannel?.counterpartyPortId.split('.')[1],
      senderAddress: sendPacket.uchEventSender || sendPacket.packetDataSender || ''
    };
    packets.push(newPacket);
  }
  return packets;
}

export function generatePacketQuery(params?: string): { query: string } {
  return {
    query: `query Packet {
      packets ${params ? params : ''}{
        id
        sendPacket {
          blockTimestamp
          sourcePortAddress
          sequence
          dispatcherAddress
          timeoutTimestamp
          transactionHash
          packetDataSender
          uchEventSender
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
    }`
  };
}

export function generateSendPacketQuery(params?: string): { query: string } {
  return {
    query: `query Packet {
      sendPackets ${params ? params : ''} {
        id
        blockTimestamp
        sourcePortAddress
        sequence
        dispatcherAddress
        timeoutTimestamp
        transactionHash
        packetDataSender
        uchEventSender
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
    }`
  };
}

export interface QueryParams {
  where?: string,
  orderBy?: string,
  limit?: number,
  offset?: number,
}

export function generateQueryParams(params: QueryParams): string {
  let reqParams = '';
  params.limit = params.limit || 1000;
  reqParams += `limit: ${params.limit}, `;
  if (params.offset) reqParams += `offset: ${params.offset}, `;
  if (params.orderBy) reqParams += `orderBy: ${params.orderBy}, `;
  if (params.where) reqParams += `where: {${params.where}}`;
  return `(${reqParams})`
}

export interface FiltersProps {
  start?: string,
  end?: string,
  states?: string,
  src?: string,
  dest?: string
}

export function generateSendPacketFilters(filters: FiltersProps): string {
  const startFilter = filters.start ? `blockTimestamp_gte: ${filters.start}` : '';
  const endFilter = filters.end ? `blockTimestamp_lte: ${filters.end}` : '';
  const stateFilter = filters.states ? `packetRelation: {state_in: ${filters.states}}` : '';
  const srcFilter = filters.src ? `portId_contains: ${filters.src}` : '';
  const destFilter = filters.dest ? `counterpartyPortId_contains: ${filters.dest}` : '';

  const channelFilter = (srcFilter || destFilter) 
    ? `sourceChannel: {AND: {${srcFilter}${srcFilter && destFilter ? ', ' : ''}${destFilter}}}`
    : '';

  return [
    startFilter, 
    endFilter, 
    stateFilter && `${startFilter || endFilter ? ', ' : ''}${stateFilter}`, 
    channelFilter && `${startFilter || endFilter || stateFilter ? ', ' : ''}${channelFilter}`
  ].filter(Boolean).join('');
}
