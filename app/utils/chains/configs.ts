import { Chain } from 'utils/types/chain';
import { OptimismIcon, BaseIcon, ModeIcon, BobIcon } from './icons';

export type CHAIN = 'optimism' | 'base' | 'mode' | 'bob';

let opDispatcher = process.env.DISPATCHER_ADDRESS_OPTIMISM!;
let baseDispatcher = process.env.DISPATCHER_ADDRESS_BASE!;
let modeDispatcher = process.env.DISPATCHER_ADDRESS_MODE!;
let bobDispatcher = process.env.DISPATCHER_ADDRESS_BOB!;

let opClientName = process.env.OPTIMISM_CLIENT_NAME!;
let baseClientName = process.env.BASE_CLIENT_NAME!;
let modeClientName = process.env.MODE_CLIENT_NAME!;
let bobClientName = process.env.BOB_CLIENT_NAME!;

let optimismRPC = process.env.OPTIMISM_RPC!;
let baseRPC = process.env.BASE_RPC!;
let modeRPC = process.env.MODE_RPC!;
let bobRPC = process.env.BOB_RPC!;

export const CHAIN_CONFIGS: {
  [key in CHAIN]: Chain;
} = {
  optimism: {
    display: 'Optimism',
    rpc: optimismRPC,
    dispatchers: [opDispatcher],
    clients: [opClientName],
    blockTime: 2,
    icon: OptimismIcon,
  },
  base: {
    display: 'Base',
    rpc: baseRPC,
    dispatchers: [baseDispatcher],
    clients: [baseClientName],
    blockTime: 2,
    icon: BaseIcon,
  },
  mode: {
    display: 'Mode',
    rpc: modeRPC,
    dispatchers: [modeDispatcher],
    clients: [modeClientName],
    blockTime: 2,
    icon: ModeIcon,
  },
  bob: {
    display: 'Bob',
    rpc: bobRPC,
    dispatchers: [bobDispatcher],
    clients: [bobClientName],
    blockTime: 2,
    icon: BobIcon,
  },
};

export function clientToDisplay(client: string) {
  for (const key in CHAIN_CONFIGS) {
    if (client.toLowerCase().includes(key.toLowerCase())) {
      return CHAIN_CONFIGS[key as CHAIN].display;
    }
  }
}
