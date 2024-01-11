'use client';

import { IbcComponent } from "../ibc";
import { IdentifiedConnection } from "cosmjs-types/ibc/core/connection/v1/connection";

const columns = [
  {name: "Connection ID", uid: "id", sortable: true},
  {name: "Client ID", uid: "clientId", sortable: true},
  {name: "State", uid: "state", sortable: true},
  {name: "Counterparty Client Id", uid: "counterparty.clientId", sortable: false},
  {name: "Counterparty Connection ID", uid: "counterparty.connectionId", sortable: false},
  {name: "Delay Period", uid: "delayPeriod", sortable: false},
];
const statusOptions = [
  {name: "Init", uid: "STATE_INIT"},
  {name: "Try Pending", uid: "STATE_TRY_PENDING"},
  {name: "Open", uid: "STATE_OPEN"},
];
export default function Channels() {
  return IbcComponent<IdentifiedConnection>({
    initialVisibleColumns: new Set(["id", "clientId", "state", "counterparty.clientId", "counterparty.connectionId", "delayPeriod"]),
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