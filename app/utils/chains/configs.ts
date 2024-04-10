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
let opSimClientName = process.env.OPTIMISM_CLIENT_SIMCLIENT_NAME!;
let baseClientName = process.env.BASE_CLIENT_NAME!;
let baseSimClientName = process.env.BASE_CLIENT_SIMCLIENT_NAME!;
let moltenClientName = process.env.MOLTEN_CLIENT_NAME!;
let moltenSimClientName = process.env.MOLTEN_CLIENT_SIMCLIENT_NAME!;

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
    txUrl: "https://optimism-sepolia.blockscout.com/",
    dispatchers: [opDispatcher, opDispatcherSimClient],
    clients: [opClientName, opSimClientName],
    blockTime: 2,
    icon: OptimismIcon,
  },
  base: {
    id: 84532,
    display: 'Base',
    rpc: baseRPC,
    txUrl: "https://base-sepolia.blockscout.com/",
    dispatchers: [baseDispatcher, baseDispatcherSimClient],
    clients: [baseClientName, baseSimClientName],
    blockTime: 2,
    icon: BaseIcon,
  },
  molten: {
    id: 49483,
    display: 'Molten',
    rpc: moltenRPC,
    txUrl: "https://unidex-sepolia.explorer.caldera.xyz/",
    dispatchers: [moltenDispatcher, moltenDispatcherSimClient],
    clients: [moltenClientName, moltenSimClientName],
    blockTime: 2,
    icon: MoltenIcon,
  },
};
