export interface Chain {
  id: number;
  display: string;
  rpc: string;
  txUrl: string;
  dispatchers: string[];
  clients: string[];
  blockTime: number;
  icon: (size?: number) => JSX.Element;
}
