import { ethers } from "ethers";

export type CHAIN = 'optimism' | 'base';

export const CHAIN_CONFIGS: {
  [key in CHAIN]: { id: number; rpc: string, dispatcher: string };
} = {
  optimism: {
    id: 11155420,
    rpc: "https://opt-sepolia.g.alchemy.com/v2/RN7slh_2cUIuzhxo4M9VgYCbqRcPOmkJ",
    dispatcher: "0x7a1d713f80BFE692D7b4Baa4081204C49735441E"
  },
  base: {
    id: 84532,
    rpc: "https://base-sepolia.g.alchemy.com/v2/zGVxj0T-xvSR29_t7MlIhqRskkSwugVM",
    dispatcher: "0x749053bBFe3f607382Ac6909556c4d0e03D6eAF0"

  }
};


export async function getLatestBlock(chainId: CHAIN) {
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS[chainId].rpc);
  return await provider.getBlock("latest");
}
