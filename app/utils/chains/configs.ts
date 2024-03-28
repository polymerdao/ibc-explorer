import { Chain } from 'utils/types/chain';
import { OptimismIcon, BaseIcon, MoltenIcon } from './icons';

export type CHAIN = 'optimism' | 'base' | 'molten';

let opDispatcher = process.env.DISPATCHER_ADDRESS_OPTIMISM!;
let opDispatcherSimClient = process.env.DISPATCHER_ADDRESS_OPTIMISM_SIMCLIENT!;
let baseDispatcher = process.env.DISPATCHER_ADDRESS_BASE!;
let baseDispatcherSimClient = process.env.DISPATCHER_ADDRESS_BASE_SIMCLIENT!;
let moltenDispatcher = process.env.DISPATCHER_ADDRESS_MOLTEN!;
let moltenDispatcherSimClient = process.env.DISPATCHER_ADDRESS_MOLTEN_SIMCLIENT!;

let opClientName = process.env.OPTIMISM_CLIENT_NAME!;
let baseClientName = process.env.BASE_CLIENT_NAME!;
let moltenClientName = process.env.MOLTEN_CLIENT_NAME!;
let opClientSimClientName = process.env.OPTIMISM_CLIENT_SIMCLIENT_NAME!;
let baseClientSimClientName = process.env.BASE_CLIENT_SIMCLIENT_NAME!;
let moltenClientSimClientName = process.env.MOLTEN_CLIENT_SIMCLIENT_NAME!;

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
    dispatchers: [opDispatcher, opDispatcherSimClient],
    clients: [opClientName, opClientSimClientName],
    blockTime: 2,
    icon: OptimismIcon,
  },
  base: {
    id: 84532,
    display: 'Base',
    rpc: baseRPC,
    dispatchers: [baseDispatcher, baseDispatcherSimClient],
    clients: [baseClientName, baseClientSimClientName],
    blockTime: 2,
    icon: BaseIcon,
  },
  molten: {
    id: 49483,
    display: 'Molten',
    rpc: moltenRPC,
    dispatchers: [moltenDispatcher, moltenDispatcherSimClient],
    clients: [moltenClientName, moltenClientSimClientName],
    blockTime: 2,
    icon: MoltenIcon,
  },
};
