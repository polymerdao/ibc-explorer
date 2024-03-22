/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "rollup";

/** QueryL1BlockInfoRequest is the request type for the Query/L1BlockInfo RPC */
export interface QueryL1BlockInfoRequest {
  /** L2 block height; use 0 for latest block height */
  height: string;
}

/** QueryL1BlockInfoResponse is the stored L1 block info */
export interface QueryL1BlockInfoResponse {
  /** Block number */
  number: string;
  /** Block timestamp */
  time: string;
  /** Base fee for the block */
  baseFee: Uint8Array;
  /** Hash of the blocK; bytes32 */
  blockHash: Uint8Array;
  /**
   * Number of L2 blocks since the start of the epoch
   * Not strictly a piece of L1 information. Represents the number of L2 blocks since the start of the epoch,
   * i.e. when the actual L1 info was first introduced.
   */
  sequenceNumber: string;
  /**
   * Fields 6,7,8 are SystemConfig
   * Address of the batcher; bytes20
   */
  batcherAddr: Uint8Array;
  /** Overhead fee for L1; bytes32 */
  l1FeeOverhead: Uint8Array;
  /** Scalar fee for L1; bytes32 */
  l1FeeScalar: Uint8Array;
}

function createBaseQueryL1BlockInfoRequest(): QueryL1BlockInfoRequest {
  return { height: "0" };
}

export const QueryL1BlockInfoRequest = {
  encode(message: QueryL1BlockInfoRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.height !== "0") {
      writer.uint32(8).uint64(message.height);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryL1BlockInfoRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryL1BlockInfoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryL1BlockInfoRequest {
    return { height: isSet(object.height) ? String(object.height) : "0" };
  },

  toJSON(message: QueryL1BlockInfoRequest): unknown {
    const obj: any = {};
    message.height !== undefined && (obj.height = message.height);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryL1BlockInfoRequest>, I>>(object: I): QueryL1BlockInfoRequest {
    const message = createBaseQueryL1BlockInfoRequest();
    message.height = object.height ?? "0";
    return message;
  },
};

function createBaseQueryL1BlockInfoResponse(): QueryL1BlockInfoResponse {
  return {
    number: "0",
    time: "0",
    baseFee: new Uint8Array(),
    blockHash: new Uint8Array(),
    sequenceNumber: "0",
    batcherAddr: new Uint8Array(),
    l1FeeOverhead: new Uint8Array(),
    l1FeeScalar: new Uint8Array(),
  };
}

export const QueryL1BlockInfoResponse = {
  encode(message: QueryL1BlockInfoResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.number !== "0") {
      writer.uint32(8).uint64(message.number);
    }
    if (message.time !== "0") {
      writer.uint32(16).uint64(message.time);
    }
    if (message.baseFee.length !== 0) {
      writer.uint32(26).bytes(message.baseFee);
    }
    if (message.blockHash.length !== 0) {
      writer.uint32(34).bytes(message.blockHash);
    }
    if (message.sequenceNumber !== "0") {
      writer.uint32(40).uint64(message.sequenceNumber);
    }
    if (message.batcherAddr.length !== 0) {
      writer.uint32(50).bytes(message.batcherAddr);
    }
    if (message.l1FeeOverhead.length !== 0) {
      writer.uint32(58).bytes(message.l1FeeOverhead);
    }
    if (message.l1FeeScalar.length !== 0) {
      writer.uint32(66).bytes(message.l1FeeScalar);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryL1BlockInfoResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryL1BlockInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.number = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.time = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.baseFee = reader.bytes();
          break;
        case 4:
          message.blockHash = reader.bytes();
          break;
        case 5:
          message.sequenceNumber = longToString(reader.uint64() as Long);
          break;
        case 6:
          message.batcherAddr = reader.bytes();
          break;
        case 7:
          message.l1FeeOverhead = reader.bytes();
          break;
        case 8:
          message.l1FeeScalar = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryL1BlockInfoResponse {
    return {
      number: isSet(object.number) ? String(object.number) : "0",
      time: isSet(object.time) ? String(object.time) : "0",
      baseFee: isSet(object.baseFee) ? bytesFromBase64(object.baseFee) : new Uint8Array(),
      blockHash: isSet(object.blockHash) ? bytesFromBase64(object.blockHash) : new Uint8Array(),
      sequenceNumber: isSet(object.sequenceNumber) ? String(object.sequenceNumber) : "0",
      batcherAddr: isSet(object.batcherAddr) ? bytesFromBase64(object.batcherAddr) : new Uint8Array(),
      l1FeeOverhead: isSet(object.l1FeeOverhead) ? bytesFromBase64(object.l1FeeOverhead) : new Uint8Array(),
      l1FeeScalar: isSet(object.l1FeeScalar) ? bytesFromBase64(object.l1FeeScalar) : new Uint8Array(),
    };
  },

  toJSON(message: QueryL1BlockInfoResponse): unknown {
    const obj: any = {};
    message.number !== undefined && (obj.number = message.number);
    message.time !== undefined && (obj.time = message.time);
    message.baseFee !== undefined &&
      (obj.baseFee = base64FromBytes(message.baseFee !== undefined ? message.baseFee : new Uint8Array()));
    message.blockHash !== undefined &&
      (obj.blockHash = base64FromBytes(message.blockHash !== undefined ? message.blockHash : new Uint8Array()));
    message.sequenceNumber !== undefined && (obj.sequenceNumber = message.sequenceNumber);
    message.batcherAddr !== undefined &&
      (obj.batcherAddr = base64FromBytes(message.batcherAddr !== undefined ? message.batcherAddr : new Uint8Array()));
    message.l1FeeOverhead !== undefined &&
      (obj.l1FeeOverhead = base64FromBytes(
        message.l1FeeOverhead !== undefined ? message.l1FeeOverhead : new Uint8Array(),
      ));
    message.l1FeeScalar !== undefined &&
      (obj.l1FeeScalar = base64FromBytes(message.l1FeeScalar !== undefined ? message.l1FeeScalar : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryL1BlockInfoResponse>, I>>(object: I): QueryL1BlockInfoResponse {
    const message = createBaseQueryL1BlockInfoResponse();
    message.number = object.number ?? "0";
    message.time = object.time ?? "0";
    message.baseFee = object.baseFee ?? new Uint8Array();
    message.blockHash = object.blockHash ?? new Uint8Array();
    message.sequenceNumber = object.sequenceNumber ?? "0";
    message.batcherAddr = object.batcherAddr ?? new Uint8Array();
    message.l1FeeOverhead = object.l1FeeOverhead ?? new Uint8Array();
    message.l1FeeScalar = object.l1FeeScalar ?? new Uint8Array();
    return message;
  },
};

/** Query defines all tx endpoints for the rollup module. */
export interface Query {
  L1BlockInfo(request: QueryL1BlockInfoRequest): Promise<QueryL1BlockInfoResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "rollup.Query";
    this.rpc = rpc;
    this.L1BlockInfo = this.L1BlockInfo.bind(this);
  }
  L1BlockInfo(request: QueryL1BlockInfoRequest): Promise<QueryL1BlockInfoResponse> {
    const data = QueryL1BlockInfoRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "L1BlockInfo", data);
    return promise.then((data) => QueryL1BlockInfoResponse.decode(new _m0.Reader(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToString(long: Long) {
  return long.toString();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
