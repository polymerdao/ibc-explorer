/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Proof } from "./proof";

export const protobufPackage = "polyibc.core";

/** TODO: Make IbcPktPacket optional here? */
export interface PolyibcPacketData {
  /** this line is used by starport scaffolding # ibc/packet/proto/field/number */
  packet?: IbcPacketData;
}

export interface NoData {
}

/** IbcPacketData defines a struct for the packet payload */
export interface IbcPacketData {
  remoteSenderAddress: Uint8Array;
  payload: Uint8Array;
  proof?: Proof;
}

/** IbcPacketAck defines a struct for the packet acknowledgment */
export interface IbcPacketAck {
  /** moduleName is the name of the module where the packet is sent to */
  moduleName: string;
  /** packetId is the id of persisted packet in the receiving module */
  packetId: string;
}

function createBasePolyibcPacketData(): PolyibcPacketData {
  return { packet: undefined };
}

export const PolyibcPacketData = {
  encode(message: PolyibcPacketData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.packet !== undefined) {
      IbcPacketData.encode(message.packet, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PolyibcPacketData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePolyibcPacketData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.packet = IbcPacketData.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PolyibcPacketData {
    return { packet: isSet(object.packet) ? IbcPacketData.fromJSON(object.packet) : undefined };
  },

  toJSON(message: PolyibcPacketData): unknown {
    const obj: any = {};
    message.packet !== undefined && (obj.packet = message.packet ? IbcPacketData.toJSON(message.packet) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PolyibcPacketData>, I>>(object: I): PolyibcPacketData {
    const message = createBasePolyibcPacketData();
    message.packet = (object.packet !== undefined && object.packet !== null)
      ? IbcPacketData.fromPartial(object.packet)
      : undefined;
    return message;
  },
};

function createBaseNoData(): NoData {
  return {};
}

export const NoData = {
  encode(_: NoData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NoData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNoData();
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

  fromJSON(_: any): NoData {
    return {};
  },

  toJSON(_: NoData): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<NoData>, I>>(_: I): NoData {
    const message = createBaseNoData();
    return message;
  },
};

function createBaseIbcPacketData(): IbcPacketData {
  return { remoteSenderAddress: new Uint8Array(), payload: new Uint8Array(), proof: undefined };
}

export const IbcPacketData = {
  encode(message: IbcPacketData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.remoteSenderAddress.length !== 0) {
      writer.uint32(10).bytes(message.remoteSenderAddress);
    }
    if (message.payload.length !== 0) {
      writer.uint32(18).bytes(message.payload);
    }
    if (message.proof !== undefined) {
      Proof.encode(message.proof, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IbcPacketData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIbcPacketData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.remoteSenderAddress = reader.bytes();
          break;
        case 2:
          message.payload = reader.bytes();
          break;
        case 3:
          message.proof = Proof.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IbcPacketData {
    return {
      remoteSenderAddress: isSet(object.remoteSenderAddress)
        ? bytesFromBase64(object.remoteSenderAddress)
        : new Uint8Array(),
      payload: isSet(object.payload) ? bytesFromBase64(object.payload) : new Uint8Array(),
      proof: isSet(object.proof) ? Proof.fromJSON(object.proof) : undefined,
    };
  },

  toJSON(message: IbcPacketData): unknown {
    const obj: any = {};
    message.remoteSenderAddress !== undefined &&
      (obj.remoteSenderAddress = base64FromBytes(
        message.remoteSenderAddress !== undefined ? message.remoteSenderAddress : new Uint8Array(),
      ));
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(message.payload !== undefined ? message.payload : new Uint8Array()));
    message.proof !== undefined && (obj.proof = message.proof ? Proof.toJSON(message.proof) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IbcPacketData>, I>>(object: I): IbcPacketData {
    const message = createBaseIbcPacketData();
    message.remoteSenderAddress = object.remoteSenderAddress ?? new Uint8Array();
    message.payload = object.payload ?? new Uint8Array();
    message.proof = (object.proof !== undefined && object.proof !== null) ? Proof.fromPartial(object.proof) : undefined;
    return message;
  },
};

function createBaseIbcPacketAck(): IbcPacketAck {
  return { moduleName: "", packetId: "0" };
}

export const IbcPacketAck = {
  encode(message: IbcPacketAck, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.moduleName !== "") {
      writer.uint32(10).string(message.moduleName);
    }
    if (message.packetId !== "0") {
      writer.uint32(16).uint64(message.packetId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IbcPacketAck {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIbcPacketAck();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.moduleName = reader.string();
          break;
        case 2:
          message.packetId = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): IbcPacketAck {
    return {
      moduleName: isSet(object.moduleName) ? String(object.moduleName) : "",
      packetId: isSet(object.packetId) ? String(object.packetId) : "0",
    };
  },

  toJSON(message: IbcPacketAck): unknown {
    const obj: any = {};
    message.moduleName !== undefined && (obj.moduleName = message.moduleName);
    message.packetId !== undefined && (obj.packetId = message.packetId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IbcPacketAck>, I>>(object: I): IbcPacketAck {
    const message = createBaseIbcPacketAck();
    message.moduleName = object.moduleName ?? "";
    message.packetId = object.packetId ?? "0";
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
