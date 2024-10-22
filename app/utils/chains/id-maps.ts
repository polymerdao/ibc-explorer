export const getChainId = (chainName: string, env: string): number => {
  if (env === 'mainnet') {
    return mainnetIdMap[chainName];
  } else if (env === 'sepolia') {
    return sepoliaIdMap[chainName];
  } else {
    return 0;
  }
}

export const mainnetIdMap: { [key: string]: number } = {
  'optimism': 10,
  'base': 8453,
}

export const sepoliaIdMap: { [key: string]: number } = {
  'optimism': 11155420,
  'base': 84532,
}
