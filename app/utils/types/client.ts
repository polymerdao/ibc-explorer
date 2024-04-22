export interface Client {
  clientId: string;
  clientState: clientState;
}

export interface clientState {
  revisionHeight: string;
  revisionNumber: string;
  chainId: string;
  chainMemo: string;
  dispatcherAddr: string;
}
