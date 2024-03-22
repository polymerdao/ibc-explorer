/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Height } from "../../core/client";
import { StorageProof } from "./proof";

export const protobufPackage = "polyibc.lightclients.opstackv2";

/** ClientState from Optimism */
export interface ClientState {
  chainId: string;
  latestHeight?: Height;
  chainMemo: string;
  /**
   * OP-stack is an L2 and is dependent on the eth L1 client.
   * Dependent client IDs are always specified as virtual client IDs.
   */
  dependentClientIds: string[];
  /** The DisputeGameFactory contract addr is fixed on a per client basis. */
  disputeGameFactoryAddr: Uint8Array;
  dispatcherAddr: Uint8Array;
}

/**
 * ConsensusStateWithProofs defines the consensus state with proof info for initialization.
 * This is passed in for the init message, but plain consensusState is the one actually persisted.
 */
export interface ConsensusStateWithProofs {
  state?: ConsensusState;
  proof?: StorageProof;
  rawL1Header: Uint8Array;
}

/** ConsensusState defines the consensus state from OP-stack. */
export interface ConsensusState {
  /** l2_block_number and output_root are properties of the L2 block */
  l2BlockNumber: string;
  rootClaim: Uint8Array;
  /**
   * The L2 header is expected to match the output root.
   * It's combined with the withdrawal root to produce the output root.
   */
  rawL2Header: Uint8Array;
  /**
   * withdrawal_root is the account storage root of the `L2ToL1MessagePasser` contract
   * this contract proxy has a fixed deployment at 0x4200000000000000000000000000000000000016
   */
  withdrawalRoot: Uint8Array;
  gameType: number;
  proxyAddr: Uint8Array;
}

/**
 * Header is the `ConsensusUpdate` message from ETH2 full nodes relayed by relayers.
 *    - The name `Header` is used in order to be compatible general interface
 *    - It encapsulates `raw_header`s which are L2 rollup headers
 *    - It also encapsulates a consensus state with proofs that forms trusted checkpoints
 */
export interface Header {
  /**
   * The consensus state update is an L2 checkpoint on the L1.
   * This is processed first.
   */
  update?: ConsensusStateWithProofs;
}

function createBaseClientState(): ClientState {
  return {
    chainId: "",
    latestHeight: undefined,
    chainMemo: "",
    dependentClientIds: [],
    disputeGameFactoryAddr: new Uint8Array(),
    dispatcherAddr: new Uint8Array(),
  };
}

export const ClientState = {
  encode(message: ClientState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chainId !== "") {
      writer.uint32(10).string(message.chainId);
    }
    if (message.latestHeight !== undefined) {
      Height.encode(message.latestHeight, writer.uint32(18).fork()).ldelim();
    }
    if (message.chainMemo !== "") {
      writer.uint32(26).string(message.chainMemo);
    }
    for (const v of message.dependentClientIds) {
      writer.uint32(34).string(v!);
    }
    if (message.disputeGameFactoryAddr.length !== 0) {
      writer.uint32(42).bytes(message.disputeGameFactoryAddr);
    }
    if (message.dispatcherAddr.length !== 0) {
      writer.uint32(50).bytes(message.dispatcherAddr);
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
        case 2:
          message.latestHeight = Height.decode(reader, reader.uint32());
          break;
        case 3:
          message.chainMemo = reader.string();
          break;
        case 4:
          message.dependentClientIds.push(reader.string());
          break;
        case 5:
          message.disputeGameFactoryAddr = reader.bytes();
          break;
        case 6:
          message.dispatcherAddr = reader.bytes();
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
      chainMemo: isSet(object.chainMemo) ? String(object.chainMemo) : "",
      dependentClientIds: Array.isArray(object?.dependentClientIds)
        ? object.dependentClientIds.map((e: any) => String(e))
        : [],
      disputeGameFactoryAddr: isSet(object.disputeGameFactoryAddr)
        ? bytesFromBase64(object.disputeGameFactoryAddr)
        : new Uint8Array(),
      dispatcherAddr: isSet(object.dispatcherAddr) ? bytesFromBase64(object.dispatcherAddr) : new Uint8Array(),
    };
  },

  toJSON(message: ClientState): unknown {
    const obj: any = {};
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.latestHeight !== undefined &&
      (obj.latestHeight = message.latestHeight ? Height.toJSON(message.latestHeight) : undefined);
    message.chainMemo !== undefined && (obj.chainMemo = message.chainMemo);
    if (message.dependentClientIds) {
      obj.dependentClientIds = message.dependentClientIds.map((e) => e);
    } else {
      obj.dependentClientIds = [];
    }
    message.disputeGameFactoryAddr !== undefined &&
      (obj.disputeGameFactoryAddr = base64FromBytes(
        message.disputeGameFactoryAddr !== undefined ? message.disputeGameFactoryAddr : new Uint8Array(),
      ));
    message.dispatcherAddr !== undefined &&
      (obj.dispatcherAddr = base64FromBytes(
        message.dispatcherAddr !== undefined ? message.dispatcherAddr : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ClientState>, I>>(object: I): ClientState {
    const message = createBaseClientState();
    message.chainId = object.chainId ?? "";
    message.latestHeight = (object.latestHeight !== undefined && object.latestHeight !== null)
      ? Height.fromPartial(object.latestHeight)
      : undefined;
    message.chainMemo = object.chainMemo ?? "";
    message.dependentClientIds = object.dependentClientIds?.map((e) => e) || [];
    message.disputeGameFactoryAddr = object.disputeGameFactoryAddr ?? new Uint8Array();
    message.dispatcherAddr = object.dispatcherAddr ?? new Uint8Array();
    return message;
  },
};

function createBaseConsensusStateWithProofs(): ConsensusStateWithProofs {
  return { state: undefined, proof: undefined, rawL1Header: new Uint8Array() };
}

export const ConsensusStateWithProofs = {
  encode(message: ConsensusStateWithProofs, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.state !== undefined) {
      ConsensusState.encode(message.state, writer.uint32(10).fork()).ldelim();
    }
    if (message.proof !== undefined) {
      StorageProof.encode(message.proof, writer.uint32(18).fork()).ldelim();
    }
    if (message.rawL1Header.length !== 0) {
      writer.uint32(26).bytes(message.rawL1Header);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ConsensusStateWithProofs {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConsensusStateWithProofs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.state = ConsensusState.decode(reader, reader.uint32());
          break;
        case 2:
          message.proof = StorageProof.decode(reader, reader.uint32());
          break;
        case 3:
          message.rawL1Header = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ConsensusStateWithProofs {
    return {
      state: isSet(object.state) ? ConsensusState.fromJSON(object.state) : undefined,
      proof: isSet(object.proof) ? StorageProof.fromJSON(object.proof) : undefined,
      rawL1Header: isSet(object.rawL1Header) ? bytesFromBase64(object.rawL1Header) : new Uint8Array(),
    };
  },

  toJSON(message: ConsensusStateWithProofs): unknown {
    const obj: any = {};
    message.state !== undefined && (obj.state = message.state ? ConsensusState.toJSON(message.state) : undefined);
    message.proof !== undefined && (obj.proof = message.proof ? StorageProof.toJSON(message.proof) : undefined);
    message.rawL1Header !== undefined &&
      (obj.rawL1Header = base64FromBytes(message.rawL1Header !== undefined ? message.rawL1Header : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ConsensusStateWithProofs>, I>>(object: I): ConsensusStateWithProofs {
    const message = createBaseConsensusStateWithProofs();
    message.state = (object.state !== undefined && object.state !== null)
      ? ConsensusState.fromPartial(object.state)
      : undefined;
    message.proof = (object.proof !== undefined && object.proof !== null)
      ? StorageProof.fromPartial(object.proof)
      : undefined;
    message.rawL1Header = object.rawL1Header ?? new Uint8Array();
    return message;
  },
};

function createBaseConsensusState(): ConsensusState {
  return {
    l2BlockNumber: "0",
    rootClaim: new Uint8Array(),
    rawL2Header: new Uint8Array(),
    withdrawalRoot: new Uint8Array(),
    gameType: 0,
    proxyAddr: new Uint8Array(),
  };
}

export const ConsensusState = {
  encode(message: ConsensusState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.l2BlockNumber !== "0") {
      writer.uint32(8).uint64(message.l2BlockNumber);
    }
    if (message.rootClaim.length !== 0) {
      writer.uint32(18).bytes(message.rootClaim);
    }
    if (message.rawL2Header.length !== 0) {
      writer.uint32(26).bytes(message.rawL2Header);
    }
    if (message.withdrawalRoot.length !== 0) {
      writer.uint32(34).bytes(message.withdrawalRoot);
    }
    if (message.gameType !== 0) {
      writer.uint32(40).uint32(message.gameType);
    }
    if (message.proxyAddr.length !== 0) {
      writer.uint32(50).bytes(message.proxyAddr);
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
          message.l2BlockNumber = longToString(reader.uint64() as Long);
          break;
        case 2:
          message.rootClaim = reader.bytes();
          break;
        case 3:
          message.rawL2Header = reader.bytes();
          break;
        case 4:
          message.withdrawalRoot = reader.bytes();
          break;
        case 5:
          message.gameType = reader.uint32();
          break;
        case 6:
          message.proxyAddr = reader.bytes();
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
      l2BlockNumber: isSet(object.l2BlockNumber) ? String(object.l2BlockNumber) : "0",
      rootClaim: isSet(object.rootClaim) ? bytesFromBase64(object.rootClaim) : new Uint8Array(),
      rawL2Header: isSet(object.rawL2Header) ? bytesFromBase64(object.rawL2Header) : new Uint8Array(),
      withdrawalRoot: isSet(object.withdrawalRoot) ? bytesFromBase64(object.withdrawalRoot) : new Uint8Array(),
      gameType: isSet(object.gameType) ? Number(object.gameType) : 0,
      proxyAddr: isSet(object.proxyAddr) ? bytesFromBase64(object.proxyAddr) : new Uint8Array(),
    };
  },

  toJSON(message: ConsensusState): unknown {
    const obj: any = {};
    message.l2BlockNumber !== undefined && (obj.l2BlockNumber = message.l2BlockNumber);
    message.rootClaim !== undefined &&
      (obj.rootClaim = base64FromBytes(message.rootClaim !== undefined ? message.rootClaim : new Uint8Array()));
    message.rawL2Header !== undefined &&
      (obj.rawL2Header = base64FromBytes(message.rawL2Header !== undefined ? message.rawL2Header : new Uint8Array()));
    message.withdrawalRoot !== undefined &&
      (obj.withdrawalRoot = base64FromBytes(
        message.withdrawalRoot !== undefined ? message.withdrawalRoot : new Uint8Array(),
      ));
    message.gameType !== undefined && (obj.gameType = Math.round(message.gameType));
    message.proxyAddr !== undefined &&
      (obj.proxyAddr = base64FromBytes(message.proxyAddr !== undefined ? message.proxyAddr : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ConsensusState>, I>>(object: I): ConsensusState {
    const message = createBaseConsensusState();
    message.l2BlockNumber = object.l2BlockNumber ?? "0";
    message.rootClaim = object.rootClaim ?? new Uint8Array();
    message.rawL2Header = object.rawL2Header ?? new Uint8Array();
    message.withdrawalRoot = object.withdrawalRoot ?? new Uint8Array();
    message.gameType = object.gameType ?? 0;
    message.proxyAddr = object.proxyAddr ?? new Uint8Array();
    return message;
  },
};

function createBaseHeader(): Header {
  return { update: undefined };
}

export const Header = {
  encode(message: Header, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.update !== undefined) {
      ConsensusStateWithProofs.encode(message.update, writer.uint32(10).fork()).ldelim();
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
          message.update = ConsensusStateWithProofs.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Header {
    return { update: isSet(object.update) ? ConsensusStateWithProofs.fromJSON(object.update) : undefined };
  },

  toJSON(message: Header): unknown {
    const obj: any = {};
    message.update !== undefined &&
      (obj.update = message.update ? ConsensusStateWithProofs.toJSON(message.update) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Header>, I>>(object: I): Header {
    const message = createBaseHeader();
    message.update = (object.update !== undefined && object.update !== null)
      ? ConsensusStateWithProofs.fromPartial(object.update)
      : undefined;
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
