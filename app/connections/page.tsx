'use client';

import { IbcComponent } from "../ibc";
import { ConnectionSchema } from "../schemas";

const columns = [
  {name: "Connection ID", uid: "id", sortable: true},
  {name: "Client ID", uid: "client_id", sortable: true},
  {name: "State", uid: "state", sortable: true},
  {name: "Counterparty Client Id", uid: "counterparty.client_id", sortable: false},
  {name: "Counterparty Connection ID", uid: "counterparty.connection_id", sortable: false},
  {name: "Delay Period", uid: "delay_period", sortable: false},
];
const statusOptions = [
  {name: "Init", uid: "STATE_INIT"},
  {name: "Try Pending", uid: "STATE_TRY_PENDING"},
  {name: "Open", uid: "STATE_OPEN"},
];
export default function Channels() {
  return IbcComponent<ConnectionSchema>({
    initialVisibleColumns: new Set(["id", "client_id", "state", "counterparty.client_id", "counterparty.connection_id", "delay_period"]),
    columns,
    statusProperty: "state",
    statusOptions,
    defaultSortDescriptor: {
      column: "id",
      direction: "ascending",
    },
    ibcEntityName: "connection",
    keyProperty: "id"
  })
}