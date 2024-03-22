/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Height } from "../../core/client/v1/client";

export const protobufPackage = "ibc.lightclients.polymer";

/** ClientState represents the local Polymer app state */
export interface ClientState {
  latestHeight?: Height;
}

function createBaseClientState(): ClientState {
  return { latestHeight: undefined };
}

export const ClientState = {
  encode(message: ClientState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.latestHeight !== undefined) {
      Height.encode(message.latestHeight, writer.uint32(10).fork()).ldelim();
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
          message.latestHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ClientState {
    return { latestHeight: isSet(object.latestHeight) ? Height.fromJSON(object.latestHeight) : undefined };
  },

  toJSON(message: ClientState): unknown {
    const obj: any = {};
    message.latestHeight !== undefined &&
      (obj.latestHeight = message.latestHeight ? Height.toJSON(message.latestHeight) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ClientState>, I>>(object: I): ClientState {
    const message = createBaseClientState();
    message.latestHeight = (object.latestHeight !== undefined && object.latestHeight !== null)
      ? Height.fromPartial(object.latestHeight)
      : undefined;
    return message;
  },
};

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
