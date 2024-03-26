'use client';

import { useEffect, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table';
import { IbcTable } from 'components/table/ibc-table';
import { IdentifiedChannel, State } from 'cosmjs-types/ibc/core/channel/v1/channel';
import { Modal } from 'components/modal';
import { SimIcon } from 'components/icons';

const columnHelper = createColumnHelper<IdentifiedChannel>();
const columns = [
  columnHelper.accessor('channelId', {
    header: 'Channel ID',
    cell: props =>
    <div className="flex flex-row">
      <span className="whitespace-nowrap">
        {props.getValue()}
      </span>
      {(props.row.original.counterparty?.portId?.toLowerCase().includes('sim') ||
        props.row.original.portId?.toLowerCase().includes('sim')) ?
        <div className="ml-2"><SimIcon /></div>
        : null}
    </div>,
    enableHiding: true,
    enableSorting: true,
    sortingFn: 'alphanumeric'
  }),
  columnHelper.accessor(row => stateToString(row.state), {
    header: 'State',
    cell: props => <span>{props.getValue()}</span>,
    enableHiding: true,
    enableColumnFilter: true
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
    enableHiding: true,
    enableColumnFilter: false
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
        pageSize: 10
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="h-0">
      <Modal
        open={error} setOpen={setError}
        content={<>
          <h1>Error</h1>
          <p className="mt-2">There was an issue fetching channel data</p>
        </>}
      />

      <div className="flex flex-row justify-between">
        <h1 className="ml-1">Channels</h1>
        <button onClick={() => loadData()} className="btn btn-accent">
          Reload
        </button>
      </div>

      <IbcTable {...{table, loading}} />
    </div>
  );
}

function stateToString(state: State) {
  switch (state) {
    case State.STATE_OPEN: return 'Open'
    case State.STATE_INIT: return 'Initialized'
    case State.STATE_CLOSED: return 'Closed'
    case State.STATE_TRYOPEN:
    case State.UNRECOGNIZED:
    case State.STATE_UNINITIALIZED_UNSPECIFIED:
      return 'Pending'
    default:
      return 'Pending'
  }
}
