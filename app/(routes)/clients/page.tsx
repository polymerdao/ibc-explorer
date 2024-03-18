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
import { IbcTable } from "components/table/ibc-table";
import { BooleanCell } from "components/table/boolean-cell";
import { Modal } from "components/modal";
import { Client } from "utils/types/client";

const columnHelper = createColumnHelper<Client>();
const columns = [
  columnHelper.accessor('clientId', {
    header: 'Client ID',
    enableHiding: true
  }),
  columnHelper.accessor(row => (row.clientId.includes('sim')), {
    header: 'Sim Client',
    cell: props => <BooleanCell value={props.getValue()} />,
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
        pageSize: 20
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
        open={error} setOpen={setError}
        content={<>
          <h1>Error</h1>
          <p className="mt-2">There was an issue fetching client data</p>
        </>}
      />

      <div className="flex flex-row justify-between mr-28">
        <h1 className="ml-1">Clients</h1>
        <button onClick={() => loadData()} className="btn btn-accent z-10 mr-4">
          Reload
        </button>
      </div>

      <IbcTable {...{table, loading}} />
    </div>
  );
}
