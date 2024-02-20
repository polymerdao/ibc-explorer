import { ethers } from "ethers";
import { CHAIN, CHAIN_CONFIGS } from "@/utils/chains/configs";

export async function getLatestBlock(chainId: CHAIN) {
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS[chainId].rpc);
  return await provider.getBlock("latest");
}

export function hideMiddleChars(str: string) {
  const shortened =  str.slice(0, 7) + '...' + str.slice(-5);
  return <span title={str}>{shortened}</span>;
}
