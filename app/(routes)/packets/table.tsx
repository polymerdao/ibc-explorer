import { 
  Table,
  flexRender,
  Column
} from "@tanstack/react-table";
import { CHAIN_CONFIGS } from "utils/chains/configs";
import { Packet } from "utils/types/packet";

export function PacketTable({ table, loading }: { table: Table<Packet>, loading: boolean }) {

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
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="pl-8 first:pl-0">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>)}
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
        className="w-36 border shadow rounded dark:bg-bg-dk">
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
