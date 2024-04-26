import logger from 'utils/logger';

export interface PacketData {
  chainId: number;
  dispatcherAddress: string;
  txLatency: number;
  sendPacketTransactionCost: number;
  ackTransactionCost: number;
}

export async function getPackets(from?: number, to?: number): Promise<PacketData[]> {
  const now = Math.floor(Date.now() / 1000);
  from = from || now - 60 * 60;
  to = to || now;

  if (from >= to) {
    logger.error('Invalid time range for metrics');
    return [];
  }

  const packetRequest = {
    query: `query Packet($from:Int!, $to:Int!){
              packets(where: {sendBlockTimestamp_gte: $from, sendBlockTimestamp_lte: $to}){
                items {
                  sendPacket {
                    chainId
                    dispatcherAddress
                  }
                  sendToRecvGas
                  sendToAckGas
                  sendToAckTime
                }
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
  const responseItems = packetRes?.data?.packets?.items;
  if (!responseItems) {
    logger.error('Error fetching packets for metrics');
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
