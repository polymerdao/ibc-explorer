'use client';

import { useEffect, useState } from 'react';
import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable }
from '@tanstack/react-table';
import { Table } from 'components/table';
import { SimIcon } from 'components/icons';
import { Modal } from 'components/modal';
import { IdentifiedConnection, State } from 'cosmjs-types/ibc/core/connection/v1/connection';
const { shuffle } = require('txt-shuffle');

const columnHelper = createColumnHelper<IdentifiedConnection>();
const columns = [
  columnHelper.accessor('id', {
    header: 'Connection ID',
    cell: props =>
    <div className="flex flex-row">
      <span className="whitespace-nowrap">
        {props.getValue()}
      </span>
      {(props.row.original.counterparty?.clientId.toLowerCase().includes('sim') ||
        props.row.original.clientId?.toLowerCase().includes('sim')) ?
        <div className="ml-2"><SimIcon /></div>
        : null}
    </div>,
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
    cell: props => <span className="whitespace-nowrap">{props.getValue()}</span>,
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

const PAGE_SIZE = 20;

export default function Connections() {
  const [header, setHeader] = useState<string>('');
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
    shuffle({
      text: 'Connections',
      fps: 20,
      delayResolve: 0,
      direction: 'right',
      animation: 'show',
      delay: 0.3,
      duration: 1,
      onUpdate: (output: string) => {setHeader(output);}
    });
  }, []);

  function loadData() {
    setLoading(true);
    fetch('/api/ibc/connections')
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
        pageSize: PAGE_SIZE
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
        open={error}
        onClose={() => setError(false)}
        content={<>
          <h2>Error</h2>
          <p className="mt-1 mr-8">There was an issue fetching channel data</p>
        </>}
      />

      <div className="flex flex-row justify-between">
        <h1 className="ml-1 h-8">{header}</h1>
        <button onClick={() => loadData()} className="btn">
          Reload
        </button>
      </div>

      <Table {...{table, loading, pageLimit: PAGE_SIZE}} />
    </div>
  );
}

function stateToString(state: State) {
  const stringState = state.toString();
  switch (stringState) {
    case 'STATE_OPEN': return 'Open'
    case 'STATE_INIT': return 'Initialized'
    case 'STATE_TRYOPEN':
    case 'STATE_UNINITIALIZED_UNSPECIFIED':
      return 'Pending'
    default:
      return 'Pending'
  }
}
