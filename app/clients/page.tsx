'use client';

import { IbcComponent } from "../ibc";
import { IdentifiedClientState } from "cosmjs-types/ibc/core/client/v1/client";

const columns = [
  {name: "Client ID", uid: "clientId", sortable: true},
  {name: "Revision Height", uid: "clientState.revisionHeight", sortable: true},
  {name: "Revision Number", uid: "clientState.revisionNumber", sortable: true},
];
const statusOptions = [
  {name: "Open", uid: "STATE_OPEN"},
  {name: "Try Open", uid: "STATE_TRY_OPEN"},
];
export default function Channels() {
  return IbcComponent<IdentifiedClientState>({
    initialVisibleColumns: new Set(["clientId", "clientState.revisionHeight", "clientState.revisionNumber"]),
    columns,
    statusOptions: [],
    defaultSortDescriptor: {
      column: "clientId",
      direction: "ascending",
    },
    ibcEntityName: "client",
    keyProperty: "clientId"
  })
}