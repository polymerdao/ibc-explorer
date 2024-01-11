'use client';

import { IbcComponent } from "../ibc";
import { IdentifiedChannel } from "cosmjs-types/ibc/core/channel/v1/channel";

const columns = [
  {name: "Channel ID", uid: "channelId", sortable: true},
  {name: "State", uid: "state", sortable: true},
  {name: "Port ID", uid: "portId", sortable: true},
  {name: "Counterparty Channel ID", uid: "counterparty.channelId", sortable: false},
  {name: "Counterparty Port ID", uid: "counterparty.portId", sortable: false},
  {name: "Connection Hops", uid: "connectionHops", sortable: false},
];
const statusOptions = [
  {name: "Ordered", uid: "UNORDERED"},
  {name: "Unordered", uid: "ORDERED"},
  {name: "Unspecified", uid: "ORDER_NONE_UNSPECIFIED"},
];
export default function Channels() {
  return IbcComponent<IdentifiedChannel>({
    initialVisibleColumns: new Set(["channelId", "state", "portId", "counterparty.channelId", "counterparty.portId", "connectionHops"]),
    columns,
    statusProperty: "ordering",
    statusOptions,
    defaultSortDescriptor: {
      column: "channelId",
      direction: "ascending",
    },
    ibcEntityName: "channel",
    keyProperty: "channelId"
  })
}