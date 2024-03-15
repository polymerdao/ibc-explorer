import { 
  Table,
  flexRender,
  Column,
} from "@tanstack/react-table";
import { Transition, Popover } from "@headlessui/react";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Modal } from "components/modal";
import { CHAIN_CONFIGS } from "utils/chains/configs";
import { Packet } from "utils/types/packet";
import { Client } from "utils/types/client";
import { IdentifiedConnection } from "cosmjs-types/ibc/core/connection/v1/connection";
import { IdentifiedChannel } from "cosmjs-types/ibc/core/channel/v1/channel";
import { classNames } from "utils/functions";
import { useState } from "react";
import { Fragment } from 'react';

interface IbcTableProps<TableType> {
  table: Table<TableType>,
  loading: boolean,
  rowDetails?: (row: TableType) => JSX.Element
}

export function IbcTable<TableType extends Packet | Client | IdentifiedChannel | IdentifiedConnection>
  ({ table, loading, rowDetails }: IbcTableProps<TableType>)
{
  const [rowSelected, setRowSelected] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableType | null>(null);

  return (
    <div className="relative -top-[2.64rem]">

      {/* Table View Options */}
      <div className="flex flex-row justify-between items-end mb-3">
        <span className="ml-1 text-slate-700 dark:text-slate-300">
          {table.getFilteredRowModel().rows.length} total results
        </span>

        <div className="flex flex-col items-end">
          <Popover className="mb-6">
            {({ open }) => (<>
              <Popover.Button className="btn flex flex-row pr-[0.8rem]">
                Columns
                <FiChevronDown className={classNames(
                  open
                  ? "scale-y-[-1]"
                  : ""
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
                <Popover.Panel className="absolute z-20 mt-2 right-0">
                  <div className="bg-content-bg-light dark:bg-content-bg-dark pl-6 pr-9 py-5 border rounded-md border-slate-500">
                    {table.getAllLeafColumns().map(column => { return (
                      <div key={column.id} className="py-[0.17rem]">
                        <label>
                          <input
                            className="appearance-none border border-slate-500 bg-transparent rounded-lg w-3 h-3 mr-3 transition-colors ease-in-out duration-150
                              checked:bg-emerald-500 checked:border-transparent"
                            {...{
                              type: 'checkbox',
                              checked: column.getIsVisible(),
                              onChange: column.getToggleVisibilityHandler(),
                            }}
                          />
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
      <div className="w-full border border-slate-500 rounded-md bg-content-bg-light dark:bg-content-bg-dark overflow-y-auto table-height scroll-smooth min-h-72">
        {loading && 
          <div className="absolute mt-40 z-10 w-full grid justify-items-center font-mewdium">
            <div>Loading...</div>
          </div>
        }
        {(!loading && !table.getFilteredRowModel().rows.length) &&
          <div className="absolute mt-40 z-10 w-full grid justify-items-center font-medium">
            <div>No results</div>
          </div>
        }
        <div className="absolute mt-20 left-[0.8px] w-[calc(100%-2px)] z-10 border-b-[1.6px] border-slate-500"></div>
        <table
          className="min-w-full"
          style={{width: table.getCenterTotalSize()}}>
          <thead className="sticky top-0 h-20 bg-content-bg-light dark:content-bg-dark">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan} 
                    className={classNames(
                      header.id === 'destChain'
                      ? "pl-4"
                      : "pl-8"
                      , "pb-2 h-20 dark:bg-bg-dark last:pr-6 whitespace-nowrap"
                    )}
                    style={{width: header.getSize()}}>
                    {header.isPlaceholder ? null : (
                      <div className="h-12 flex flex-col items-start">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanFilter() &&
                          <div>
                            <ColumnFilter column={header.column} table={table} />
                          </div>
                        }
                      </div>
                    )}
                  </th>
                )
              })}
              </tr>
            ))}
          </thead>
          <tbody className="min-h-32">
            {loading ? (
              <tr>
                <td></td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={
                  'h-12 w-full hover:bg-sky-100 dark:hover:bg-sky-950 transition-colors ease-in-out duration-200 even:bg-bg-light dark:even:bg-bg-dark ' +
                  `${rowDetails ? 'hover:cursor-pointer ' : ''}` +
                  `${row.getAllCells().some(cell => {
                    if (typeof cell.renderValue() === 'string') {
                      return (cell.renderValue() as string).toLowerCase().includes('sim');
                    } else {
                      return false;
                    }
                  })
                    ? 'bg-orange-50 even:bg-orange-100 dark:bg-content-bg-dark dark:even-bg-bg-dark dark:text-orange-300 ' : ''}`
                  }
                  onClick={() => {if (rowDetails) {
                    setSelectedRow(row.original);
                    setRowSelected(true); 
                  }}}>
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={classNames(
                        cell.column.id === 'destChain'
                        ? "pl-4"
                        : "pl-8"
                        , "last:pr-6"
                      )}
                      style={{width: cell.column.getSize()}}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      { /* Row Details Modal */}
      {rowDetails && 
        <Modal
          open={rowSelected} setOpen={setRowSelected}
          content={rowDetails(selectedRow as TableType)}
        />
      }

      { /* Pagination */ }
      <div className="flex flex-row justify-center gap-2 mt-4">
        <button
          className="rounded p-2 disabled:opacity-75 enabled:hover:bg-content-bg-light enabled:dark:hover:bg-content-bg-dark transition-colors ease-in-out duration-200"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          <FiChevronLeft className="w-5 h-5"/>
        </button>
        <span className="flex items-center gap-1">
          Page
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            className="border border-slate-500/50 px-1 py-0.5 rounded w-[3.3rem] text-center mx-1 bg-content-bg-light dark:bg-content-bg-dark"
            aria-label="Go to page"
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
          />
          of {table.getPageCount()}
        </span>
        <button
          className="rounded p-2 disabled:opacity-75 enabled:hover:bg-content-bg-light enabled:dark:hover:bg-content-bg-dark transition-colors ease-in-out duration-200"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          <FiChevronRight className="w-5 h-5"/>
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
        className="w-28 border h-6 border-slate-500 shadow-none rounded dark:bg-bg-dark font-medium text-slate-700 dark:text-slate-300 dark:bg-content-bg-dark"
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
        className="inpt shadow-none h-6 pl-1 w-36 border border-slate-500 rounded dark:bg-bg-dark font-medium dark:bg-content-bg-dark"
        aria-label={"Filter by " + column.columnDef.header as string}
      />
    );
  } else {
    return null;
  }
}
