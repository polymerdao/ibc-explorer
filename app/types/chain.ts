export interface Chain {
  id: number;
  display: string;
  rpc: string;
  dispatcher: string;
  blockTime: number;
  icon: () => JSX.Element;
}
