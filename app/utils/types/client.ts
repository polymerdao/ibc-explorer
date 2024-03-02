export interface Client {
  clientId: string;
  clientState: clientState;
}

export interface clientState {
  revisionHeight: string;
  revisionNumber: string;
}