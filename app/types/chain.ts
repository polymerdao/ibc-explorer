export interface Chain {
  id: number;
  display: string;
  rpc: string;
  dispatcher: string;
  simDispatcher: string;
  blockTime: number;
  icon: () => JSX.Element;
}
