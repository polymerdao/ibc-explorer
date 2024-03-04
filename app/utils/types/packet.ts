export interface Packet {
  sequence: string;
  sourcePortAddress: string;
  sourceChannelId: string;
  destPortAddress: string;
  destChannelId: string;
  timeout: string;
  fee: string;
  id: string;
  state: PacketStates;
  createTime: number;
  endTime?: number;
  sendTx: string;
  rcvTx?: string;
  ackTx?: string;
  sourceChain: string;
  destChain: string;
}

export enum PacketStates {
  SENT = 1,
  ACK,
  POLY_WRITE_ACK,
  WRITE_ACK,
  RECV,
  POLY_RECV
}
