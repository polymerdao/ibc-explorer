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
import { IbcTable } from "@/components/ibc-table";
import { Modal } from "components/modal";
import { SimIcon } from "components/icons";
import { Client } from "utils/types/client";

const columnHelper = createColumnHelper<Client>();
const columns = [
  columnHelper.accessor('clientId', {
    header: 'Client ID',
    enableHiding: true,
    cell: props =>
    <div className="flex flex-row">
      <span className="whitespace-nowrap">
        {props.getValue()}
      </span>
      {(props.row.original.clientId?.toLowerCase().includes('sim'))
        ? <div className="ml-2"><SimIcon /></div>
        : null
      }
    </div>,
  }),
  columnHelper.accessor('clientState.chainId', {
    header: 'Chain ID',
    enableHiding: true
  }),
  columnHelper.accessor('clientState.dispatcherAddr', {
    header: 'Dispatcher',
    enableHiding: true
  }),
  columnHelper.accessor('clientState.revisionHeight', {
    header: 'Revision Height',
    enableHiding: true
  }),
  columnHelper.accessor('clientState.revisionNumber', {
    header: 'Revision Number',
    enableHiding: true
  })
];

export default function Packets() {
  const [connections, setConnections] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    fetch("/api/ibc/clients")
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
      columnVisibility
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
        <h1 className="ml-1">Clients</h1>
        <button onClick={() => loadData()} className="btn btn-accent">
          Reload
        </button>
      </div>

      <IbcTable {...{table, loading}} />
    </div>
  );
}
