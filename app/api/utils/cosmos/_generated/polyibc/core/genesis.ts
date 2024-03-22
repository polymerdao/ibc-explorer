/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { ClientConsensusStates, IdentifiedClientState } from "./client";
import { Params } from "./params";

export const protobufPackage = "polyibc.core";

/** GenesisState defines the polyibc module's genesis state. */
export interface GenesisState {
  params?: Params;
  /** the sequence for the next generated client identifier */
  nextClientSequence: string;
  /** client states with their corresponding identifiers */
  clients: IdentifiedClientState[];
  /** consensus states from each client */
  clientsConsensus: ClientConsensusStates[];
  /** metadata from each client */
  clientsMetadata: IdentifiedGenesisMetadata[];
  portId: string;
  /** this line is used by starport scaffolding # genesis/proto/state */
  channelMap: { [key: string]: string };
}

export interface GenesisState_ChannelMapEntry {
  key: string;
  value: string;
}

/**
 * GenesisMetadata defines the genesis type for metadata that clients may return
 * with ExportMetadata
 */
export interface GenesisMetadata {
  /** store key of metadata without clientID-prefix */
  key: Uint8Array;
  /** metadata value */
  value: Uint8Array;
}

/**
 * IdentifiedGenesisMetadata has the client metadata with the corresponding
 * client id.
 */
export interface IdentifiedGenesisMetadata {
  clientId: string;
  clientMetadata: GenesisMetadata[];
}

function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
    nextClientSequence: "0",
    clients: [],
    clientsConsensus: [],
    clientsMetadata: [],
    portId: "",
    channelMap: {},
  };
}

export const GenesisState = {
  encode(message: GenesisState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextClientSequence !== "0") {
      writer.uint32(16).uint64(message.nextClientSequence);
    }
    for (const v of message.clients) {
      IdentifiedClientState.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.clientsConsensus) {
      ClientConsensusStates.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.clientsMetadata) {
      IdentifiedGenesisMetadata.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.portId !== "") {
      writer.uint32(50).string(message.portId);
    }
    Object.entries(message.channelMap).forEach(([key, value]) => {
      GenesisState_ChannelMapEntry.encode({ key: key as any, value }, writer.uint32(58).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.nextClientSequence = longToString(reader.uint64() as Long);
          break;
        case 3:
          message.clients.push(IdentifiedClientState.decode(reader, reader.uint32()));
          break;
        case 4:
          message.clientsConsensus.push(ClientConsensusStates.decode(reader, reader.uint32()));
          break;
        case 5:
          message.clientsMetadata.push(IdentifiedGenesisMetadata.decode(reader, reader.uint32()));
          break;
        case 6:
          message.portId = reader.string();
          break;
        case 7:
          const entry7 = GenesisState_ChannelMapEntry.decode(reader, reader.uint32());
          if (entry7.value !== undefined) {
            message.channelMap[entry7.key] = entry7.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisState {
    return {
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
      nextClientSequence: isSet(object.nextClientSequence) ? String(object.nextClientSequence) : "0",
      clients: Array.isArray(object?.clients) ? object.clients.map((e: any) => IdentifiedClientState.fromJSON(e)) : [],
      clientsConsensus: Array.isArray(object?.clientsConsensus)
        ? object.clientsConsensus.map((e: any) => ClientConsensusStates.fromJSON(e))
        : [],
      clientsMetadata: Array.isArray(object?.clientsMetadata)
        ? object.clientsMetadata.map((e: any) => IdentifiedGenesisMetadata.fromJSON(e))
        : [],
      portId: isSet(object.portId) ? String(object.portId) : "",
      channelMap: isObject(object.channelMap)
        ? Object.entries(object.channelMap).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.params !== undefined && (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    message.nextClientSequence !== undefined && (obj.nextClientSequence = message.nextClientSequence);
    if (message.clients) {
      obj.clients = message.clients.map((e) => e ? IdentifiedClientState.toJSON(e) : undefined);
    } else {
      obj.clients = [];
    }
    if (message.clientsConsensus) {
      obj.clientsConsensus = message.clientsConsensus.map((e) => e ? ClientConsensusStates.toJSON(e) : undefined);
    } else {
      obj.clientsConsensus = [];
    }
    if (message.clientsMetadata) {
      obj.clientsMetadata = message.clientsMetadata.map((e) => e ? IdentifiedGenesisMetadata.toJSON(e) : undefined);
    } else {
      obj.clientsMetadata = [];
    }
    message.portId !== undefined && (obj.portId = message.portId);
    obj.channelMap = {};
    if (message.channelMap) {
      Object.entries(message.channelMap).forEach(([k, v]) => {
        obj.channelMap[k] = v;
      });
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(object: I): GenesisState {
    const message = createBaseGenesisState();
    message.params = (object.params !== undefined && object.params !== null)
      ? Params.fromPartial(object.params)
      : undefined;
    message.nextClientSequence = object.nextClientSequence ?? "0";
    message.clients = object.clients?.map((e) => IdentifiedClientState.fromPartial(e)) || [];
    message.clientsConsensus = object.clientsConsensus?.map((e) => ClientConsensusStates.fromPartial(e)) || [];
    message.clientsMetadata = object.clientsMetadata?.map((e) => IdentifiedGenesisMetadata.fromPartial(e)) || [];
    message.portId = object.portId ?? "";
    message.channelMap = Object.entries(object.channelMap ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseGenesisState_ChannelMapEntry(): GenesisState_ChannelMapEntry {
  return { key: "0", value: "" };
}

export const GenesisState_ChannelMapEntry = {
  encode(message: GenesisState_ChannelMapEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "0") {
      writer.uint32(8).uint64(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState_ChannelMapEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState_ChannelMapEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisState_ChannelMapEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "0",
      value: isSet(object.value) ? String(object.value) : "",
    };
  },

  toJSON(message: GenesisState_ChannelMapEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState_ChannelMapEntry>, I>>(object: I): GenesisState_ChannelMapEntry {
    const message = createBaseGenesisState_ChannelMapEntry();
    message.key = object.key ?? "0";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseGenesisMetadata(): GenesisMetadata {
  return { key: new Uint8Array(), value: new Uint8Array() };
}

export const GenesisMetadata = {
  encode(message: GenesisMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key.length !== 0) {
      writer.uint32(10).bytes(message.key);
    }
    if (message.value.length !== 0) {
      writer.uint32(18).bytes(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.bytes();
          break;
        case 2:
          message.value = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisMetadata {
    return {
      key: isSet(object.key) ? bytesFromBase64(object.key) : new Uint8Array(),
      value: isSet(object.value) ? bytesFromBase64(object.value) : new Uint8Array(),
    };
  },

  toJSON(message: GenesisMetadata): unknown {
    const obj: any = {};
    message.key !== undefined &&
      (obj.key = base64FromBytes(message.key !== undefined ? message.key : new Uint8Array()));
    message.value !== undefined &&
      (obj.value = base64FromBytes(message.value !== undefined ? message.value : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisMetadata>, I>>(object: I): GenesisMetadata {
    const message = createBaseGenesisMetadata();
    message.key = object.key ?? new Uint8Array();
    message.value = object.value ?? new Uint8Array();
    return message;
  },
};

function createBaseIdentifiedGenesisMetadata(): IdentifiedGenesisMetadata {
  return { clientId: "", clientMetadata: [] };
}

export const IdentifiedGenesisMetadata = {
  encode(message: IdentifiedGenesisMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    for (const v of message.clientMetadata) {
      GenesisMetadata.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IdentifiedGenesisMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIdentifiedGenesisMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        case 2:
          message.clientMetadata.push(GenesisMetadata.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IdentifiedGenesisMetadata {
    return {
      clientId: isSet(object.clientId) ? String(object.clientId) : "",
      clientMetadata: Array.isArray(object?.clientMetadata)
        ? object.clientMetadata.map((e: any) => GenesisMetadata.fromJSON(e))
        : [],
    };
  },

  toJSON(message: IdentifiedGenesisMetadata): unknown {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    if (message.clientMetadata) {
      obj.clientMetadata = message.clientMetadata.map((e) => e ? GenesisMetadata.toJSON(e) : undefined);
    } else {
      obj.clientMetadata = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IdentifiedGenesisMetadata>, I>>(object: I): IdentifiedGenesisMetadata {
    const message = createBaseIdentifiedGenesisMetadata();
    message.clientId = object.clientId ?? "";
    message.clientMetadata = object.clientMetadata?.map((e) => GenesisMetadata.fromPartial(e)) || [];
    return message;
  },
};

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

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
