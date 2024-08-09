import { 
  Table as TanStackTable,
  flexRender
} from '@tanstack/react-table';
import { Transition, Popover } from '@headlessui/react';
import { FiChevronDown, FiChevronLeft, FiChevronsLeft, FiChevronRight } from 'react-icons/fi';
import { Modal } from 'components/modal';
import { Packet } from 'utils/types/packet';
import { Client } from 'utils/types/client';
import { IdentifiedConnection } from 'cosmjs-types/ibc/core/connection/v1/connection';
import { IdentifiedChannel } from 'utils/types/channel';
import { classNames } from 'utils/functions';
import { useState, Fragment, useEffect } from 'react';

interface TableProps<TableType> {
  table: TanStackTable<TableType>,
  loading: boolean,
  rowDetails?: (row: TableType) => JSX.Element,
  pageNumber?: number,
  setPageNumber?: (pageNumber: number) => void,
  pageLimit: number
}

export function Table<TableType extends Packet | Client | IdentifiedChannel | IdentifiedConnection>
  ({ table, loading, rowDetails, pageNumber, setPageNumber, pageLimit }: TableProps<TableType>)
{
  const [rowSelected, setRowSelected] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableType | null>(null);
  const [delayedLoading, setDelayedLoading] = useState<boolean>(true);
  const [hideCells, setHideCells] = useState<boolean>(true);
  const [originalUrl, setOriginalUrl] = useState<string>('');

  useEffect(() => {
    if (!loading) {
      setDelayedLoading(false);
      const timeout = setTimeout(() => {
        setHideCells(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
    if (loading) {
      setHideCells(true);
      const timeout = setTimeout(() => {
        setDelayedLoading(true);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  return (
    <div className="relative mt-4 mb-10">

      { /* Table View Options */ }
      <div className="flex flex-row justify-between mb-1 ml-1.5 text-gray-700 dark:text-gray-300">

        { /* Columns */ }
        <Popover>
          {({ open }) => (<>
            <Popover.Button className="flex flex-row h-[1.5rem] mt-[0.45rem]">
              Columns
              <FiChevronDown className={classNames(
                open
                ? 'scale-y-[-1]'
                : ''
                , 'mt-[0.28rem] ml-1.5 transition ease-in-out duration-200'
              )}/>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="transform scale-95 opacity-0 -translate-y-6"
              enterTo="transform scale-100 opacity-100"
              leave="ease-in duration-200"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0">
              <Popover.Panel className="absolute z-20 mt-2 left-0">
                <div className="bg-vapor dark:bg-black pl-6 pr-9 py-4 border-[0.5px] border-gray-500">
                  {table.getAllLeafColumns().map(column => { return (
                    <div key={column.id} className="py-[0.17rem] flex w-full">
                      <label className="hover:cursor-pointer w-full">
                        <input
                          className="appearance-none border border-gray-500 bg-transparent rounded-lg w-3 h-3 mr-3 transition-colors ease-in-out duration-150
                            checked:bg-turquoise checked:border-transparent"
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

        { /* Pagination */ }
        <div className="flex flex-row justify-center items-center">
          <button
            className="btn-secondary"
            onClick={() => {
              if (setPageNumber) {
                setPageNumber(1)
              } else {
                table.setPageIndex(0);
              }
            }}
            disabled={
              (pageNumber ? pageNumber < 2 : !table.getCanPreviousPage()) ||
              loading
            }>
            <FiChevronsLeft className="w-6 h-6"/>
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              if (setPageNumber && pageNumber) {
                setPageNumber(pageNumber - 1)
              } else {
                table.setPageIndex(table.getState().pagination.pageIndex - 1);
              }
            }}
            disabled={
              (pageNumber ? pageNumber < 2 : !table.getCanPreviousPage()) ||
              loading
            }>
            <FiChevronLeft className="w-5 h-5"/>
          </button>

          <span className="mx-4 mb-[2px]">{pageNumber || table.getState().pagination.pageIndex + 1}</span>

          <button
            className="btn-secondary"
            onClick={() => {
              if (setPageNumber && pageNumber) {
                setPageNumber(pageNumber + 1)
              } else {
                table.setPageIndex(table.getState().pagination.pageIndex + 1);
              }
            }}
            disabled={
              (pageNumber ? table.getRowCount() < pageLimit : !table.getCanNextPage()) ||
              loading
            }>
            <FiChevronRight className="w-5 h-5"/>
          </button>
        </div>
      </div>

      { /* Table */ }
      <div className="w-full bg-white dark:bg-transparent overflow-y-auto scroll-smooth min-h-72">
        {(!delayedLoading && !table.getFilteredRowModel().rows.length) &&
          <div className="absolute mt-36 z-10 w-full grid justify-items-center font-medium font-mono text-lg">
            <div>No results</div>
          </div>
        }
        <table
          className="min-w-full border-separate border-spacing-y-[0px]"
          style={{width: table.getCenterTotalSize()}}>
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan} 
                    className={classNames(
                      header.id === 'destClient'
                      ? 'pl-2'
                      : 'pl-5'
                      , 'py-2 dark:bg-black first:pl-6 last:pr-6 whitespace-nowrap font-medium border-y-[0.5px] border-gray-500'
                    )}
                    style={{width: header.getSize()}}>
                    {(header.isPlaceholder) ? null : (
                      <div className="h-11 grid justify-items-start content-center">
                        <div className="ml-2 transition-opacity ease-in-out duration-150"> 
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      </div>
                    )}
                  </th>
                )
              })}
              </tr>
            ))}
          </thead>
          <tbody className="relative z-0 min-h-32 font-mono">
            {delayedLoading ? (
              Array.from({ length: pageLimit }).map((_, index) => (
                <tr 
                  className="w-full h-[3.5rem]"
                  key={index}>
                  {table.getHeaderGroups()[0].headers.map(column => (
                    <td
                      key={column.id}
                      style={{ width: column.getSize() }}
                      className={classNames(
                        column.id === 'destClient'
                        ? 'pl-2'
                        : 'pl-7'
                        , 'first:pl-9 last:pr-6'
                      )}>
                      <div
                        className="opacity-0 h-5 w-3/4 bg-vapor animate-initial animate-pulse-light"
                        style={{animationDelay: columnToDelay(column.index) }}>
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={classNames(
                    rowDetails
                    ? 'hover:cursor-pointer'
                    : ''
                    , 'h-[3.4rem] w-full bg-black hover:bg-vapor/[5%] transition-colors ease-in-out duration-200',
                  )}
                  onClick={() => {if (rowDetails) {
                    setOriginalUrl(window.location.href);
                    setSelectedRow(row.original);
                    if ('sequence' in row.original) {
                      window.history.replaceState({}, '', `/packets?searchValue=${row.original.id}`);
                    } else if ('channelId' in row.original) {
                      window.history.replaceState({}, '', `/channels?channelId=${row.original.channelId}`);
                    }
                    setRowSelected(true); 
                  }}}>
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={classNames(
                        cell.column.id === 'destClient'
                        ? 'pl-2'
                        : 'pl-7'
                        , hideCells
                        ? 'opacity-0'
                        : 'opacity-100'
                        , 'first:pl-9 last:pr-6 transition-opacity ease-in-out duration-150 border-b-[0.5px] border-gray-700'
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

      { /* Row Details Modal */ }
      {rowDetails && 
        <Modal
          open={rowSelected}
          onClose={() => {
            setRowSelected(false);
            window.history.replaceState({}, '', originalUrl);
          }}
          content={rowDetails(selectedRow as TableType)}
        />
      }
    </div>
  )

  function columnToDelay(index: number): string {
    return `${(index * 0.3)}s`;
  }
}
