import { IbcExtension, QueryClient, setupIbcExtension } from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import NodeCache from 'node-cache';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import * as process from 'process';

interface ICache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttl: number): void;
}

export class SimpleCache implements ICache {
  private static instance: SimpleCache;
  private cache: NodeCache;

  private constructor(defaultTTL: number) {
    this.cache = new NodeCache({ stdTTL: defaultTTL });
  }

  public static getInstance(defaultTTL: number = getCacheTTL()): SimpleCache {
    if (!SimpleCache.instance) {
      SimpleCache.instance = new SimpleCache(defaultTTL);
    }
    return SimpleCache.instance;
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  set<T>(key: string, value: T, ttl: number = 0): void {
    this.cache.set(key, value, ttl);
  }
}

class CachingIbcExtension {
  private cache: ICache;
  private ttl: number;

  constructor(private ibcExtension: IbcExtension, ttl: number = 60) {
    this.cache = SimpleCache.getInstance(ttl);
    this.ttl = ttl;
  }

  async cachedCall<T>(cacheKey: string, call: () => Promise<T>): Promise<T> {
    let cachedResult: T | undefined = this.cache.get(cacheKey);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const result = await call();
    this.cache.set(cacheKey, result, this.ttl);
    return result;
  }

  get ibc() {
    const { channel, client } = this.ibcExtension.ibc;

    const cachedChannel = {
      channel: (portId: string, channelId: string) =>
        this.cachedCall(`channel-${portId}-${channelId}`, () => channel.channel(portId, channelId)),
      channels: (paginationKey?: Uint8Array) =>
        this.cachedCall(`channels-${paginationKey}`, () => channel.channels(paginationKey)),
      allChannels: () =>
        this.cachedCall(`allChannels`, () => channel.allChannels()),
      connectionChannels: (connection: string, paginationKey?: Uint8Array) =>
        this.cachedCall(`connectionChannels-${connection}-${paginationKey}`, () => channel.connectionChannels(connection, paginationKey)),
      allConnectionChannels: (connection: string) =>
        this.cachedCall(`allConnectionChannels-${connection}`, () => channel.allConnectionChannels(connection)),
      clientState: (portId: string, channelId: string) =>
        this.cachedCall(`clientState-${portId}-${channelId}`, () => channel.clientState(portId, channelId)),
      consensusState: (portId: string, channelId: string, revisionNumber: number, revisionHeight: number) =>
        this.cachedCall(`consensusState-${portId}-${channelId}-${revisionNumber}-${revisionHeight}`, () => channel.consensusState(portId, channelId, revisionNumber, revisionHeight)),
      packetCommitment: (portId: string, channelId: string, sequence: number) =>
        this.cachedCall(`packetCommitment-${portId}-${channelId}-${sequence}`, () => channel.packetCommitment(portId, channelId, sequence)),
      packetCommitments: (portId: string, channelId: string, paginationKey?: Uint8Array) =>
        this.cachedCall(`packetCommitments-${portId}-${channelId}-${paginationKey}`, () => channel.packetCommitments(portId, channelId, paginationKey)),
      allPacketCommitments: (portId: string, channelId: string) =>
        this.cachedCall(`allPacketCommitments-${portId}-${channelId}`, () => channel.allPacketCommitments(portId, channelId)),
      packetReceipt: (portId: string, channelId: string, sequence: number) =>
        this.cachedCall(`packetReceipt-${portId}-${channelId}-${sequence}`, () => channel.packetReceipt(portId, channelId, sequence)),
      packetAcknowledgement: (portId: string, channelId: string, sequence: number) =>
        this.cachedCall(`packetAcknowledgement-${portId}-${channelId}-${sequence}`, () => channel.packetAcknowledgement(portId, channelId, sequence)),
      packetAcknowledgements: (portId: string, channelId: string, paginationKey?: Uint8Array) =>
        this.cachedCall(`packetAcknowledgements-${portId}-${channelId}-${paginationKey}`, () => channel.packetAcknowledgements(portId, channelId, paginationKey)),
      allPacketAcknowledgements: (portId: string, channelId: string) =>
        this.cachedCall(`allPacketAcknowledgements-${portId}-${channelId}`, () => channel.allPacketAcknowledgements(portId, channelId)),
      unreceivedPackets: (portId: string, channelId: string, packetCommitmentSequences: readonly number[]) =>
        this.cachedCall(`unreceivedPackets-${portId}-${channelId}-${packetCommitmentSequences}`, () => channel.unreceivedPackets(portId, channelId, packetCommitmentSequences)),
      unreceivedAcks: (portId: string, channelId: string, packetAckSequences: readonly number[]) =>
        this.cachedCall(`unreceivedAcks-${portId}-${channelId}-${packetAckSequences}`, () => channel.unreceivedAcks(portId, channelId, packetAckSequences)),
      nextSequenceReceive: (portId: string, channelId: string) =>
        this.cachedCall(`nextSequenceReceive-${portId}-${channelId}`, () => channel.nextSequenceReceive(portId, channelId))
    };

    const cachedClient = {
      state: (clientId: string) =>
        this.cachedCall(`client-state-${clientId}`, () => client.state(clientId)),
      states: (paginationKey?: Uint8Array) =>
        this.cachedCall(`client-states-${paginationKey}`, () => client.states(paginationKey)),
      allStates: () =>
        this.cachedCall(`allStates`, () => client.allStates()),
      consensusState: (clientId: string, height?: number) =>
        this.cachedCall(`consensusState-${clientId}-${height}`, () => client.consensusState(clientId, height)),
      consensusStates: (clientId: string, paginationKey?: Uint8Array) =>
        this.cachedCall(`consensusStates-${clientId}-${paginationKey}`, () => client.consensusStates(clientId, paginationKey)),
      allConsensusStates: (clientId: string) =>
        this.cachedCall(`allConsensusStates-${clientId}`, () => client.allConsensusStates(clientId)),
      params: () =>
        this.cachedCall(`params`, () => client.params()),
      stateTm: (clientId: string) =>
        this.cachedCall(`stateTm-${clientId}`, () => client.stateTm(clientId)),
      statesTm: (paginationKey?: Uint8Array) =>
        this.cachedCall(`statesTm-${paginationKey}`, () => client.statesTm(paginationKey)),
      allStatesTm: () =>
        this.cachedCall(`allStatesTm`, () => client.allStatesTm()),
      consensusStateTm: (clientId: string, height?: Height) =>
        this.cachedCall(`consensusStateTm-${clientId}-${height}`, () => client.consensusStateTm(clientId, height))
    };
    return {
      ibc: {
        channel: cachedChannel,
        client: cachedClient,
        connection: this.ibcExtension.ibc.connection,
        transfer: this.ibcExtension.ibc.transfer,
        verified: this.ibcExtension.ibc.verified
      }
    };
  }
}


export function getCacheTTL() {
  return process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 60;
}

function setupCachingIbcExtension(base: QueryClient) {
  const ibcExtension = setupIbcExtension(base);
  const cacheTTL = getCacheTTL();
  return new CachingIbcExtension(ibcExtension, cacheTTL).ibc;
}


export async function GetTmClient(): Promise<QueryClient & IbcExtension> {
  const tmClient = await Tendermint37Client.connect(process.env.API_URL!);
  return QueryClient.withExtensions(tmClient, setupCachingIbcExtension);
}