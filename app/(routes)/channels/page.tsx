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
import {
  Table,
  Modal,
  StateCell,
  ChainCell,
  Arrow,
  formatPortId,
  formatConnectionHops,
  FilterButton,
  Select,
  shortenHex
} from 'components';
import { ChannelDetails } from './channel-details';
import { IdentifiedChannel, stateToString } from 'utils/types/channel';
import { classNames } from 'utils/functions';
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
        <div className="ml-2.5"><ChainCell chain={props.getValue()} /></div>
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
        <div className="ml-3"><ChainCell chain={props.getValue()} /></div>
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
  }),
  columnHelper.accessor('createTime', {
    header: 'Create Time',
    enableHiding: true,
    cell: props => new Date((props.getValue() || 0) * 1000).toLocaleString(),
    enableColumnFilter: false
  }),
  columnHelper.accessor('transactionHash', {
    header: 'Transaction Hash',
    cell: props => shortenHex(props.getValue()),
    enableHiding: true,
    enableSorting: true
  })
];

const PAGE_SIZE = 20;

export default function Channels() {
  const [header, setHeader] = useState<string>('');
  const [channels, setChannels] = useState<IdentifiedChannel[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [channelSearch, setChannelSearch] = useState(false);
  const [foundChannel, setFoundChannel] = useState<IdentifiedChannel | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showInProgressChannels, setShowInProgressChannels] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    'connectionHops': false,
    'counterparty_portId': false,
    'createTime': false,
    'transactionHash': false
  });
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'channelId',
    desc: true
  }]);

  useEffect(() => {
    loadData();
    updateHeader('Universal Channels');
    // Check if url contains a channelId to load by default
    const searchParams = new URLSearchParams(window.location.search);
    const channelId = searchParams.get('channelId');
    if (channelId) {
      searchChannels(channelId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  function updateHeader(newHeader: string) {
    shuffle({
      text: newHeader,
      fps: 20,
      delayResolve: 0,
      direction: 'right',
      animation: 'show',
      delay: 0.3,
      duration: 1,
      onUpdate: (output: string) => {setHeader(output);}
    });
  }

  function updateChannelType(channelType: string) {
    loadData(channelType === 'in-progress');
    if (channelType === 'universal') {
      setShowInProgressChannels(false);
      updateHeader('Universal Channels');
    } else if (channelType === 'in-progress') {
      updateHeader('In-Progress Channels');
      setShowInProgressChannels(true);
    }
  }

  function loadData(inProgress = false) {
    setLoading(true);
    const offset = (pageNumber - 1) * PAGE_SIZE;

    fetch(`/api/channels${inProgress ? `?inProgress=true&offset=${offset}&limit=${PAGE_SIZE}` : ''}`)
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
          window.history.replaceState(null, '', '/channels');
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
            data-testid="search-input"
            placeholder="Search Custom Channels by ID"
            className="inpt w-full px-3 font-mono placeholder:font-primary"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            onKeyUp={e => { if (e.key === 'Enter') searchChannels(searchId) }}
          />
          <button
            className="btn ml-3"
            data-testid="search-button"
            disabled={searchLoading || searchId.length === 0}
            onClick={() => searchChannels(searchId)}>
            Search
          </button>
          <FilterButton open={showFilters} setOpen={setShowFilters} />
        </div>
        <button onClick={() => loadData()} className="btn">
          Reload
        </button>
      </div>

      <div 
        className={classNames(
          showFilters
          ? 'h-14 duration-100'
          : 'h-0 duration-100 delay-100'
          , 'w-full transition-all ease-in-out'
        )}>
        <div
          className={classNames(
            showFilters
            ? 'opacity-100 duration-100 delay-100'
            : 'opacity-0 duration-100'
            , 'relative flex flex-row space-x-4 items-center w-full mx-auto pt-4 transition-all ease-in-out'
          )}>

          <Select 
            options={
              [
                {value: 'universal', label: 'Universal', dataTestId: 'universal'},
                {value: 'in-progress', label: 'In-Progress', dataTestId: 'in-progress'}
              ]
            }
            onChange={value => updateChannelType(value as string)}
            dataTestId="channel-type"
            containerClassName="w-36"
            buttonClassName="inpt pl-4 cursor-default"
            dropdownClassName="bg-vapor dark:bg-black"
          />
        </div>
      </div>

      {showInProgressChannels ? (
        // Only do server-side pagination when fetching in-progress channels
        <Table {...{
          table, loading, rowDetails: ChannelDetails, pageLimit: PAGE_SIZE, pageNumber, setPageNumber
        }} />
      ) : (
        <Table {...{
          table, loading, rowDetails: ChannelDetails, pageLimit: PAGE_SIZE
        }} />
      )}
    </div>
  );
}
