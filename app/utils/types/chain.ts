export interface Chain {
  id: number;
  display: string;
  rpc: string;
  dispatchers: string[];
  clients: string[];
  blockTime: number;
  icon: () => JSX.Element;
}
