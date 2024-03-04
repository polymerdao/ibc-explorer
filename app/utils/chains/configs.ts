import { Chain } from "utils/types/chain";
import { OptimismIcon, BaseIcon } from "./icons";

export type CHAIN = 'optimism' | 'base';

let opDispatcher = process.env.DISPATCHER_ADDRESS_OPTIMISM!;
let baseDispatcher = process.env.DISPATCHER_ADDRESS_BASE!;
let opDispatcherSimClient = process.env.DISPATCHER_ADDRESS_OPTIMISM_SIMCLIENT!;
let baseDispatcherSimClient = process.env.DISPATCHER_ADDRESS_BASE_SIMCLIENT!;

export const CHAIN_CONFIGS: {
  [key in CHAIN]: Chain;
} = {
  optimism: {
    id: 11155420,
    display: "Optimism",
    rpc: "https://opt-sepolia.g.alchemy.com/v2/jKvLhhXvtnWdNeZrKst0demxnwJcYH1o",
    dispatchers: [opDispatcher, opDispatcherSimClient],
    blockTime: 2,
    icon: OptimismIcon,
  },
  base: {
    id: 84532,
    display: "Base",
    rpc: "https://base-sepolia.g.alchemy.com/v2/776dC6qT-NTtupdnxlUJuXGbUIKWWhLe",
    dispatchers: [baseDispatcher, baseDispatcherSimClient],
    blockTime: 2,
    icon: BaseIcon,
  }
};
