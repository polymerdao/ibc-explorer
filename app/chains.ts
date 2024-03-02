import { ethers } from 'ethers';
import { Chain } from './types/chain';
import { OptimismIcon, BaseIcon } from './icons/Chains';

export type CHAIN = 'optimism' | 'base';
let opDispatcher = process.env.DISPATCHER_ADDRESS_OPTIMISM!;
let baseDispatcher = process.env.DISPATCHER_ADDRESS_BASE!;
let opSimDispatcher = process.env.DISPATCHER_ADDRESS_OPTIMISM_SIMCLIENT!;
let baseSimDispatcher = process.env.DISPATCHER_ADDRESS_BASE_SIMCLIENT!;

export const CHAIN_CONFIGS: {
  [key in CHAIN]: Chain;
} = {
  optimism: {
    id: 11155420,
    display: 'Optimism',
    rpc: 'https://opt-sepolia.g.alchemy.com/v2/jKvLhhXvtnWdNeZrKst0demxnwJcYH1o',
    dispatcher: opDispatcher,
    simDispatcher: opSimDispatcher,
    blockTime: 2,
    icon: OptimismIcon
  },
  base: {
    id: 84532,
    display: 'Base',
    rpc: 'https://base-sepolia.g.alchemy.com/v2/776dC6qT-NTtupdnxlUJuXGbUIKWWhLe',
    dispatcher: baseDispatcher,
    simDispatcher: baseSimDispatcher,
    blockTime: 2,
    icon: BaseIcon
  }
};

export async function getLatestBlock(chainId: CHAIN) {
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS[chainId].rpc);
  return await provider.getBlock('latest');
}
