import { 
  Table,
  flexRender,
  Column,
} from '@tanstack/react-table';
import { Transition, Popover } from '@headlessui/react';
import { FiChevronDown, FiChevronLeft, FiChevronsLeft, FiChevronRight, FiChevronsRight } from 'react-icons/fi';
import { Modal } from 'components/modal';
import { CHAIN_CONFIGS } from 'utils/chains/configs';
import { Packet } from 'utils/types/packet';
import { Client } from 'utils/types/client';
import { IdentifiedConnection } from 'cosmjs-types/ibc/core/connection/v1/connection';
import { IdentifiedChannel } from 'utils/types/channel';
import { classNames, classLogic } from 'utils/functions';
import { Select } from 'components/select';
import { OrbitLoader } from 'components/loading/loader';
import { useState, Fragment } from 'react';

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
    <div className="relative mt-4">

      {/* Table View Options */}
      <div className="flex flex-row justify-between items-end mb-2 ml-1.5 mr-1 text-slate-700 dark:text-slate-300">
        <span>
          Last {table.getFilteredRowModel().rows.length} Results
        </span>

        <div className="flex flex-row items-end space-x-3">
          <div className="hidden sm:contents">
            <Select
              onChange={value => {
                table.setPageSize(Number(value))
              }}
              options={
                [10, 20, 50, 100].map(pageSize => ({ value: pageSize, label: `${pageSize} Rows / Page` }))
              }
              containerClassName="w-[145px]"
              buttonClassName="h-[1.5rem] text-slate-700 dark:text-slate-300"
              dropdownClassName="bg-vapor dark:bg-black">
            </Select>
          </div>

          <Popover>
            {({ open }) => (<>
              <Popover.Button className="flex flex-row h-[1.5rem]">
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
                <Popover.Panel className="absolute z-20 mt-2 right-0">
                  <div className="bg-vapor dark:bg-black pl-6 pr-9 py-4 border-[0.5px] border-slate-500">
                    {table.getAllLeafColumns().map(column => { return (
                      <div key={column.id} className="py-[0.17rem] flex w-full">
                        <label className="hover:cursor-pointer w-full">
                          <input
                            className="appearance-none border border-slate-500 bg-transparent rounded-lg w-3 h-3 mr-3 transition-colors ease-in-out duration-150
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

        </div>
      </div>

      { /* Table */ }
      <div className="w-full bg-white dark:bg-black overflow-y-auto table-height scroll-smooth min-h-72
        max-h-[calc(100vh-19rem)] xl:max-h-[calc(100vh-20rem)]">
        {loading && 
          <div className="absolute mt-40 z-10 w-full grid justify-items-center">
            <OrbitLoader />
          </div>
        }
        {(!loading && !table.getFilteredRowModel().rows.length) &&
          <div className="absolute mt-40 z-10 w-full grid justify-items-center font-medium font-mono text-lg">
            <div>No results</div>
          </div>
        }
        {/* <div className="absolute mt-[79px] left-[0.8px] w-[calc(100%-2px)] z-10 border-t border-2 border-slate-300 dark:border-slate-700"></div> */}
        <table
          className="min-w-full"
          style={{width: table.getCenterTotalSize()}}>
          <thead className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan} 
                    className={classNames(
                      header.id === 'destClient'
                      ? 'pl-2'
                      : 'pl-5'
                      , 'py-2 h-20 dark:bg-black last:pr-6 whitespace-nowrap font-medium first:pl-6'
                    )}
                    style={{width: header.getSize()}}>
                    {(header.isPlaceholder || loading) ? null : (
                      <div className="h-12 grid justify-items-start content-center">
                        {!header.column.getCanFilter() ? (
                          <div className="ml-2"> 
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        ) : (
                          <ColumnFilter column={header.column} table={table} />
                        )}
                      </div>
                    )}
                  </th>
                )
              })}
              </tr>
            ))}
          </thead>
          <tbody className="relative z-0 min-h-32 font-mono">
            {loading ? (
              <tr>
                <td></td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={classNames(
                    rowDetails
                    ? 'hover:cursor-pointer'
                    : ''
                    , 'h-14 w-full border-y-4 border-purple hover:bg-sky-100 dark:hover:bg-sky-950 transition-colors ease-in-out duration-200',
                  )}
                  onClick={() => {if (rowDetails) {
                    setSelectedRow(row.original);
                    setRowSelected(true); 
                  }}}>
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={classNames(
                        cell.column.id === 'destClient'
                        ? 'pl-2'
                        : 'pl-7'
                        , 'last:pr-6'
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
          open={rowSelected}
          onClose={() => setRowSelected(false)}
          content={rowDetails(selectedRow as TableType)}
        />
      }

      { /* Pagination */ }
      <div className="flex flex-row justify-center items-center mt-4">
        <button
          className="p-2 disabled:opacity-60 enabled:hover:bg-white enabled:dark:hover:bg-purple transition-colors ease-in-out duration-200"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}>
          <FiChevronsLeft className="w-6 h-6"/>
        </button>
        <button
          className="p-2 disabled:opacity-60 enabled:hover:bg-white enabled:dark:hover:bg-purple transition-colors ease-in-out duration-200"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          <FiChevronLeft className="w-5 h-5"/>
        </button>

        <span className="mx-4 mb-[2px] font-medium">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>

        <button
          className="p-2 disabled:opacity-60 enabled:hover:bg-white enabled:dark:hover:bg-purple transition-colors ease-in-out duration-200"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          <FiChevronRight className="w-5 h-5"/>
        </button>
        <button
          className="p-2 disabled:opacity-60 enabled:hover:bg-white enabled:dark:hover:bg-purple transition-colors ease-in-out duration-200"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}>
          <FiChevronsRight className="w-6 h-6"/>
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
  
  if (column.id === 'sourceClient' || column.id === 'destClient' || column.id === 'chain') {
    return (
      <Select 
        options={
          [{ value: '', label: column.columnDef.header as string }, 
          ...Object.entries(CHAIN_CONFIGS).map(([key, value]) => ({ value: key, label: value.display }))]
        }
        onChange={value => column.setFilterValue(value)}
        containerClassName="w-28"
        buttonClassName="inpt h-8 pl-[9px] cursor-default"
        dropdownClassName="bg-vapor dark:bg-black"
      />
    );
  } else if (typeof firstValue === 'string') {
    return (
      <input
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={e => column.setFilterValue(e.target.value)}
        placeholder={column.columnDef.header as string}
        className={classLogic(() => {
          let classes = 'inpt h-8 px-[9px] w-fit placeholder:text-white font-mono placeholder:font-primary';
          switch (column.id.toLowerCase()) {
            case 'counterparty_connectionid':
              break;
            case 'state':
              classes += ' max-w-[9rem]';
              break;
            case 'delayperiod':
              classes += ' max-w-32';
              break;
            case 'channelid':
              classes += ' max-w-36';
              break;
            case 'portid':
              classes += ' max-w-48';
              break;
            case 'counterparty_channelid':
              classes += ' max-w-32';
              break;
            default:
              classes += ' max-w-44';
          }
          return classes;
        })}
        aria-label={'Filter by ' + column.columnDef.header as string}
      />
    );
  } else {
    return null;
  }
}
