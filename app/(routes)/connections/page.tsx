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
import { IdentifiedConnection, State } from "cosmjs-types/ibc/core/connection/v1/connection";
import { Modal } from "components/modal";

const columnHelper = createColumnHelper<IdentifiedConnection>();
const columns = [
  columnHelper.accessor('id', {
    header: 'Connection ID',
    cell: props => <span className="whitespace-nowrap">{props.getValue()}</span>,
    enableHiding: true,
    enableSorting: true,
    sortingFn: 'alphanumeric'
  }),
  columnHelper.accessor('clientId', {
    header: 'Client ID',
    enableHiding: true
  }),
  columnHelper.accessor('state', {
    header: 'State',
    cell: props => <span>{ stateToString(props.getValue()) }</span>,
    enableHiding: true
  }),
  columnHelper.accessor('counterparty.connectionId', {
    header: 'Counterparty Connection',
    enableHiding: true
  }),
  columnHelper.accessor('counterparty.clientId', {
    header: 'Counterparty Client',
    enableHiding: true
  }),
  columnHelper.accessor('delayPeriod', {
    header: 'Delay Period',
    enableHiding: true
  })
];

export default function Packets() {
  const [connections, setConnections] = useState<IdentifiedConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'id',
    desc: true
  }]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    fetch("/api/ibc/connections")
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
    columns,
    state: {
      columnVisibility,
      sorting
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
    <div className="">
      <Modal
        open={error} setOpen={setError}
        content={<>
          <h1>Error</h1>
          <p className="mt-2">There was an issue fetching connection data</p>
        </>}
      />

      <div className="flex flex-row justify-between mr-28">
        <h1 className="ml-1">Connections</h1>
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
    case "STATE_INIT": return 'Initialized'
    case "STATE_TRYOPEN":
    case "STATE_UNINITIALIZED_UNSPECIFIED":
      return 'Pending'
    default:
      return 'Pending'
  }
}
