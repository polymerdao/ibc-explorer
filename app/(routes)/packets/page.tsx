'use client';

import { useEffect, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable }
from "@tanstack/react-table";
import { PacketTable } from "./table";
import { Popover } from "@headlessui/react";
import { Packet, PacketStates } from "utils/types/packet";
import { hideMiddleChars } from "utils/functions";

const columnHelper = createColumnHelper<Packet>();
const columns = [
  columnHelper.accessor('state', {
    header: 'State',
    cell: props => <span>{ stateToString(props.getValue()) }</span>,
    enableColumnFilter: false,
    enableHiding: true
  }),
  columnHelper.accessor('sendTx', {
    header: 'Send Tx',
    cell: props => hideMiddleChars(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sourceChain', {
    header: 'Source Chain',
    enableHiding: true
  }),
  columnHelper.accessor('destChain', {
    header: 'Dest Chain',
    enableHiding: true
  }),
  columnHelper.accessor('sourcePortAddress', {
    header: 'Src Port Address',
    cell: props => hideMiddleChars(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sourceChannelId', {
    header: 'Src Channel ID',
    enableHiding: true
  }),
  // Create column that combines that subtracts difference between create and end time
  columnHelper.accessor(row => (row.endTime ?? 0) - row.createTime, {
    header: 'Round-trip',
    cell: props => {
      if (props.getValue() < 0) {
        return <span>...</span>;
      }
      return <span>{Math.round(props.getValue() / 1000)} s</span>;
    },
    enableColumnFilter: false,
    enableHiding: true
  }),
  columnHelper.accessor('fee', {
    header: 'Fee',
    enableColumnFilter: false,
    enableHiding: true
  }),
];

export default function Packets() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState({})

  useEffect(() => {
    fetch("/api/mock-packets").then(res => res.json()).then(data => {
      setPackets(data);
      setLoading(false);
    });
  }, []);

  const reloadData = () => {
    setLoading(true);
    fetch("/api/mock-packets?size=100").then(res => res.json()).then(data => {
      setPackets(data);
      setLoading(false);
    });
  };

  const table = useReactTable({
    data: packets,
    columns,
    state: {
      columnVisibility
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <div>
      <h2>Search for Packets:</h2>

      <Popover className="relative">
        <Popover.Button>Columns</Popover.Button>
        <Popover.Panel className="absolute z-10">

          <div className="bg-white dark:bg-bg-dk">
            {table.getAllLeafColumns().map(column => { return (
              <div key={column.id} className="px-1">
                <label>
                  <input
                    {...{
                      type: 'checkbox',
                      checked: column.getIsVisible(),
                      onChange: column.getToggleVisibilityHandler(),
                    }}
                  />{' '}
                  {column.columnDef.header as string}
                </label>
              </div>
              )
            })}
          </div>

        </Popover.Panel>
      </Popover>

      <button onClick={() => reloadData()} className="border p-2">
        Refresh
      </button>
      <PacketTable {...{table, loading}} />
    </div>
  );
}

function stateToString(state: PacketStates) {
  switch (state) {
    case PacketStates.ACK: return 'Delivered';
    case PacketStates.POLY_WRITE_ACK || PacketStates.POLY_RECV: return 'Relaying';
    case PacketStates.RECV || PacketStates.SENT || PacketStates.WRITE_ACK: return 'Confirming';
  }
}
