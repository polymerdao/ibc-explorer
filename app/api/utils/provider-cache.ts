import { ethers } from 'ethers';
import * as flatCache from 'flat-cache';

export class CachingJsonRpcProvider extends ethers.JsonRpcProvider {
  private cache;
  private blockStep;

  constructor(
    url: string,
    network?: ethers.Networkish,
    cache: string = '/tmp',
    blockStep: BigInt = BigInt(1000)
  ) {
    super(url, network);
    this.cache = flatCache.load('ethCache', cache);
    this.blockStep = blockStep;
  }

  private async fetchDataWithCache<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>
  ): Promise<T> {
    // Check if the data is already in the cache
    const cachedData = this.cache.getKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    console.log('CACHE MISS: ', cacheKey);
    // Fetch data from the external service
    const data = await fetchFunction();

    // Store the new data in the cache
    this.cache.setKey(cacheKey, data);
    this.cache.save(true);
    return data;
  }

  // Override the method to add caching
  async getBlock(
    blockHashOrBlockTag: string | number
  ): Promise<ethers.Block | null> {
    return await this.fetchDataWithCache(
      `${this._network.chainId}_block_${blockHashOrBlockTag}`,
      async () => await super.getBlock(blockHashOrBlockTag)
    );
  }

  // Override other methods as needed
  // Example: Override getTransactionReceipt method
  async getTransactionReceipt(
    transactionHash: string
  ): Promise<ethers.TransactionReceipt | null> {
    return await this.fetchDataWithCache(
      `${this._network.chainId}_txReceipt_${transactionHash}`,
      async () => await super.getTransactionReceipt(transactionHash)
    );
  }

  async getLogs(filter: ethers.Filter): Promise<Array<ethers.Log>> {
    // don't cache non-aligned ranges
    const to = BigInt(filter.toBlock ? filter.toBlock : 0);
    const from = BigInt(filter.fromBlock ? filter.fromBlock : 0);
    const step = to - from + BigInt(1);
    if (step != this.blockStep) {
      console.log('CACHE MISS: misaligned step=', step);
      return await super.getLogs(filter);
    }
    return await this.fetchDataWithCache(
      `${this._network.chainId}_logs_${filter.topics![0]!.toString()}_${
        filter.address
      }_${filter.fromBlock}_${filter.toBlock}`,
      async () => await super.getLogs(filter)
    );
  }
}
