'use client';

import { useEffect, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table';
import { Table } from 'components/table';
import { IdentifiedChannel, stateToString } from 'utils/types/channel';
import { ChannelDetails } from './channel-details';
import { Modal } from 'components/modal';
import { StateCell } from 'components/state-cell';
import { ChainCell, Arrow } from 'components/chain-cell';
import { formatPortId, formatConnectionHops } from 'components/format-strings';
const { shuffle } = require('txt-shuffle');

const columnHelper = createColumnHelper<IdentifiedChannel>();
const columns = [
  columnHelper.accessor('channelId', {
    header: 'Channel ID',
    enableHiding: true,
    enableSorting: true,
    sortingFn: 'alphanumeric'
  }),
  columnHelper.accessor(row => stateToString(row.state), {
    header: 'State',
    cell: props => StateCell(props.getValue()),
    enableHiding: true,
    enableColumnFilter: true
  }),
  columnHelper.accessor(row => row.portId, {
    header: 'Source',
    id: 'sourceClient',
    cell: props => (
      <div className="flex flex-row justify-between">
        <div className="ml-4"><ChainCell chain={props.getValue()} /></div>
        <Arrow />
      </div>
    ),
    enableColumnFilter: true,
    enableHiding: true
  }),
  columnHelper.accessor(row => row.counterparty.portId, {
    header: 'Dest',
    id: 'destClient',
    cell: props => (
      <div className="flex flex-row justify-between">
        <div className="ml-5"><ChainCell chain={props.getValue()} /></div>
      </div>
    ),
    enableColumnFilter: true,
    enableHiding: true
  }),
  columnHelper.accessor('portId', {
    header: 'Port ID',
    cell: props => formatPortId(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor('counterparty.channelId', {
    header: 'Counterparty',
    enableHiding: true
  }),
  columnHelper.accessor('counterparty.portId', {
    header: 'Counterparty Port',
    cell: props => formatPortId(props.getValue()),
    enableHiding: true
  }),
  columnHelper.accessor(row => formatConnectionHops(row.connectionHops), {
    header: 'Connection Hops',
    id: 'connectionHops',
    enableHiding: true
  })
];

const PAGE_SIZE = 20;

export default function Channels() {
  const [header, setHeader] = useState<string>('');
  const [channels, setChannels] = useState<IdentifiedChannel[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [channelSearch, setChannelSearch] = useState(false);
  const [foundChannel, setFoundChannel] = useState<IdentifiedChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    'connectionHops': false,
    'counterparty_portId': false,
  });
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'channelId',
    desc: true
  }]);

  useEffect(() => {
    loadData();
    shuffle({
      text: 'Universal Channels',
      fps: 20,
      delayResolve: 0,
      direction: 'right',
      animation: 'show',
      delay: 0.3,
      duration: 1,
      onUpdate: (output: string) => {setHeader(output);}
    });
    // Check if url contains a channelId to load by default
    const urlParams = new URLSearchParams(window.location.search);
    const channelId = urlParams.get('channelId');
    if (channelId) {
      searchChannels(channelId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadData() {
    setLoading(true);
    fetch('/api/channels')
      .then(res => {
        if (!res.ok) {
          console.error(res.status);
          setError(true);
          setLoading(false);
        }
        return res.json();
      })
      .then(data => {
        setChannels(data);
        setLoading(false);
      }).catch(err => {
        setError(true);
        setLoading(false);
      });
  }

  const controller = new AbortController();
  function searchChannels(channelId: string) {
    setSearchLoading(true);
    setFoundChannel(null);
    setChannelSearch(true);
    fetch(`/api/channels?channelId=${channelId}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) {
          setErrorMessage(res.statusText);
          setError(true);
          setChannelSearch(false);
          setSearchLoading(false);
        }
        return res.json();
      })
      .then(data => {
        if (data.length > 0) {
          setFoundChannel(data[0]);
        } else {
          setFoundChannel(null);
        }
        setSearchLoading(false);
      }).catch(() => {
        setError(true);
        setChannelSearch(false);
        setSearchLoading(false);
      });
  }

  const table = useReactTable({
    data: channels,
    state: {
      columnVisibility,
      sorting
    },
    columns,
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div>
      <Modal 
        open={error}
        onClose={() => {
          setError(false);
          setErrorMessage('');
        }}
        content={<>
          <h2>Error</h2>
          <p className="mt-1 mr-8">
            There was an issue fetching channel data {errorMessage? `: ${errorMessage}` : ''}
          </p>
        </>}
      />

      <Modal 
        open={channelSearch} 
        onClose={() => {
          setChannelSearch(false);
          window.history.pushState(null, '', '/channels');
          if (searchLoading) {
            controller.abort();
            setSearchLoading(false);
          }
        }}
        content={ChannelDetails(foundChannel)}
        loading={searchLoading}
      />

      <h1 className="ml-1 h-8">{header}</h1>
      <div className="flex flex-row justify-between mt-4">
        <div className="flex flex-row justify-left w-2/5 min-w-[248px]">
          <input
            type="text"
            placeholder="Search Custom Channels by ID"
            className="inpt w-full px-3 font-mono placeholder:font-primary"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            onKeyUp={e => { if (e.key === 'Enter') searchChannels(searchId) }}
          />
          <button
            className="btn ml-3"
            disabled={searchLoading || searchId.length === 0}
            onClick={() => searchChannels(searchId)}>
            Search
          </button>
        </div>
        <button onClick={() => loadData()} className="btn">
          Reload
        </button>
      </div>

      <Table {...{table, loading, rowDetails: ChannelDetails, pageLimit: PAGE_SIZE}} />
    </div>
  );
}
