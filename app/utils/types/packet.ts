export interface Packet {
  sequence: string;
  sourcePortAddress: string;
  sourceChannelId: string;
  destPortAddress: string;
  destChannelId: string;
  timeout: string;
  id: string;
  state: PacketStates;
  createTime: number;
  recvTime?: number;
  endTime?: number;
  sendTx: string;
  rcvTx?: string;
  ackTx?: string;
  sourceChain: string;
  destChain: string;
}

export enum PacketStates {
  SENT = 1,
  POLY_RECV,
  RECV,
  WRITE_ACK,
  POLY_WRITE_ACK,
  ACK
}

export function stateToString (state: PacketStates): string {
  if (state < PacketStates.RECV) {
    return 'Relaying';
  } else if (state < PacketStates.ACK) {
    return 'Confirming';
  } else {
    return 'Delivered';
  }
}
