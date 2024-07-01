'use client';

import { useEffect, useState } from 'react';
import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable }
from '@tanstack/react-table';
import { IbcTable } from 'components/ibc-table';
import { Modal } from 'components/modal';
import { Packet } from 'utils/types/packet';
import { PacketDetails } from './packet-details';
import { stateToString } from 'utils/types/packet';
import { StateCell } from 'components/state-cell';
import { ChainCell, Arrow } from 'components/chain-cell';
import { shortenHex } from 'components/format-strings';

const columnHelper = createColumnHelper<Packet>();
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    enableHiding: true
  }),
  columnHelper.accessor(row => stateToString(row.state), {
    header: 'State',
    cell: props => StateCell(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sendTx', {
    header: 'Send Tx',
    cell: props => shortenHex(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sourceClient', {
    header: 'Source',
    enableHiding: true,
    cell: props => (
      <div className="flex flex-row justify-between">
        <div className="ml-4"><ChainCell chain={props.getValue()} /></div>
        <Arrow />
      </div>
    )
  }),
  columnHelper.accessor('destClient', {
    header: 'Dest',
    cell: props => (
      <div className="flex flex-row justify-between">
        <div className="ml-5"><ChainCell chain={props.getValue()} /></div>
      </div>
    ),
    enableHiding: true,
    maxSize: 100
  }),
  columnHelper.accessor('sourcePortAddress', {
    header: 'Src Port Address',
    cell: props => shortenHex(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('destPortAddress', {
    header: 'Dest Port Address',
    cell: props => shortenHex(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('sourceChannelId', {
    header: 'Src Channel ID',
    enableHiding: true
  }),
  columnHelper.accessor('destChannelId', {
    header: 'Dest Channel ID',
    enableHiding: true
  }),
  columnHelper.accessor(row => (row.endTime ?? 0) - row.createTime, {
    header: 'Round-trip',
    cell: props => {
      if (props.getValue() < 0) {
        return <span>...</span>;
      } else if (props.getValue() < 300) {
        return <span>{Math.round(props.getValue())} s</span>;
      } else {
        return <span>{Math.round(props.getValue() / 60)} m</span>;
      }
    },
    enableColumnFilter: false,
    enableHiding: true,
    size: 175,
    minSize: 175
  }),
  columnHelper.accessor('sequence', {
    header: 'Sequence',
    enableColumnFilter: false,
    enableHiding: true,
    minSize: 120
  }),
  columnHelper.accessor('rcvTx', {
    header: 'Rcv Tx',
    cell: props => shortenHex(props.getValue() ?? ''),
    enableHiding: true,
    enableColumnFilter: false
  }),
  columnHelper.accessor('ackTx', {
    header: 'Ack Tx',
    cell: props => shortenHex(props.getValue() ?? ''),
    enableHiding: true,
    enableColumnFilter: false
  }),
  columnHelper.accessor('createTime', {
    header: 'Create Time',
    enableHiding: true,
    cell: props => new Date(props.getValue()*1000).toLocaleString(),
    enableSorting: true,
    sortingFn: 'alphanumeric',
    enableColumnFilter: false
  })
];

export default function Packets() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [packetSearch, setPacketSearch] = useState(false);
  const [foundPacket, setFoundPacket] = useState<Packet | null>(null);
  const [resType, setResType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    'sequence': false,
    'destPortAddress': false,
    'destChannelId': false,
    'Round-trip': false,
    'fee': false,
    'id': false,
    'rcvTx': false,
    'ackTx': false,
    'createTime': false
  });
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'createTime',
    desc: true
  }]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    fetch('/api/packets')
      .then(res => {
        if (!res.ok) {
          setErrorMessage(res.statusText);
          setError(true);
          setLoading(false);
        }
        return res.json();
      })
      .then(data => {
        setPackets(data.packets);
        setResType(data.type);
        setLoading(false);
      }).catch(() => {
        setError(true);
        setLoading(false);
      });
  }

  const controller = new AbortController();
  function searchPackets() {
    setSearchLoading(true);
    setFoundPacket(null);
    setPacketSearch(true);
    fetch(`/api/packets?searchValue=${searchValue}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) {
          setErrorMessage(res.statusText);
          setError(true);
          setPacketSearch(false);
          setSearchLoading(false);
        }
        return res.json();
      })
      .then(data => {
        setResType(data.type);
        if (data.packets.length === 1) {
          setFoundPacket(data.packets[0]);
        } else if (data.packets.length > 1) {
          setPacketSearch(false);
          setPackets(data.packets);
        }
        else {
          setFoundPacket(null);
        }
        setSearchLoading(false);
      }).catch(() => {
        setError(true);
        setPacketSearch(false);
        setSearchLoading(false);
      });
  }

  const table = useReactTable({
    data: packets,
    columns,
    state: {
      columnVisibility,
      sorting
    },
    defaultColumn: {
      minSize: 150
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="h-0">
      <Modal 
        open={error}
        onClose={() => {
          setError(false);
          setErrorMessage('');
        }}
        content={<>
          <h2>Error</h2>
          <p className="mt-1 mr-8">
            There was an issue fetching packet data {errorMessage? `: ${errorMessage}` : ''}
          </p>
        </>}
      />

      <Modal 
        open={packetSearch} 
        onClose={() => {
          setPacketSearch(false);
          if (searchLoading) {
            controller.abort();
            setSearchLoading(false);
          }
        }}
        content={PacketDetails(foundPacket)}
        loading={searchLoading}
      />

      <h1 className="ml-1">Recent Packets</h1>
      <div className="flex flex-row justify-between mt-4">
        <div className="flex flex-row justify-left w-2/5 min-w-[248px]">
          <input
            type="text"
            placeholder="Tx Hash, Sender Address or Packet ID"
            className="inpt border-[1px] w-full px-3 rounded-md font-mono placeholder:font-primary"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyUp={e => { if (e.key === 'Enter') searchPackets() }}
          />
          <button
            className="btn ml-3"
            disabled={searchLoading || searchValue.length === 0}
            onClick={() => searchPackets()}>
            Search
          </button>
        </div>
        <button 
          onClick={() => {
            if (resType === 'sender') { searchPackets() }
            else { loadData() }
          }}
          className="btn btn-accent">
          Reload
        </button>
      </div>

      <IbcTable {...{table, loading, rowDetails: PacketDetails}} />
    </div>
  );
}
