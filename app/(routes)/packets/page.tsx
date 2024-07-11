'use client';

import { useEffect, useState, Fragment } from 'react';
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
import { CHAIN_CONFIGS } from 'utils/chains/configs';
import { Select } from 'components/select';
import { StateCell } from 'components/state-cell';
import { ChainCell, Arrow } from 'components/chain-cell';
import { shortenHex } from 'components/format-strings';
import { classNames } from 'utils/functions';
import { FiChevronDown } from 'react-icons/fi';
import { Transition, Popover } from '@headlessui/react';

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

interface state {
  value: string;
  label: string;
  selected: boolean;
}

export default function Packets() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [srcFilter, setSrcFilter] = useState<string>('');
  const [destFilter, setDestFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<Array<state>>([
    { value: 'SENT', label: 'Relaying', selected: false },
    { value: 'RECV,WRITE_ACK', label: 'Confirming', selected: false },
    { value: 'ACK', label: 'Delivered', selected: false }
  ]);
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
    let states = '';
    for (const state of stateFilter) {
      if (state.selected) {
        states += state.value + ',';
      }
    }
    fetch(
      `/api/packets?searchValue=${searchValue}&src=${srcFilter}&dest=${destFilter}&states=${states}`,
      { signal: controller.signal }
    )
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
          <button
            className="ml-3.5 pt-0.5 pb-1.5 px-2 grid justify-items-center items-center"
            onClick={() => setShowFilters(!showFilters)}>
            <div className={classNames(
              showFilters
              ? 'translate-y-5'
              : '',
              'relative h-0.5 w-7 mt-1 bg-primary-500 transition-transform duration-200 ease-in-out'
            )}>
            </div>
            <div
              className='h-0.5 w-4 bg-primary-500'>
            </div>
            <div className={classNames(
              showFilters
              ? '-translate-y-5'
              : '',
              'relative h-0.5 w-1.5 bg-primary-500 transition-transform duration-200 ease-in-out'
            )}>
            </div>
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

      <div 
        className={classNames(
          showFilters
          ? 'h-8'
          : 'h-0'
          , 'w-full mt-4 transition-all ease-in-out duration-200'
        )}>
        <div
          className={classNames(
            showFilters
            ? 'opacity-100'
            : 'opacity-0'
            , 'relative flex flex-row space-x-2 items-center w-full mx-auto transition-all ease-in-out delay-100 duration-100'
          )}>
          <Popover>
            {({ open }) => (<>
              <Popover.Button className="inpt w-28 flex flex-row justify-between items-center h-8 pl-[9px] pr-[0.4rem] text-fg-light dark:text-fg-dark transition east-in-out duration-200 cursor-default">
                State
                <FiChevronDown className={classNames(
                  open
                  ? 'scale-y-[-1]'
                  : ''
                  , 'mt-[1px] transition ease-in-out duration-200'
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
                  <div className="bg-bg-light dark:bg-bg-dark pl-6 pr-9 py-4 border-[0.5px] rounded-md border-slate-500">
                    {stateFilter.map(state => { return (
                      <div key={state.value} className="py-[0.17rem]">
                        <label>
                          <input
                            className="appearance-none border border-slate-500 bg-transparent rounded-lg w-3 h-3 mr-3 transition-colors ease-in-out duration-150
                              checked:bg-emerald-500 checked:border-transparent"
                            {...{
                              type: 'checkbox',
                              checked: state.selected,
                              onChange: () => {state.selected = !state.selected; setStateFilter([...stateFilter])}
                            }}
                          />
                          {state.label}
                        </label>
                      </div>
                      )
                    })}
                  </div>
                </Popover.Panel>
              </Transition>
            </>)}
          </Popover>

          <Select 
            options={
              [{ value: '', label: 'Source' }, 
              ...Object.entries(CHAIN_CONFIGS).map(([key, value]) => ({ value: key, label: value.display }))]
            }
            onChange={value => setSrcFilter(value as string)}
            containerClassName="w-28"
            buttonClassName="inpt h-8 pl-[9px] cursor-default"
            dropdownClassName="bg-bg-light dark:bg-bg-dark"
          />
          <Select 
            options={
              [{ value: '', label: 'Dest' }, 
              ...Object.entries(CHAIN_CONFIGS).map(([key, value]) => ({ value: key, label: value.display }))]
            }
            onChange={value => setDestFilter(value as string)}
            containerClassName="w-28"
            buttonClassName="inpt h-8 pl-[9px] cursor-default"
            dropdownClassName="bg-bg-light dark:bg-bg-dark"
          />
        </div>
      </div>

      <IbcTable {...{table, loading, rowDetails: PacketDetails}} />
    </div>
  );
}
