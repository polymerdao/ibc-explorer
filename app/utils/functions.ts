import { ethers } from "ethers";
import { CHAIN, CHAIN_CONFIGS } from "@/utils/chains/configs";

export async function getLatestBlock(chainId: CHAIN) {
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS[chainId].rpc);
  return await provider.getBlock("latest");
}
