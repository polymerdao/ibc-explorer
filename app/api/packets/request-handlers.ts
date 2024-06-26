import { Packet } from 'utils/types/packet';
import {
  generateQueryParams,
  processRequest,
  generatePacketQuery,
  generateSendPacketQuery
} from './helpers';
import logger from 'utils/logger';

export interface PacketRes {
  packets?: Packet[];
  error?: boolean;
}

export async function getAllPackets(
  from?: string,
  to?: string,
  limit?: number,
  offset?: number
): Promise<PacketRes> {
  let startFilter = from ? `blockTimestamp_gte: ${from}` : '';
  const endFilter = to ? `blockTimestamp_lte: ${to}` : '';
  if (startFilter && endFilter) { startFilter += ', '; }

  const queryParams = generateQueryParams({
    orderBy: 'blockTimestamp_DESC',
    where: startFilter + endFilter,
    limit,
    offset
  });

  let packetRes: PacketRes = {};
  try {
    const packets = await processRequest(generateSendPacketQuery(queryParams));
    if (packets.length) {
      packetRes.packets = packets;
    }
  } catch (err) {
    logger.error('Error getting recent packets: ' + err);
    packetRes.error = true;
  }

  return packetRes;
}

export async function searchTxHashes(txHash: string): Promise<PacketRes> {
  const sendPacketParams = generateQueryParams({ where: `sendPacket: {transactionHash_eq: ${txHash}}` });
  const sendPacketRequest = () => processRequest(generatePacketQuery(sendPacketParams));
  const recvPacketParams = generateQueryParams({ where: `recvPacket: {transactionHash_eq: ${txHash}}` });
  const recvPacketRequest = () => processRequest(generatePacketQuery(recvPacketParams));
  const writeAckPacketParams = generateQueryParams({ where: `writeAckPacket: {transactionHash_eq: ${txHash}}` });
  const writeAckPacketRequest = () => processRequest(generatePacketQuery(writeAckPacketParams));
  const ackPacketParams = generateQueryParams({ where: `ackPacket: {transactionHash_eq: ${txHash}}` });
  const ackPacketRequest = () => processRequest(generatePacketQuery(ackPacketParams));

  const requests = [sendPacketRequest, recvPacketRequest, writeAckPacketRequest, ackPacketRequest];

  let packetRes: PacketRes = {};
  try {
    const results = await Promise.all(requests.map(request => request()));
    for (const result of results) {
      if (result.length) {
        packetRes.packets = result;
      }
    }
  } catch (err) {
    logger.error(`Error finding packet packet with txHash ${txHash}: ` + err);
    packetRes.error = true;
  }

  return packetRes;
}

export async function searchSenderAddresses(
  searchValue: string,
  from?: string,
  to?: string,
  limit?: number,
  offset?: number
): Promise<PacketRes> {
  const senderFilter = `OR: [{uchEventSender_eq: ${searchValue}}, {packetDataSender_eq: ${searchValue}}]`
  let startFilter = from ? `blockTimestamp_gte: ${from}` : '';
  const endFilter = to ? `blockTimestamp_lte: ${to}` : '';
  if (startFilter && endFilter) { startFilter += ', '; }

  const queryParams = generateQueryParams({
    orderBy: 'blockTimestamp_DESC',
    where: 'AND: [{' + senderFilter + '}, {' + startFilter + endFilter + '}]',
    limit: limit,
    offset: offset
  });

  let packetRes: PacketRes = {};
  try {
    const packets = await processRequest(generateSendPacketQuery(queryParams));
    if (packets.length) {
      packetRes.packets = packets;
    }
  } catch (err) {
    logger.error(`Error finding packets with senderAddress ${searchValue}: ` + err);
    packetRes.error = true;
  }

  return packetRes;
}

export async function searchPacketId(searchValue: string): Promise<PacketRes> {
  const queryParams = generateQueryParams({
    where: `id_eq: ${searchValue}`
  })

  let packetRes: PacketRes = {};
  try {
    const packets = await processRequest(generatePacketQuery(queryParams));
    if (packets.length) {
      packetRes.packets = packets;
    }
  } catch (err) {
    logger.error(`Error finding packet with id ${searchValue}: ` + err);
    packetRes.error = true;
  }

  return packetRes;
}
