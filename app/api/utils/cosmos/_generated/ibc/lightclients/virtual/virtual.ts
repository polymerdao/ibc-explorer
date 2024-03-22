/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Height } from "../../core/client/v1/client";

export const protobufPackage = "ibc.lightclients.virtual";

/**
 * ClientState defines a virtual client that wraps a non-native-IBC light-client
 * in x/polyibc/light-clients
 */
export interface ClientState {
  /** Virtual chain id */
  chainId: string;
  /** Latest height the client was updated to */
  latestHeight?: Height;
  /** vibc client params, eg. for security settings */
  params: Uint8Array;
}

function createBaseClientState(): ClientState {
  return { chainId: "", latestHeight: undefined, params: new Uint8Array() };
}

export const ClientState = {
  encode(message: ClientState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chainId !== "") {
      writer.uint32(10).string(message.chainId);
    }
    if (message.latestHeight !== undefined) {
      Height.encode(message.latestHeight, writer.uint32(58).fork()).ldelim();
    }
    if (message.params.length !== 0) {
      writer.uint32(26).bytes(message.params);
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
          message.chainId = reader.string();
          break;
        case 7:
          message.latestHeight = Height.decode(reader, reader.uint32());
          break;
        case 3:
          message.params = reader.bytes();
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
      chainId: isSet(object.chainId) ? String(object.chainId) : "",
      latestHeight: isSet(object.latestHeight) ? Height.fromJSON(object.latestHeight) : undefined,
      params: isSet(object.params) ? bytesFromBase64(object.params) : new Uint8Array(),
    };
  },

  toJSON(message: ClientState): unknown {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.latestHeight !== undefined &&
      (obj.latestHeight = message.latestHeight ? Height.toJSON(message.latestHeight) : undefined);
    message.params !== undefined &&
      (obj.params = base64FromBytes(message.params !== undefined ? message.params : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ClientState>, I>>(object: I): ClientState {
    const message = createBaseClientState();
    message.chainId = object.chainId ?? "";
    message.latestHeight = (object.latestHeight !== undefined && object.latestHeight !== null)
      ? Height.fromPartial(object.latestHeight)
      : undefined;
    message.params = object.params ?? new Uint8Array();
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
