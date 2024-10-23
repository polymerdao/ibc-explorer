export interface Chain {
  display: string;
  rpc: string;
  dispatchers: string[];
  clients: string[];
  blockTime: number;
  icon: (size?: number) => JSX.Element;
}
