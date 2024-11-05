export const getChainId = (chainName: string, env: string): number => {
  chainName = chainName.toLowerCase();

  let chainMap: Record<string, number>;
  if (env === 'sepolia') {
    chainMap = sepoliaIdMap;
  } else if (env === 'mainnet') {
    chainMap = mainnetIdMap;
  } else {
    throw new Error(`Invalid environment: ${env}`);
  }

  if (!(chainName in chainMap)) {
    throw new Error(`Invalid chain name: ${chainName}`);
  }

  return chainMap[chainName as ChainName];
};

export type ChainName = 'optimism' | 'base' | 'mode' | 'bob';

export const mainnetIdMap: Record<ChainName, number> = {
  'optimism': 10,
  'base': 8453,
  'mode': 34443,
  'bob': 60808
};

export const sepoliaIdMap: Record<ChainName, number> = {
  'optimism': 11155420,
  'base': 84532,
  'mode': 919,
  'bob': 808813
};
