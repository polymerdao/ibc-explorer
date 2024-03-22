/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "rollup";

/** MsgL1Txs defines a message for all L1 system and user deposit txs */
export interface MsgL1Txs {
  /**
   * array of bytes, each bytes is a eth.Transaction.MarshalBinary tx
   * The first tx must be a L1 system deposit tx, and the rest are user txs if present
   */
  txBytes: Uint8Array[];
}

export interface MsgL1TxsResponse {
}

function createBaseMsgL1Txs(): MsgL1Txs {
  return { txBytes: [] };
}

export const MsgL1Txs = {
  encode(message: MsgL1Txs, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.txBytes) {
      writer.uint32(10).bytes(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgL1Txs {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgL1Txs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.txBytes.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgL1Txs {
    return { txBytes: Array.isArray(object?.txBytes) ? object.txBytes.map((e: any) => bytesFromBase64(e)) : [] };
  },

  toJSON(message: MsgL1Txs): unknown {
    const obj: any = {};
    if (message.txBytes) {
      obj.txBytes = message.txBytes.map((e) => base64FromBytes(e !== undefined ? e : new Uint8Array()));
    } else {
      obj.txBytes = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgL1Txs>, I>>(object: I): MsgL1Txs {
    const message = createBaseMsgL1Txs();
    message.txBytes = object.txBytes?.map((e) => e) || [];
    return message;
  },
};

function createBaseMsgL1TxsResponse(): MsgL1TxsResponse {
  return {};
}

export const MsgL1TxsResponse = {
  encode(_: MsgL1TxsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgL1TxsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgL1TxsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgL1TxsResponse {
    return {};
  },

  toJSON(_: MsgL1TxsResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgL1TxsResponse>, I>>(_: I): MsgL1TxsResponse {
    const message = createBaseMsgL1TxsResponse();
    return message;
  },
};

/** Msg defines all tx endpoints for the rollup module. */
export interface Msg {
  ApplyL1Txs(request: MsgL1Txs): Promise<MsgL1TxsResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "rollup.Msg";
    this.rpc = rpc;
    this.ApplyL1Txs = this.ApplyL1Txs.bind(this);
  }
  ApplyL1Txs(request: MsgL1Txs): Promise<MsgL1TxsResponse> {
    const data = MsgL1Txs.encode(request).finish();
    const promise = this.rpc.request(this.service, "ApplyL1Txs", data);
    return promise.then((data) => MsgL1TxsResponse.decode(new _m0.Reader(data)));
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
