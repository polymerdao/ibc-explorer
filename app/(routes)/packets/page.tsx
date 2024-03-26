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
import { Modal } from "components/modal";
import { Packet } from "utils/types/packet";
import { PacketDetails } from "./packets-details";
import { StateCell, stateToString } from "./state-cell";
import { ChainCell, Arrow } from "./chain-cell";
import { hideMiddleChars } from "utils/functions";

const columnHelper = createColumnHelper<Packet>();
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableHiding: true
  }),
  columnHelper.accessor(row => stateToString(row.state), {
    header: 'State',
    cell: props => StateCell(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sendTx', {
    header: 'Send Tx',
    cell: props => hideMiddleChars(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sourceChain', {
    header: 'Source',
    enableHiding: true,
    cell: props => (
      <div className="flex flex-row justify-between">
        <div className="ml-4"><ChainCell chain={props.getValue()} /></div>
        <Arrow />
      </div>
    )
  }),
  columnHelper.accessor('destChain', {
    header: 'Dest',
    cell: props => (
      <div className="flex flex-row justify-between">
        <div className="ml-5"><ChainCell chain={props.getValue()} /></div>
      </div>
    ),
    enableHiding: true,
    maxSize: 100
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
    enableHiding: true,
    enableColumnFilter: false
  }),
  columnHelper.accessor('ackTx', {
    header: 'Ack Tx',
    cell: props => hideMiddleChars(props.getValue() ?? ''),
    enableHiding: true,
    enableColumnFilter: false
  }),
  columnHelper.accessor('createTime', {
    header: 'Create Time',
    enableHiding: true,
    cell: props => new Date(props.getValue()*1000).toLocaleString(),
    enableSorting: true,
    sortingFn: 'alphanumeric',
    enableColumnFilter: false
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
