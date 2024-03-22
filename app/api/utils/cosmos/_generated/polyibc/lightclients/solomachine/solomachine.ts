/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Height } from "../../core/client";

export const protobufPackage = "polyibc.lightclients.solomachine";

export interface ClientState {
  sequence?: Height;
  consensusState?: ConsensusState;
  chainId: string;
  chainMemo: string;
}

export interface ConsensusState {
  publicKey: Uint8Array;
  /**
   * diversifier allows the same public key to be re-used across different solo
   * machine clients (potentially on different chains) without being considered
   * misbehaviour.
   */
  diversifier: string;
  timestamp?: Height;
}

export interface Header {
  /** opaque json bytes which must be unmarshalled into a signed solomachine signature */
  signature: Uint8Array;
  timestamp?: Height;
  newPublicKey: Uint8Array;
  newDiversifier: string;
}

export interface SignBytes {
  /** the sequence number */
  timestamp: string;
  /** the public key diversifier */
  diversifier: string;
  /** the standardised path bytes */
  path: Uint8Array;
  /** the marshaled data bytes */
  data: Uint8Array;
}

export interface HeaderData {
  /** header public key */
  newPubKey: Uint8Array;
  /** header diversifier */
  newDiversifier: string;
}

function createBaseClientState(): ClientState {
  return { sequence: undefined, consensusState: undefined, chainId: "", chainMemo: "" };
}

export const ClientState = {
  encode(message: ClientState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sequence !== undefined) {
      Height.encode(message.sequence, writer.uint32(10).fork()).ldelim();
    }
    if (message.consensusState !== undefined) {
      ConsensusState.encode(message.consensusState, writer.uint32(18).fork()).ldelim();
    }
    if (message.chainId !== "") {
      writer.uint32(26).string(message.chainId);
    }
    if (message.chainMemo !== "") {
      writer.uint32(34).string(message.chainMemo);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClientState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClientState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = Height.decode(reader, reader.uint32());
          break;
        case 2:
          message.consensusState = ConsensusState.decode(reader, reader.uint32());
          break;
        case 3:
          message.chainId = reader.string();
          break;
        case 4:
          message.chainMemo = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ClientState {
    return {
      sequence: isSet(object.sequence) ? Height.fromJSON(object.sequence) : undefined,
      consensusState: isSet(object.consensusState) ? ConsensusState.fromJSON(object.consensusState) : undefined,
      chainId: isSet(object.chainId) ? String(object.chainId) : "",
      chainMemo: isSet(object.chainMemo) ? String(object.chainMemo) : "",
    };
  },

  toJSON(message: ClientState): unknown {
    const obj: any = {};
    message.sequence !== undefined && (obj.sequence = message.sequence ? Height.toJSON(message.sequence) : undefined);
    message.consensusState !== undefined &&
      (obj.consensusState = message.consensusState ? ConsensusState.toJSON(message.consensusState) : undefined);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.chainMemo !== undefined && (obj.chainMemo = message.chainMemo);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ClientState>, I>>(object: I): ClientState {
    const message = createBaseClientState();
    message.sequence = (object.sequence !== undefined && object.sequence !== null)
      ? Height.fromPartial(object.sequence)
      : undefined;
    message.consensusState = (object.consensusState !== undefined && object.consensusState !== null)
      ? ConsensusState.fromPartial(object.consensusState)
      : undefined;
    message.chainId = object.chainId ?? "";
    message.chainMemo = object.chainMemo ?? "";
    return message;
  },
};

function createBaseConsensusState(): ConsensusState {
  return { publicKey: new Uint8Array(), diversifier: "", timestamp: undefined };
}

export const ConsensusState = {
  encode(message: ConsensusState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.publicKey.length !== 0) {
      writer.uint32(10).bytes(message.publicKey);
    }
    if (message.diversifier !== "") {
      writer.uint32(18).string(message.diversifier);
    }
    if (message.timestamp !== undefined) {
      Height.encode(message.timestamp, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ConsensusState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConsensusState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.publicKey = reader.bytes();
          break;
        case 2:
          message.diversifier = reader.string();
          break;
        case 3:
          message.timestamp = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ConsensusState {
    return {
      publicKey: isSet(object.publicKey) ? bytesFromBase64(object.publicKey) : new Uint8Array(),
      diversifier: isSet(object.diversifier) ? String(object.diversifier) : "",
      timestamp: isSet(object.timestamp) ? Height.fromJSON(object.timestamp) : undefined,
    };
  },

  toJSON(message: ConsensusState): unknown {
    const obj: any = {};
    message.publicKey !== undefined &&
      (obj.publicKey = base64FromBytes(message.publicKey !== undefined ? message.publicKey : new Uint8Array()));
    message.diversifier !== undefined && (obj.diversifier = message.diversifier);
    message.timestamp !== undefined &&
      (obj.timestamp = message.timestamp ? Height.toJSON(message.timestamp) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ConsensusState>, I>>(object: I): ConsensusState {
    const message = createBaseConsensusState();
    message.publicKey = object.publicKey ?? new Uint8Array();
    message.diversifier = object.diversifier ?? "";
    message.timestamp = (object.timestamp !== undefined && object.timestamp !== null)
      ? Height.fromPartial(object.timestamp)
      : undefined;
    return message;
  },
};

function createBaseHeader(): Header {
  return { signature: new Uint8Array(), timestamp: undefined, newPublicKey: new Uint8Array(), newDiversifier: "" };
}

export const Header = {
  encode(message: Header, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.signature.length !== 0) {
      writer.uint32(10).bytes(message.signature);
    }
    if (message.timestamp !== undefined) {
      Height.encode(message.timestamp, writer.uint32(18).fork()).ldelim();
    }
    if (message.newPublicKey.length !== 0) {
      writer.uint32(26).bytes(message.newPublicKey);
    }
    if (message.newDiversifier !== "") {
      writer.uint32(34).string(message.newDiversifier);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Header {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHeader();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signature = reader.bytes();
          break;
        case 2:
          message.timestamp = Height.decode(reader, reader.uint32());
          break;
        case 3:
          message.newPublicKey = reader.bytes();
          break;
        case 4:
          message.newDiversifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Header {
    return {
      signature: isSet(object.signature) ? bytesFromBase64(object.signature) : new Uint8Array(),
      timestamp: isSet(object.timestamp) ? Height.fromJSON(object.timestamp) : undefined,
      newPublicKey: isSet(object.newPublicKey) ? bytesFromBase64(object.newPublicKey) : new Uint8Array(),
      newDiversifier: isSet(object.newDiversifier) ? String(object.newDiversifier) : "",
    };
  },

  toJSON(message: Header): unknown {
    const obj: any = {};
    message.signature !== undefined &&
      (obj.signature = base64FromBytes(message.signature !== undefined ? message.signature : new Uint8Array()));
    message.timestamp !== undefined &&
      (obj.timestamp = message.timestamp ? Height.toJSON(message.timestamp) : undefined);
    message.newPublicKey !== undefined &&
      (obj.newPublicKey = base64FromBytes(
        message.newPublicKey !== undefined ? message.newPublicKey : new Uint8Array(),
      ));
    message.newDiversifier !== undefined && (obj.newDiversifier = message.newDiversifier);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Header>, I>>(object: I): Header {
    const message = createBaseHeader();
    message.signature = object.signature ?? new Uint8Array();
    message.timestamp = (object.timestamp !== undefined && object.timestamp !== null)
      ? Height.fromPartial(object.timestamp)
      : undefined;
    message.newPublicKey = object.newPublicKey ?? new Uint8Array();
    message.newDiversifier = object.newDiversifier ?? "";
    return message;
  },
};

function createBaseSignBytes(): SignBytes {
  return { timestamp: "0", diversifier: "", path: new Uint8Array(), data: new Uint8Array() };
}

export const SignBytes = {
  encode(message: SignBytes, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timestamp !== "0") {
      writer.uint32(8).uint64(message.timestamp);
    }
    if (message.diversifier !== "") {
      writer.uint32(18).string(message.diversifier);
    }
    if (message.path.length !== 0) {
      writer.uint32(26).bytes(message.path);
    }
    if (message.data.length !== 0) {
      writer.uint32(34).bytes(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SignBytes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignBytes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timestamp = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.diversifier = reader.string();
          break;
        case 3:
          message.path = reader.bytes();
          break;
        case 4:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SignBytes {
    return {
      timestamp: isSet(object.timestamp) ? String(object.timestamp) : "0",
      diversifier: isSet(object.diversifier) ? String(object.diversifier) : "",
      path: isSet(object.path) ? bytesFromBase64(object.path) : new Uint8Array(),
      data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array(),
    };
  },

  toJSON(message: SignBytes): unknown {
    const obj: any = {};
    message.timestamp !== undefined && (obj.timestamp = message.timestamp);
    message.diversifier !== undefined && (obj.diversifier = message.diversifier);
    message.path !== undefined &&
      (obj.path = base64FromBytes(message.path !== undefined ? message.path : new Uint8Array()));
    message.data !== undefined &&
      (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SignBytes>, I>>(object: I): SignBytes {
    const message = createBaseSignBytes();
    message.timestamp = object.timestamp ?? "0";
    message.diversifier = object.diversifier ?? "";
    message.path = object.path ?? new Uint8Array();
    message.data = object.data ?? new Uint8Array();
    return message;
  },
};

function createBaseHeaderData(): HeaderData {
  return { newPubKey: new Uint8Array(), newDiversifier: "" };
}

export const HeaderData = {
  encode(message: HeaderData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.newPubKey.length !== 0) {
      writer.uint32(10).bytes(message.newPubKey);
    }
    if (message.newDiversifier !== "") {
      writer.uint32(18).string(message.newDiversifier);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HeaderData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHeaderData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.newPubKey = reader.bytes();
          break;
        case 2:
          message.newDiversifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HeaderData {
    return {
      newPubKey: isSet(object.newPubKey) ? bytesFromBase64(object.newPubKey) : new Uint8Array(),
      newDiversifier: isSet(object.newDiversifier) ? String(object.newDiversifier) : "",
    };
  },

  toJSON(message: HeaderData): unknown {
    const obj: any = {};
    message.newPubKey !== undefined &&
      (obj.newPubKey = base64FromBytes(message.newPubKey !== undefined ? message.newPubKey : new Uint8Array()));
    message.newDiversifier !== undefined && (obj.newDiversifier = message.newDiversifier);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HeaderData>, I>>(object: I): HeaderData {
    const message = createBaseHeaderData();
    message.newPubKey = object.newPubKey ?? new Uint8Array();
    message.newDiversifier = object.newDiversifier ?? "";
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
