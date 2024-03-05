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
import { IbcTable } from "components/ibc-table";
import { IdentifiedChannel, State } from "cosmjs-types/ibc/core/channel/v1/channel";
import { Modal } from "components/modal";

const columnHelper = createColumnHelper<IdentifiedChannel>();
const columns = [
  columnHelper.accessor('channelId', {
    header: 'Channel ID',
    enableHiding: true,
    enableSorting: true,
    sortingFn: 'alphanumeric'
  }),
  columnHelper.accessor('state', {
    header: 'State',
    cell: props => <span>{ stateToString(props.getValue()) }</span>,
    enableHiding: true
  }),
  columnHelper.accessor('portId', {
    header: 'Port ID',
    enableHiding: true
  }),
  columnHelper.accessor('counterparty.channelId', {
    header: 'Counterparty Channel',
    enableHiding: true
  }),
  columnHelper.accessor('counterparty.portId', {
    header: 'Counterparty Port',
    enableHiding: true
  }),
  columnHelper.accessor('connectionHops', {
    header: 'Connection Hops',
    enableHiding: true
  })
];

export default function Packets() {
  const [connections, setConnections] = useState<IdentifiedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'channelId',
    desc: true
  }]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    fetch("/api/ibc/channels")
      .then(res => {
        if (!res.ok) {
          console.error(res.status);
          setError(true);
          setLoading(false);
        }
        return res.json();
      })
      .then(data => {
        setConnections(data);
        setLoading(false);
      }).catch(err => {
        setError(true);
        setLoading(false);
      });
  }

  const table = useReactTable({
    data: connections,
    state: {
      columnVisibility,
      sorting
    },
    columns,
    initialState: {
      pagination: {
        pageSize: 20
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="">
      <Modal
        open={error} setOpen={setError}
        content={<>
          <h1>Error</h1>
          <p className="mt-2">There was an issue fetching channel data</p>
        </>}
      />

      <div className="flex flex-row justify-between mr-28">
        <h1 className="ml-1">Channels</h1>
        <button onClick={() => loadData()} className="btn btn-accent z-10 mr-4">
          Reload
        </button>
      </div>

      <IbcTable {...{table, loading}} />
    </div>
  );
}

function stateToString(state: State) {
  const stringState = state.toString();
  switch (stringState) {
    case "STATE_OPEN": return 'Open'
    case "STATE_CLOSED": return 'Closed'
    case "STATE_INIT": return 'Initialized'
    case "STATE_TRYOPEN":
    case "UNRECOGNIZED":
    case "STATE_UNINITIALIZED_UNSPECIFIED":
      return 'Pending'
    default:
      return 'Pending'
  }
}
