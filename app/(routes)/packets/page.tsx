'use client';

import { useEffect, useState } from "react";
import { 
  Table,
  flexRender,
  Column,
  ColumnDef,
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from "@tanstack/react-table";
import { Packet, PacketStates } from "utils/types/packet";
import { CHAIN_CONFIGS } from "utils/chains/configs";

const columnHelper = createColumnHelper<Packet>();
const columns = [
  columnHelper.accessor('state', {
    header: 'State',
    cell: props => <span>{ stateToString(props.getValue()) }</span>,
    enableColumnFilter: false
  }),
  columnHelper.accessor('sendTx', {
    header: 'Send Tx',
    cell: props => hideMiddleChars(props.getValue())
  }),
  columnHelper.accessor('sourceChain', {
    header: 'Source Chain'
  }),
  columnHelper.accessor('destChain', {
    header: 'Dest Chain'
  }),
  columnHelper.accessor('sourcePortAddress', {
    header: 'Src Port Address',
    cell: props => hideMiddleChars(props.getValue())
  }),
  columnHelper.accessor('sourceChannelId', {
    header: 'Src Channel ID'
  }),
  // Create column that combines that subtracts difference between create and end time
  columnHelper.accessor(row => (row.endTime ?? 0) - row.createTime, {
    header: 'Round-trip',
    cell: props => {
      if (props.getValue() < 0) {
        return <span>...</span>;
      }
      return <span>{Math.round(props.getValue() / 1000)} s</span>;
    },
    enableColumnFilter: false
  })

];

export default function Packets() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mock-packets").then(res => res.json()).then(data => {
      setPackets(data);
      setLoading(false);
    });
  }, []);

  const reloadData = () => {
    setLoading(true);
    fetch("/api/mock-packets?size=100").then(res => res.json()).then(data => {
      setPackets(data);
      setLoading(false);
    });
  };

  return (
    <div>
      <h2>Search for Packets:</h2>
      <button onClick={() => reloadData()} className="border p-2">
        Refresh
      </button>
      {loading && <p>Loading...</p>}
      {!loading && <>
        <PacketTable {...{
          data: packets,
          columns
        }} />
      </> }
    </div>
  );
}

function hideMiddleChars(str: string) {
  const shortened =  str.slice(0, 7) + '...' + str.slice(-5);
  return <span title={str}>{shortened}</span>;
}

function stateToString(state: PacketStates) {
  switch (state) {
    case PacketStates.ACK: return 'Delivered';
    case PacketStates.POLY_WRITE_ACK || PacketStates.POLY_RECV: return 'Relaying';
    case PacketStates.RECV || PacketStates.SENT || PacketStates.WRITE_ACK: return 'Confirming';
  }
}

function PacketTable({ data, columns }: { data: Packet[], columns: ColumnDef<Packet, any>[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              return (
                <th key={header.id} colSpan={header.colSpan} className="pl-8 first:pl-0">
                  {header.isPlaceholder ? null : (
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanFilter() ? (
                        <div>
                          <ColumnFilter column={header.column} table={table} />
                        </div>
                      ) : null}
                    </div>
                  )}
                </th>
              )
            })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="pl-8 first:pl-0">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination table={table} />
    </div>
  )
}

function ColumnFilter({ column, table }: { column: Column<any, any>, table: Table<any> }) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();
  
  if (column.id === 'sourceChain' || column.id === 'destChain') {
    return (
      <select
        value={(columnFilterValue ?? '') as string}
        onChange={e => column.setFilterValue(e.target.value)}
        className="w-36 border shadow rounded dark:bg-bg-dk"
      >
        <option value="">All</option>
        {
          Object.entries(CHAIN_CONFIGS).map(([key, value]) => (
            <option key={key} value={key}>{ value.display }</option>
          ))
        }
      </select>
    );
  } else if (typeof firstValue === 'string') {
    return (
      <input
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={e => column.setFilterValue(e.target.value)}
        placeholder={`Search...`}
        className="w-36 border shadow rounded dark:bg-bg-dk"
      />
    );
  } else {
    return null;
  }
}

function Pagination({ table }: { table: Table<any> }) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="border rounded p-1"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}>
        {'<'}
      </button>
      <button
        className="border rounded p-1"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}>
        {'>'}
      </button>
      <span className="flex items-center gap-1">
        <div>Page</div>
        <strong>
          {table.getState().pagination.pageIndex + 1} of {' '}
          {table.getPageCount()}
        </strong>
      </span>
      <span className="flex items-center gap-1">
        | Go to page:
        <input
          type="number"
          defaultValue={table.getState().pagination.pageIndex + 1}
          onChange={e => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0
            table.setPageIndex(page)
          }}
          className="border p-1 rounded w-16 dark:bg-bg-dk"
        />
      </span>
      <select
        value={table.getState().pagination.pageSize}
        onChange={e => {
          table.setPageSize(Number(e.target.value))
        }}
        className="dark:bg-bg-dk">
        {[10, 20, 30, 40, 50].map(pageSize => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  )
}