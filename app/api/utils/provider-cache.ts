import { ethers } from 'ethers';
import * as flatCache from 'flat-cache';

class CachingJsonRpcProvider extends ethers.JsonRpcProvider {
  private cache;

  constructor(url: string, network?: ethers.Networkish) {
    super(url, network);

    this.cache = flatCache.load('ethCache', "/tmp");
  }

  private async fetchDataWithCache<T>(cacheKey: string, fetchFunction: () => Promise<T>): Promise<T> {
    // Check if the data is already in the cache
    const cachedData = this.cache.getKey(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    // Fetch data from the external service
    const data = await fetchFunction();

    // Store the new data in the cache
    this.cache.setKey(cacheKey, data);
    this.cache.save(true);

    return data;
  }

  // Override the method to add caching
  async getBlock(blockHashOrBlockTag: string | number): Promise<ethers.Block | null> {
    return await this.fetchDataWithCache(
      `${this._network.chainId}_block_${blockHashOrBlockTag}`,
      async () => await super.getBlock(blockHashOrBlockTag)
    );
  }

  // Override other methods as needed

  // Example: Override getTransactionReceipt method
  async getTransactionReceipt(transactionHash: string): Promise<ethers.TransactionReceipt | null> {
    return await this.fetchDataWithCache(
      `${this._network.chainId}_txReceipt_${transactionHash}`,
      async () => await super.getTransactionReceipt(transactionHash)
    );
  }
}

export default CachingJsonRpcProvider;
