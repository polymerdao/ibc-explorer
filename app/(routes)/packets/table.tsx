import { 
  Table,
  flexRender,
  Column
} from "@tanstack/react-table";
import { Popover } from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { Modal } from "components/modal";
import { CHAIN_CONFIGS } from "utils/chains/configs";
import { Packet } from "utils/types/packet";
import { classNames } from "utils/functions";
import { useState } from "react";
import { Fragment } from 'react';

export function PacketTable({ table, loading }: { table: Table<Packet>, loading: boolean }) {
  const [rowSelected, setRowSelected] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<Packet | null>(null);

  return (
    <div className="relative -top-[2.64rem]">
      {/* Table View Options */}
      <div className="flex flex-row justify-between items-end mb-3">
        <span className="ml-1 text-slate-700 dark:text-slate-300">
          {table.getFilteredRowModel().rows.length} total packets
        </span>

        <div className="flex flex-col items-end">
          <Popover className="mb-6">
            {({ open }) => (<>
              <Popover.Button className="btn flex flex-row pr-[0.8rem]">
                Columns
                <FiChevronDown className={classNames(
                  open
                    ? 'scale-y-[-1]'
                    : ''
                    , "mt-[0.28rem] ml-1.5 transition ease-in-out duration-200"
                )}/>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="transform scale-95 opacity-0 -translate-y-6 z-30"
                enterTo="transform scale-100 opacity-100 z-30"
                leave="ease-in duration-200"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0">
                <Popover.Panel className="absolute z-10 mt-2 right-0 w-56">
                  <div className="bg-content-bg-light dark:bg-content-bg-dark px-6 py-5 border rounded-md border-slate-500">
                    {table.getAllLeafColumns().map(column => { return (
                      <div key={column.id} className="py-[0.13rem]">
                        <label>
                          <input
                            className="appearance-none border border-slate-500 bg-transparent rounded-lg w-3 h-3 mr-2 transition-colors ease-in-out duration-150
                              checked:bg-emerald-500 checked:border-transparent"
                            {...{
                              type: 'checkbox',
                              checked: column.getIsVisible(),
                              onChange: column.getToggleVisibilityHandler(),
                            }}
                          />{' '}
                          {column.columnDef.header as string}
                        </label>
                      </div>
                      )
                    })}
                  </div>
                </Popover.Panel>
              </Transition>
            </>)}
          </Popover>

          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            aria-label="Rows per page"
            className="mr-1 bg-transparent text-slate-700 dark:text-slate-300">
            {[10, 20, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} Rows / Page
              </option>
            ))}
          </select>

        </div>
      </div>

      { /* Table */ }
      <div className="w-full border border-slate-500 rounded-md bg-content-bg-light dark:bg-content-bg-dark overflow-y-auto table-height">
        <div className="absolute top-[180px] left-[0.8px] w-[calc(100%-2px)] border-b-[1.6px] border-slate-500"></div>
        <table className="w-full">
          <thead className="sticky top-0 h-20 bg-content-bg-light dark:content-bg-dark">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan} className="pl-8 dark:bg-bg-dark">
                    {header.isPlaceholder ? null : (
                      <div className="flex flex-col items-start">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanFilter() ? (
                          <div>
                            <ColumnFilter column={header.column} table={table} />
                          </div>
                        ) : 
                          <div className="h-[1.6rem] w-1"></div>}
                      </div>
                    )}
                  </th>
                )
              })}
              </tr>
            ))}
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleLeafColumns.length} className="text-center">
                  Loading...
                </td>
              </tr>
            </tbody>
          ) : (
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id} 
                className="h-10 w-full hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors ease-in-out duration-200 even:bg-bg-light dark:even:bg-bg-dark hover:cursor-pointer"
                onClick={() => {
                  setSelectedRow(row.original);
                  setRowSelected(true); 
                }}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="pl-8">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>)}
        </table>
      </div>

      { /* Packet Details Modal */}
      <Modal
        open={rowSelected} setOpen={setRowSelected}
        title="Packet Details"
        content={<>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <h3>Packet ID</h3>
              <p>{selectedRow?.id}</p>
            </div>
            <div className="flex flex-row justify-between">
              <h3>Source Chain</h3>
              <p>{selectedRow?.sourceChain}</p>
            </div>
            <div className="flex flex-row justify-between">
              <h3>Destination Chain</h3>
              <p>{selectedRow?.destChain}</p>
            </div>
            <div className="flex flex-row justify-between">
              <h3>Received Tx</h3>
              <p>{selectedRow?.rcvTx}</p>
            </div>
            <div className="flex flex-row justify-between">
              <h3>Acknowledged Tx</h3>
              <p>{selectedRow?.ackTx}</p>
            </div>
          </div>
        </>}
      />

      { /* Pagination */ }
      <div className="flex flex-row justify-center gap-2 mt-4">
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          {'<'}
        </button>
        <span className="flex items-center gap-1">
          Page
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            className="border px-1 rounded w-16 dark:bg-bg-dark w-12 bg-transparent text-center"
            aria-label="Go to page"
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
          />
          of {table.getPageCount()}
        </span>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          {'>'}
        </button>
      </div>
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
        className="w-36 border border-slate-500 shadow-none rounded dark:bg-bg-dark font-medium text-slate-700 dark:text-slate-300"
        aria-label={"Filter by " + column.columnDef.header as string}>
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
        className="inpt shadow-none w-36 border border-slate-500 shadow rounded dark:bg-bg-dark font-medium"
        aria-label={"Filter by " + column.columnDef.header as string}
      />
    );
  } else {
    return null;
  }
}
