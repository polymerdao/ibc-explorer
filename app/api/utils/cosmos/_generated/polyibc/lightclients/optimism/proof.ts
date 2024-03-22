/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "polyibc.lightclients.optimism";

/** StorageProof is a proof of contract storage slots against the contract storage root. */
export interface StorageProof {
  /**
   * Account proof of a contract storage root against the state root of the eth1 block.
   * The smart contract address is already bound to the client instance and is used as the proof key.
   */
  accountProof: Uint8Array[];
  /** Storage root of the L2 output oracle contract. */
  storageRoot: Uint8Array;
  indexForL2OutputArray: string;
  /**
   * The key is known ahead of time and represents the storage slot of the output roots array (length_proof)
   * or the storage offset into the array itself (output_root_proof, block_number_proof).
   */
  outputRootProof: Uint8Array[];
  blockNumberProof: Uint8Array[];
  headers: Uint8Array[];
}

function createBaseStorageProof(): StorageProof {
  return {
    accountProof: [],
    storageRoot: new Uint8Array(),
    indexForL2OutputArray: "0",
    outputRootProof: [],
    blockNumberProof: [],
    headers: [],
  };
}

export const StorageProof = {
  encode(message: StorageProof, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.accountProof) {
      writer.uint32(10).bytes(v!);
    }
    if (message.storageRoot.length !== 0) {
      writer.uint32(18).bytes(message.storageRoot);
    }
    if (message.indexForL2OutputArray !== "0") {
      writer.uint32(24).uint64(message.indexForL2OutputArray);
    }
    for (const v of message.outputRootProof) {
      writer.uint32(34).bytes(v!);
    }
    for (const v of message.blockNumberProof) {
      writer.uint32(42).bytes(v!);
    }
    for (const v of message.headers) {
      writer.uint32(50).bytes(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StorageProof {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStorageProof();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.accountProof.push(reader.bytes());
          break;
        case 2:
          message.storageRoot = reader.bytes();
          break;
        case 3:
          message.indexForL2OutputArray = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.outputRootProof.push(reader.bytes());
          break;
        case 5:
          message.blockNumberProof.push(reader.bytes());
          break;
        case 6:
          message.headers.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StorageProof {
    return {
      accountProof: Array.isArray(object?.accountProof) ? object.accountProof.map((e: any) => bytesFromBase64(e)) : [],
      storageRoot: isSet(object.storageRoot) ? bytesFromBase64(object.storageRoot) : new Uint8Array(),
      indexForL2OutputArray: isSet(object.indexForL2OutputArray) ? String(object.indexForL2OutputArray) : "0",
      outputRootProof: Array.isArray(object?.outputRootProof)
        ? object.outputRootProof.map((e: any) => bytesFromBase64(e))
        : [],
      blockNumberProof: Array.isArray(object?.blockNumberProof)
        ? object.blockNumberProof.map((e: any) => bytesFromBase64(e))
        : [],
      headers: Array.isArray(object?.headers) ? object.headers.map((e: any) => bytesFromBase64(e)) : [],
    };
  },

  toJSON(message: StorageProof): unknown {
    const obj: any = {};
    if (message.accountProof) {
      obj.accountProof = message.accountProof.map((e) => base64FromBytes(e !== undefined ? e : new Uint8Array()));
    } else {
      obj.accountProof = [];
    }
    message.storageRoot !== undefined &&
      (obj.storageRoot = base64FromBytes(message.storageRoot !== undefined ? message.storageRoot : new Uint8Array()));
    message.indexForL2OutputArray !== undefined && (obj.indexForL2OutputArray = message.indexForL2OutputArray);
    if (message.outputRootProof) {
      obj.outputRootProof = message.outputRootProof.map((e) => base64FromBytes(e !== undefined ? e : new Uint8Array()));
    } else {
      obj.outputRootProof = [];
    }
    if (message.blockNumberProof) {
      obj.blockNumberProof = message.blockNumberProof.map((e) =>
        base64FromBytes(e !== undefined ? e : new Uint8Array())
      );
    } else {
      obj.blockNumberProof = [];
    }
    if (message.headers) {
      obj.headers = message.headers.map((e) => base64FromBytes(e !== undefined ? e : new Uint8Array()));
    } else {
      obj.headers = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<StorageProof>, I>>(object: I): StorageProof {
    const message = createBaseStorageProof();
    message.accountProof = object.accountProof?.map((e) => e) || [];
    message.storageRoot = object.storageRoot ?? new Uint8Array();
    message.indexForL2OutputArray = object.indexForL2OutputArray ?? "0";
    message.outputRootProof = object.outputRootProof?.map((e) => e) || [];
    message.blockNumberProof = object.blockNumberProof?.map((e) => e) || [];
    message.headers = object.headers?.map((e) => e) || [];
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
