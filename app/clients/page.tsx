'use client';

import { IbcComponent } from "../ibc";
import { ClientSchema, ConnectionSchema } from "../schemas";

const columns = [
  {name: "Client ID", uid: "client_id", sortable: true},
  {name: "Revision Height", uid: "client_state.latest_height.revision_height", sortable: true},
  {name: "Revision Number", uid: "client_state.latest_height.revision_number", sortable: true},
];
const statusOptions = [
  {name: "Open", uid: "STATE_OPEN"},
  {name: "Try Open", uid: "STATE_TRY_OPEN"},
];
export default function Channels() {
  return IbcComponent<ClientSchema>({
    initialVisibleColumns: new Set(["client_id", "client_state.latest_height.revision_height", "client_state.latest_height.revision_number"]),
    columns,
    statusOptions: [],
    defaultSortDescriptor: {
      column: "client_id",
      direction: "ascending",
    },
    ibcEntityName: "client",
    keyProperty: "client_id"
  })
}