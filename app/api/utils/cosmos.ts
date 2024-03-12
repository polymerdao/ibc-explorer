import { IbcExtension, QueryClient, setupIbcExtension } from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { Height } from 'cosmjs-types/ibc/core/client/v1/client';
import * as process from 'process';
import { ICache, SimpleCache } from '@/api/utils/cache';

class CachingIbcExtension {
  private cache: ICache;
  private ttl: number;

  constructor(private ibcExtension: IbcExtension, ttl: number = 60) {
    this.cache = SimpleCache.getInstance();
    this.ttl = ttl;
  }

  async cachedCall<T>(cacheKey: string, call: () => Promise<T>): Promise<T> {
    let cachedResult: T | null = await this.cache.get(cacheKey);

    if (cachedResult !== null) {
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
      channels: (paginationKey?: Uint8Array) => channel.channels(paginationKey),
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

    const cachedConnection = {
      connection: (connectionId: string) =>
        this.cachedCall(`connection-${connectionId}`, () => this.ibcExtension.ibc.connection.connection(connectionId)),
      connections: (paginationKey?: Uint8Array) =>
        this.cachedCall(`connections-${paginationKey}`, () => this.ibcExtension.ibc.connection.connections(paginationKey)),
      allConnections: () =>
        this.ibcExtension.ibc.connection.allConnections(),
      clientConnections: (clientId: string) =>
        this.cachedCall(`clientConnections-${clientId}`, () => this.ibcExtension.ibc.connection.clientConnections(clientId)),
      clientState: (connectionId: string) =>
        this.cachedCall(`clientState-${connectionId}`, () => this.ibcExtension.ibc.connection.clientState(connectionId)),
      consensusState: (connectionId: string, revisionNumber: number, revisionHeight: number) =>
        this.cachedCall(`consensusState-${connectionId}-${revisionNumber}-${revisionHeight}`, () => this.ibcExtension.ibc.connection.consensusState(connectionId, revisionNumber, revisionHeight))
    };

    return {
      ibc: {
        channel: cachedChannel,
        client: cachedClient,
        connection: cachedConnection,
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