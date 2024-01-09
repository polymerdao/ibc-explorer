import React, { useEffect } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Selection,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@nextui-org/react";
import _get from "lodash/get";
import { SearchIcon } from "./icons/SearchIcon";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { Text, Title } from "@tremor/react";
import _ from 'lodash';
import { ChannelSchema, ClientSchema, ConnectionSchema } from "./schemas";
import { PacketData } from "./api/ibc/[type]/packets";


interface IbcProps {
  initialVisibleColumns: Set<string>;
  columns: { name: string; uid: string; sortable?: boolean }[];
  statusProperty?: string;
  statusOptions: { name: string; uid: string }[];
  defaultSortDescriptor: SortDescriptor;
  ibcEntityName: string; // The name of the IBC entity (channel, connection, client)
  keyProperty: string; // The property to use as the key for the table rows
  queryParams?: URLSearchParams;
}

export function IbcComponent<T extends ChannelSchema | ConnectionSchema | ClientSchema | PacketData>(props: IbcProps) {
  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(props.initialVisibleColumns);
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>(props.defaultSortDescriptor);
  const [ibcItems, setIbcItems] = React.useState<T[]>([]);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    fetch(`/api/ibc/${props.ibcEntityName}s?${props.queryParams?.toString() || ""}`)
      .then(res => res.json()).then(data => {
      setIbcItems(data);
      setIsLoading(false);
    })
  }, [props])

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return props.columns;

    return props.columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredChannels = [...ibcItems];

    if (hasSearchFilter) {
      filteredChannels = filteredChannels.filter((channel) => {
          return props.columns.some((c) => {
            let cellValue = _get(channel, c.uid as keyof T) as any
            if (typeof cellValue === "string") {
              return cellValue.toLowerCase().includes(filterValue.toLowerCase())
            }
            return false;
          })
        }
      )
    }

    if (statusFilter !== "all" && Array.from(statusFilter).length !== props.statusOptions.length && props.statusProperty != null) {
      filteredChannels = filteredChannels.filter((channel) =>
        Array.from(statusFilter).includes(_.get(channel, props.statusProperty!)),
      );
    }

    return filteredChannels;
  }, [ibcItems, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: T, b: T) => {
      const first = a[sortDescriptor.column as keyof T] as string;
      const second = b[sortDescriptor.column as keyof T] as string;
      let cmp = first.localeCompare(second);

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((channel: T, columnKey: React.Key) => {
    const cellValue = _get(channel, columnKey as keyof T) as string | string[];
    switch (columnKey) {
      case "connection_hops":
        return (cellValue as string[]).join("\n");
      case "createTime":
        return new Date(Number(cellValue) * 1000).toLocaleString();
      case "endTime":
        return new Date(Number(cellValue) * 1000).toLocaleString();
      default:
        return cellValue;
    }
  }, []);


  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("")
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search across all fields..."
            startContent={<SearchIcon/>}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            {(props.statusProperty != null) ? (
              <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                  <Button endContent={<ChevronDownIcon className="text-small"/>} variant="flat">
                    {_.capitalize(props.statusProperty)}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {props.statusOptions.map((status) => (
                    <DropdownItem key={status.uid} className="capitalize">
                      {status.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            ) : (<></>)}
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small"/>} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {props.columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {ibcItems.length} {props.ibcEntityName}s</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="25">25</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    ibcItems.length,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [items.length, page, pages, hasSearchFilter]);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>{_.capitalize(props.ibcEntityName) + "s"}</Title>
      <Text>A list of virtual {props.ibcEntityName}s</Text>

      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isStriped
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[600px]",
          td: "py-0"
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={`No ${props.ibcEntityName}s found`}
          items={sortedItems}
          loadingContent={<Spinner/>}
          isLoading={isLoading}
        >
          {(item) => (
            <TableRow key={_.get(item, props.keyProperty)}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </main>

  );
}