'use client';

import { useEffect, useState } from 'react';
import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable }
from '@tanstack/react-table';
import { Table } from 'components/table';
import { Modal } from 'components/modal';
import { ChainCell } from 'components/chain-cell';
import { Client } from 'utils/types/client';
import { shortenHex } from 'components/format-strings';
const { shuffle } = require('txt-shuffle');

const columnHelper = createColumnHelper<Client>();
const columns = [
  columnHelper.accessor('clientId', {
    header: 'Client ID',
    enableHiding: true
  }),
  columnHelper.accessor('clientState.chainId', {
    header: 'Chain',
    id: 'chain',
    cell: props => (
      <div className="">
        <div className="ml-2.5"><ChainCell chain={props.getValue()} /></div>
      </div>
    ),
    enableHiding: true
  }),
  columnHelper.accessor('clientState.dispatcherAddr', {
    header: 'Dispatcher',
    cell: props => shortenHex(props.getValue(), true),
    enableHiding: true
  }),
  columnHelper.accessor('clientState.revisionHeight', {
    header: 'Revision Height',
    enableHiding: true
  }),
  columnHelper.accessor('clientState.revisionNumber', {
    id: 'revisionNumber',
    header: 'Revision Number',
    enableHiding: true
  })
];

const PAGE_SIZE = 20;

export default function Clients() {
  const [header, setHeader] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    revisionNumber: false
  });

  useEffect(() => {
    loadData();
    shuffle({
      text: 'Clients',
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
    fetch('/api/ibc/clients')
      .then(res => {
        if (!res.ok) {
          setErrorMessage(res.statusText);
          setError(true);
          setLoading(false);
        }
        return res.json();
      })
      .then(data => {
        setClients(data);
        setLoading(false);
      }).catch(err => {
        setError(true);
        setLoading(false);
      });
  }

  const table = useReactTable({
    data: clients,
    columns,
    state: {
      columnVisibility
    },
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div>
      <Modal 
        open={error}
        onClose={() => {
          setError(false);
          setErrorMessage('');
        }}
        content={<>
          <h2>Error</h2>
          <p className="mt-1 mr-8">
            There was an issue fetching packet data {errorMessage? `: ${errorMessage}` : ''}
          </p>
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
