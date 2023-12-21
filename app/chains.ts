import { ethers } from "ethers";


export type CHAIN = 'optimism' | 'base';

export const CHAIN_CONFIGS: {
  [key in CHAIN]: { id: number; rpc: string, dispatcher: string, blockTime: number };
} = {
  optimism: {
    id: 11155420,
    rpc: "https://opt-sepolia.g.alchemy.com/v2/RN7slh_2cUIuzhxo4M9VgYCbqRcPOmkJ",
    dispatcher: "0xD92B86315CBcf9cC612F0b0542E0bE5871bCa146",
    blockTime: 2,
  },
  base: {
    id: 84532,
    rpc: "https://base-sepolia.g.alchemy.com/v2/zGVxj0T-xvSR29_t7MlIhqRskkSwugVM",
    dispatcher: "0xab6AEF0311954C40AcD4D1DED56CAAE9cc074975",
    blockTime: 2,
  }
};


export async function getLatestBlock(chainId: CHAIN) {
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS[chainId].rpc);
  return await provider.getBlock("latest");
}
