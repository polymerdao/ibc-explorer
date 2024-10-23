import { Chain } from 'utils/types/chain';
import { OptimismIcon, BaseIcon } from './icons';

export type CHAIN = 'optimism' | 'base';

let opDispatcher = process.env.DISPATCHER_ADDRESS_OPTIMISM!;
let baseDispatcher = process.env.DISPATCHER_ADDRESS_BASE!;

let opClientName = process.env.OPTIMISM_CLIENT_NAME!;
let baseClientName = process.env.BASE_CLIENT_NAME!;

let optimismRPC = process.env.OPTIMISM_RPC!;
let baseRPC = process.env.BASE_RPC!;

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
  }
};

export function clientToDisplay(client: string) {
  for (const key in CHAIN_CONFIGS) {
    if (client.toLowerCase().includes(key.toLowerCase())) {
      return CHAIN_CONFIGS[key as CHAIN].display;
    }
  }
}
