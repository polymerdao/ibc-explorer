import { ethers } from 'ethers';
import * as flatCache from 'flat-cache';

import { SimpleCache } from '@/api/utils/cache';

export class CachingJsonRpcProvider extends ethers.JsonRpcProvider {
  private cache;

  constructor(url: string, network?: ethers.Networkish) {
    super(url, network);
    this.cache = SimpleCache.getInstance();
  }

  private async fetchDataWithCache<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>
  ): Promise<T> {
    // Check if the data is already in the cache
    const cachedData = await this.cache.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Fetch data from the external service
    const data = await fetchFunction();

    // Store the new data in the cache
    await this.cache.set(cacheKey, data);
    return data;
  }

  // Override the method to add caching
  async getBlock(
    blockHashOrBlockTag: string | number
  ): Promise<ethers.Block | null> {
    if (blockHashOrBlockTag == 'latest') {
      return await super.getBlock(blockHashOrBlockTag);
    }
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
}
