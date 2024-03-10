export interface Chain {
  id: number;
  display: string;
  rpc: string;
  dispatchers: string[];
  blockTime: number;
  icon: () => JSX.Element;
  cache: string;
}
