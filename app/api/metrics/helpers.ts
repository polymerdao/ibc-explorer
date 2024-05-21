import logger from 'utils/logger';

export interface PacketData {
  chainId: number;
  dispatcherAddress: string;
  txLatency: number;
  sendPacketTransactionCost: number;
  ackTransactionCost: number;
}

export async function getPackets(from?: number, to?: number): Promise<PacketData[]> {
  const now = Date.now() / 1000;
  from = from || now - 60 * 60;
  to = to || now;
  from = from * 1000;
  to = to * 1000;

  if (from >= to) {
    logger.error('Invalid time range for metrics');
    return [];
  }

  const packetRequest = {
    query: `query Packet($from:BigInt!, $to:BigInt!){
              packets(where: {sendPacket: {blockTimestamp_lte: $to, blockTimestamp_gte: $from}}) {
                sendPacket {
                  chainId
                  dispatcherAddress
                }
                sendToAckGas
                sendToRecvGas
                sendToAckTime
              }
            }`,
    variables: { from, to }
  };

  const headers = {'content-type': 'application/json'};
  const packetOptions = {
    method: 'POST',
    headers,
    body: JSON.stringify(packetRequest)
  };

  const packetRes = await (await fetch(process.env.INDEXER_URL!, packetOptions)).json();
  if (packetRes.errors) {
    logger.error('Failed to fetch packets for metrics: ', packetRes.errors[0].message);
    return [];
  }
  const responseItems = packetRes?.data?.packets;
  if (!responseItems) {
    logger.error('No packets found for metrics');
    return [];
  }

  const packets: PacketData[] = [];
  for (const packet of responseItems) {
    if (!packet.sendToAckTime || !packet.sendPacket.chainId || !packet.sendPacket.dispatcherAddress) {
      continue;
    }
    const chainId = packet.sendPacket.chainId;
    const dispatcherAddress = packet.sendPacket.dispatcherAddress;
    const txLatency = packet.sendToAckTime;
    const sendPacketTransactionCost = packet.sendToRecvGas;
    const ackTransactionCost = packet.sendToAckGas - packet.sendToRecvGas;

    packets.push({ chainId, dispatcherAddress, txLatency, sendPacketTransactionCost, ackTransactionCost });
  }

  return packets;
}
