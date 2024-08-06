import { Chain } from 'utils/types/chain';
import { OptimismIcon, BaseIcon, MoltenIcon } from './icons';

export type CHAIN = 'optimism' | 'base' | 'molten';

let opDispatcher = process.env.DISPATCHER_ADDRESS_OPTIMISM!;
let baseDispatcher = process.env.DISPATCHER_ADDRESS_BASE!;
let moltenDispatcher = process.env.DISPATCHER_ADDRESS_MOLTEN!;

let opClientName = process.env.OPTIMISM_CLIENT_NAME!;
let baseClientName = process.env.BASE_CLIENT_NAME!;
let moltenClientName = process.env.MOLTEN_CLIENT_NAME!;

let optimismRPC = process.env.OPTIMISM_RPC || 'https://opt-sepolia.g.alchemy.com/v2/jKvLhhXvtnWdNeZrKst0demxnwJcYH1o';
let baseRPC = process.env.BASE_RPC || 'https://base-sepolia.g.alchemy.com/v2/776dC6qT-NTtupdnxlUJuXGbUIKWWhLe';
let moltenRPC = process.env.MOLTEN_RPC || 'https://unidex-sepolia.rpc.caldera.xyz/http';

export const CHAIN_CONFIGS: {
  [key in CHAIN]: Chain;
} = {
  optimism: {
    id: 11155420,
    display: 'Optimism',
    rpc: optimismRPC,
    txUrl: 'https://optimism-sepolia.blockscout.com/',
    dispatchers: [opDispatcher],
    clients: [opClientName],
    blockTime: 2,
    icon: OptimismIcon,
  },
  base: {
    id: 84532,
    display: 'Base',
    rpc: baseRPC,
    txUrl: 'https://base-sepolia.blockscout.com/',
    dispatchers: [baseDispatcher],
    clients: [baseClientName],
    blockTime: 2,
    icon: BaseIcon,
  },
  molten: {
    id: 49483,
    display: 'Molten',
    rpc: moltenRPC,
    txUrl: 'https://unidex-sepolia.explorer.caldera.xyz/',
    dispatchers: [moltenDispatcher],
    clients: [moltenClientName],
    blockTime: 2,
    icon: MoltenIcon,
  },
};

export function clientToDisplay(client: string) {
  for (const key in CHAIN_CONFIGS) {
    if (client.toLowerCase().includes(key.toLowerCase())) {
      return CHAIN_CONFIGS[key as CHAIN].display;
    }
  }
}
