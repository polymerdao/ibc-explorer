'use client';

import { useEffect, useState } from "react";
import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable }
from "@tanstack/react-table";
import { IbcTable } from "components/table/ibc-table";
import { BooleanCell } from "components/table/boolean-cell";
import { Modal } from "components/modal";
import { PacketDetails } from "./packets-details";
import { Packet, PacketStates } from "utils/types/packet";
import { hideMiddleChars } from "utils/functions";
import { HiMiniArrowLongRight } from "react-icons/hi2";

const columnHelper = createColumnHelper<Packet>();
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableHiding: true
  }),
  columnHelper.accessor(row => stateToString(row.state), {
    header: 'State',
    enableHiding: true
  }),
  columnHelper.accessor(row => (row.sourceChain.includes('sim') || row.destChain.includes('sim')), {
    header: 'Sim Client',
    cell: props => <BooleanCell value={props.getValue()} />,
    enableHiding: true
  }),
  columnHelper.accessor('sendTx', {
    header: 'Send Tx',
    cell: props => hideMiddleChars(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sourceChain', {
    header: 'Source Chain',
    enableHiding: true,
    cell: props => (
      <div className="flex flex-row justify-between">
        <span className="whitespace-nowrap mr-1">{props.getValue()}</span>
        <HiMiniArrowLongRight className="mt-1 text-fg-light dark:text-fg-dark" />
      </div>
    ),
    minSize: 170
  }),
  columnHelper.accessor('destChain', {
    header: 'Dest Chain',
    enableHiding: true,
    minSize: 170
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
      } else if (props.getValue() < 300) {
        return <span>{Math.round(props.getValue())} s</span>;
      } else {
        return <span>{Math.round(props.getValue() / 60)} m</span>;
      }
    },
    enableColumnFilter: false,
    enableHiding: true,
    size: 175,
    minSize: 175
  }),
  columnHelper.accessor('fee', {
    header: 'Fee',
    enableColumnFilter: false,
    enableHiding: true
  }),
  columnHelper.accessor('sequence', {
    header: 'Sequence',
    enableColumnFilter: false,
    enableHiding: true,
    minSize: 120
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
  }),
  columnHelper.accessor('createTime', {
    header: 'Create Time',
    enableHiding: true,
    cell: props => new Date(props.getValue()*1000).toLocaleString(),
    enableSorting: true,
    sortingFn: 'alphanumeric'
  })
];

export default function Packets() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [searchHash, setSearchHash] = useState<string>('');
  const [searchPacket, setSearchPacket] = useState(false);
  const [foundPacket, setFoundPacket] = useState<Packet>({} as Packet);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    'sequence': false,
    'destPortAddress': false,
    'destChannelId': false,
    'Round-trip': false,
    'fee': false,
    'id': false,
    'rcvTx': false,
    'ackTx': false,
    'createTime': false
  });
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'createTime',
    desc: true
  }]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    fetch("/api/packets")
      .then(res => {
        if (!res.ok) {
          setErrorMessage(res.statusText);
          setError(true);
          setLoading(false);
        }
        return res.json();
      })
      .then(data => {
        setPackets(data);
        setLoading(false);
      }).catch(() => {
        setError(true);
        setLoading(false);
      });
  }

  function searchByHash() {
    setSearchLoading(true);
    setSearchPacket(true);
    fetch(`/api/packets?txHash=${searchHash}`)
      .then(res => {
        if (!res.ok) {
          setErrorMessage(res.statusText);
          setError(true);
          setSearchLoading(false);
        }
        return res.json();
      })
      .then(data => {
        if (data.length > 0) {
          setFoundPacket(data[0]);
        } else {
          setFoundPacket({} as Packet);
        }
        setSearchLoading(false);
      }).catch(() => {
        setError(true);
        setSearchLoading(false);
      });
  }

  const table = useReactTable({
    data: packets,
    columns,
    state: {
      columnVisibility,
      sorting
    },
    defaultColumn: {
      minSize: 150
    },
    initialState: {
      pagination: {
        pageSize: 20
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="h-0">
      <Modal 
        open={error} setOpen={setError}
        content={<>
          <h1>Error</h1>
          <p className="mt-1 mr-8">
            There was an issue fetching packet data {errorMessage? `: ${errorMessage}` : ''}
          </p>
        </>}
      />

      <Modal open={searchPacket} setOpen={setSearchPacket}
        content={
          searchLoading ?
          <p className="mt-1 mr-8">Loading...</p> :
          PacketDetails(foundPacket)
        }
      />

      <h1 className="ml-1">Packets</h1>
      <div className="flex flex-row justify-between mt-4">
        <div className="flex flex-row justify-left w-2/5 min-w-60">
          <input
            type="text"
            placeholder="Search by tx hash"
            className="text-field w-full"
            value={searchHash}
            onChange={e => setSearchHash(e.target.value)}
            onKeyUp={e => { if (e.key === 'Enter') searchByHash() }}
          />
          <button
            className="btn ml-2"
            disabled={searchLoading || searchHash.length === 0}
            onClick={() => searchByHash()}>
            Search
          </button>
        </div>
        <button onClick={() => loadData()} className="btn btn-accent">
          Reload
        </button>
      </div>

      <IbcTable {...{table, loading, rowDetails: PacketDetails}} />
    </div>
  );
}

function stateToString(state: PacketStates) {
  switch (state) {
    case PacketStates.SENT:
    case PacketStates.POLY_RECV:
      return 'Relaying'
    case PacketStates.RECV:
    case PacketStates.WRITE_ACK:
    case PacketStates.POLY_WRITE_ACK:
      return 'Confirming'
    case PacketStates.ACK:
      return 'Delivered'
  }
}
