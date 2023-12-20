const columns = [
  {name: "Channel ID", uid: "channel_id", sortable: true},
  {name: "State", uid: "state", sortable: true},
  {name: "Port ID", uid: "port_id", sortable: true},
  {name: "Counterparty Channel ID", uid: "counterparty.channel_id", sortable: false},
  {name: "Counterparty Port ID", uid: "counterparty.port_id", sortable: false},
  {name: "Connection Hops", uid: "connection_hops", sortable: false},
];

const statusOptions = [
  {name: "Ordered", uid: "UNORDERED"},
  {name: "Unordered", uid: "ORDERED"},
  {name: "Unspecified", uid: "ORDER_NONE_UNSPECIFIED"},
];

export { columns, statusOptions };
