import React, { useEffect, useState } from "react";
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
import { PacketData } from "./api/ibc/[type]/packets";
import { Tooltip } from "@nextui-org/tooltip";
import { format } from "date-fns";
import Link from "next/link";
import { IdentifiedConnection } from "cosmjs-types/ibc/core/connection/v1/connection";
import { IdentifiedChannel } from "cosmjs-types/ibc/core/channel/v1/channel";
import { IdentifiedClientState } from "cosmjs-types/ibc/core/client/v1/client";


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

export function IbcComponent<T extends IdentifiedChannel | IdentifiedConnection | IdentifiedClientState | PacketData>(props: IbcProps) {
  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(props.initialVisibleColumns);
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>(props.defaultSortDescriptor);
  const [ibcItems, setIbcItems] = React.useState<T[]>([]);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = useState('');


  function loadData() {
    setIsLoading(true)
    fetch(`/api/ibc/${props.ibcEntityName}s?${props.queryParams?.toString() || ""}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setIbcItems(data);
        setIsLoading(false);
      }).catch(err => {
      console.log(err);
      setErrorMessage('Error loading data');
      setIsLoading(false);
    })
  }

  useEffect(() => {
    // Your effect code
}, [props.ibcEntityName, props.queryParams]); // Add props.ibcEntityName and props.queryParams to the dependency array


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

  const sortedItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return [...filteredItems].sort((a: T, b: T) => {
      const first = a[sortDescriptor.column as keyof T];
      const second = b[sortDescriptor.column as keyof T];

      let cmp

      if (typeof first === "string" && typeof second === "string" && !["createTime", "sequence"].includes(sortDescriptor.column as string)) {
        cmp = first.localeCompare(second);
      } else {
        console.log(sortDescriptor.column, first, second)
        cmp = Number(first) - Number(second);
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    }).slice(start, end);
  }, [sortDescriptor, page, filteredItems, rowsPerPage]);

  const renderCell = React.useCallback((channel: T, columnKey: React.Key) => {
    const cellValue = _get(channel, columnKey as keyof T) as string | string[];
    switch (columnKey) {
      case "connectionHops":
        return (cellValue as string[]).join("\n");
      case "createTime":
        return format(new Date(Number(cellValue) * 1000), "yyyy-MM-dd HH:mm:ss");
      case "endTime":
        if (cellValue) {
          return format(new Date(Number(cellValue) * 1000), "yyyy-MM-dd HH:mm:ss");
        }
        return "--";
      case "sourcePortAddress":
        return (
          <Tooltip showArrow={true} content={cellValue}>
            <span>
              {cellValue.slice(0, 6) + "..." + cellValue.slice(-6)}
            </span>
          </Tooltip>
        )
      case "sendTx":
      case "ackTx":
        const sourceChain = _get(channel, "sourceChain") as string
        if (!cellValue) return "--"
        return (
          <Link
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://${sourceChain}-sepolia.blockscout.com/tx/${cellValue}`}
          >
            {cellValue.slice(0, 6) + "..." + cellValue.slice(-6)}
          </Link>
        )
      case "rcvTx":
        const destChain = _get(channel, "destChain") as string
        if (!cellValue) return "--"
        return (
          <Link
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://${destChain}-sepolia.blockscout.com/tx/${cellValue}`}
          >
            {cellValue.slice(0, 6) + "..." + cellValue.slice(-6)}
          </Link>
        )
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
            <div>
              <Button
                variant="flat"
                color="primary"
                onClick={() => {
                  loadData()
                }}
              > Reload
              </Button>
            </div>
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
  }, [filteredItems.length, page, pages, hasSearchFilter]);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
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
