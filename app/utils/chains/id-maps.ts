export const getChainId = (chainName: string, env: string): number => {
  chainName = chainName.toLowerCase();

  if (env === 'mainnet') {
    if (!(chainName in mainnetIdMap)) {
      throw new Error(`Invalid chain name: ${chainName}`);
    }
    return mainnetIdMap[chainName as ChainName];
  }

  else if (env === 'sepolia') {
    if (!(chainName in sepoliaIdMap)) {
      throw new Error(`Invalid chain name: ${chainName}`);
    }
    return sepoliaIdMap[chainName as ChainName];
  }

  throw new Error(`Invalid environment: ${env}`);
}

export type ChainName = 'optimism' | 'base';

export const mainnetIdMap: Record<ChainName, number> = {
   'optimism': 10,
   'base': 8453,
 }

export const sepoliaIdMap: Record<ChainName, number> = {
  'optimism': 11155420,
  'base': 84532,
}
