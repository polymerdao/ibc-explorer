'use client';

import { useEffect, useState } from "react";
import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable }
from "@tanstack/react-table";
import { PacketTable } from "./table";
import { Modal } from "components/modal";
import { Popover } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { Packet, PacketStates } from "utils/types/packet";
import { hideMiddleChars } from "utils/functions";

const columnHelper = createColumnHelper<Packet>();
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableHiding: true
  }),
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
  columnHelper.accessor('destPortAddress', {
    header: 'Dest Port Address',
    cell: props => hideMiddleChars(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sourceChannelId', {
    header: 'Src Channel ID',
    enableHiding: true
  }),
  columnHelper.accessor('destChannelId', {
    header: 'Dest Channel ID',
    enableHiding: true
  }),
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
  columnHelper.accessor('sequence', {
    header: 'Sequence',
    enableColumnFilter: false,
    enableHiding: true
  }),
  columnHelper.accessor('rcvTx', {
    header: 'Rcv Tx',
    cell: props => hideMiddleChars(props.getValue() ?? ''),
    enableHiding: true
  }),
  columnHelper.accessor('ackTx', {
    header: 'Ack Tx',
    cell: props => hideMiddleChars(props.getValue() ?? ''),
    enableHiding: true
  })
];

export default function Packets() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    'sequence': false,
    'destPortAddress': false,
    'destChannelId': false,
    'fee': false,
    'id': false,
    'rcvTx': false,
    'ackTx': false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    async function fetchData() {
      const res = await fetch("/api/mock-packets?size=100");
      if (!res.ok) {
        setError(true);
        setLoading(false);
      } else {
        const data = await res.json();
        setPackets(data);
        setLoading(false);
      }
    }
    fetchData();
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
  });

  return (
    <div className="w-full">

      <Modal
        open={error} setOpen={setError}
        title="Error Loading"
        content={<p>There was an issue fetching packet data</p>}
      />

      <h2>Packets:</h2>
      <div className="flex flex-row justify-end">
        <button onClick={() => loadData()} className="bg-content-bg-light dark:bg-content-bg-dark border px-3 py-2 mr-2 rounded">
          Refresh
        </button>

        <Popover>
          {({ open }) => (<>
            <Popover.Button className="bg-content-bg-light dark:bg-content-bg-dark border px-3 py-2 rounded flex flex-row">
              Columns
              <FiChevronDown className={open ? "mt-1 ml-1 rotate-180 transform ease-in-out" : "mt-1 ml-1"}/>
            </Popover.Button>
            <Popover.Panel className="absolute z-10 mt-2">
              <div className="bg-content-bg-light dark:bg-content-bg-dark p-3 rounded">
                {table.getAllLeafColumns().map(column => { return (
                  <div key={column.id} className="px-1 py-[0.1rem]">
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
          </>)}
        </Popover>
      </div>

      <PacketTable {...{table, loading}} />
    </div>
  );
}

function stateToString(state: PacketStates) {
  switch (state) {
    case PacketStates.SENT || PacketStates.POLY_RECV: return 'Relaying';
    case PacketStates.RECV || PacketStates.WRITE_ACK || PacketStates.POLY_WRITE_ACK: return 'Confirming';
    case PacketStates.ACK: return 'Delivered';
  }
}
