export interface Packet {
  sequence: string;
  sourcePortAddress: string;
  sourceChannelId: string;
  destPortAddress: string;
  destChannelId: string;
  timeout: string;
  fee: string;
  id: string;
  state: string;
  createTime: number;
  endTime?: number;
  sendTx: string;
  rcvTx?: string;
  ackTx?: string;
  sourceChain: string;
  destChain: string;
}

export interface Chain {
  id: number;
  display: string;
  rpc: string;
  dispatcher: string;
  blockTime: number;
  icon: () => JSX.Element;
}
