/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Any } from "../../google/protobuf/any";
import { Acknowledgement, Order, orderFromJSON, orderToJSON, Packet } from "../../ibc/core/channel/v1/channel";
import { Height } from "./client";
import { Proof } from "./proof";

export const protobufPackage = "polyibc.core";

/** MsgCreateClient defines a message to create an poly-IBC client */
export interface MsgCreateClient {
  /** light client state */
  clientState?: Any;
  /**
   * consensus state associated with the client that corresponds to a given
   * height.
   */
  consensusState?: Any;
  /** creator address */
  creator: string;
  /** chain memo contains extra details about the chain */
  chainMemo: string;
}

export interface MsgCreateClientResponse {
  /** the created client id */
  clientId: string;
}

/**
 * MsgUpdateClient defines an sdk.Msg to update a poly-IBC client state using
 * the given header.
 */
export interface MsgUpdateClient {
  /** client unique identifier */
  clientId: string;
  /** header to update the light client */
  header?: Any;
  /** creator address */
  creator: string;
}

/** MsgUpdateClientResponse defines the Msg/UpdateClient response type. */
export interface MsgUpdateClientResponse {
  /** light client type */
  type: string;
  /** header height */
  height?: Height;
}

export interface MsgSendPacket {
  /** Relayer field */
  creator: string;
  /**
   * the standard ibc port is retrieved from the port registry
   * the standard ibc channelID
   * Non-relayer field
   */
  channelID: string;
  /**
   * the standard ibc timeout
   * Non-relayer field
   */
  timeoutTimestamp: string;
  /**
   * contract address on a remote vm (eg. EVM)
   * Non-relayer field
   */
  remoteSenderAddress: Uint8Array;
  /**
   * opaque IBC packet payload
   * Non-relayer field
   */
  payload: Uint8Array;
  /**
   * packet sequence
   * virtual-chain event field
   */
  sequence: string;
  /**
   * Proof of the tx where the IBC packet originates
   * Relayer field
   */
  proof?: Proof;
}

export interface MsgSendPacketResponse {
  /** if request handling failed due to source chain invalid data, success is false and error_message is set */
  success: boolean;
  errorMessage: string;
}

export interface MsgAcknowledgementResponse {
}

export interface MsgCreateVibcClient {
  creator: string;
  /** ID of the existing native client created by MsgCreateClient */
  nativeClientID: string;
  /**
   * vibc client params used by the native client.
   * Processing of the `params` bytes vary by native client type.
   */
  params: Uint8Array;
}

export interface MsgCreateVibcClientResponse {
}

export interface MsgCreateVibcConnection {
  creator: string;
  /** ID of VIBC client */
  vibcClientID: string;
  /** delay period for the connection */
  delayPeriod: string;
}

export interface MsgCreateVibcConnectionResponse {
}

/**
 * MsgOpenIBCChannel defines a message that corresponds to the ChanOpenInit or
 * ChanOpenTry
 */
export interface MsgOpenIBCChannel {
  /**
   * vibc port must conform to poly-IBC port naming convention
   * Non-relayer field
   */
  portId: string;
  /** Non-relayer field */
  version: string;
  /** Non-relayer field */
  ordering: Order;
  /** Non-relayer field */
  connectionHops: string[];
  /** Non-relayer field */
  counterpartyPortId: string;
  /** Non-relayer field */
  counterpartyChannelId: string;
  /**
   * Proof from a virtual chain that proves a user contract did call
   * PolymerCoreSC with exact method name and params
   * Relayer field
   */
  virtualProof?: Proof;
  /**
   * Relayer address
   * Relayer field
   */
  creator: string;
}

export interface MsgOpenIBCChannelResponse {
  channelId: string;
  version: string;
  /** if request handling failed due to source chain invalid data, success is false and error_message is set */
  success: boolean;
  errorMessage: string;
}

/**
 * MsgConnectIBCChannel defines a message that corresponds to the ChanOpenAck or
 * ChanOpenConfirm
 */
export interface MsgConnectIBCChannel {
  /**
   * vibc port must conform to poly-IBC port naming convention
   * Non-relayer field
   */
  portId: string;
  /** Non-relayer field */
  channelId: string;
  /**
   * Proof from a virtual chain that proves a user contract did call
   * PolymerCoreSC with exact method name and params
   * Relayer field
   */
  virtualProof?: Proof;
  /**
   * Relayer address
   * Relayer field
   */
  creator: string;
}

export interface MsgConnectIBCChannelResponse {
  /** if request handling failed due to source chain invalid data, success is false and error_message is set */
  success: boolean;
  errorMessage: string;
}

/** MsgCloseIBCChannel defines a message that corresponds to the ChanCloseInit or ChanCloseConfirm */
export interface MsgCloseIBCChannel {
  /**
   * vibc port must conform to poly-IBC port naming convention
   * Non-relayer field
   */
  portId: string;
  /** Non-relayer field */
  channelId: string;
  /**
   * Proof from a virtual chain that proves a user contract did call
   * PolymerCoreSC with exact method name and params
   * Relayer field
   */
  virtualProof?: Proof;
  /**
   * Relayer address
   * Relayer field
   */
  creator: string;
}

export interface MsgCloseIBCChannelResponse {
  /** if request handling failed due to source chain invalid data, success is false and error_message is set */
  success: boolean;
  errorMessage: string;
}

/**
 * MsgWriteAcknowledgement defines a message that is converted from a virtual
 * chain tx/event when a user contract calls the `writeAcknowledgement` method
 * on PolymerCoreSC in response to a received packet, either synchronously (same
 * tx as receivePacket) or asynchronously (a separate tx after receivePacket).
 */
export interface MsgWriteAcknowledgement {
  packet?: Packet;
  ackPacket?: Acknowledgement;
  /**
   * Proof from a virtual chain that proves a user contract did call
   * PolymerCoreSC with exact method name and params
   */
  virtualProof?: Proof;
  /** Relayer address */
  creator: string;
}

export interface MsgWriteAcknowledgementResponse {
  /** if request handling failed due to source chain invalid data, success is false and error_message is set */
  success: boolean;
  errorMessage: string;
}

export interface MsgWriteTimeout {
  /** Non-relayer field, vibc confirmed timeout pkt's dest_port */
  destinationPort: string;
  /** Non-relayer field, vibc confirmed timeout pkt's dest_channel */
  destinationChannel: string;
  /** Non-relayer field, vibc confirmed timeout sequence */
  sequence: string;
  /** Non-relayer field, original pkt's timeout height requirement */
  pktTimeoutHeight: string;
  /** Non-relayer field, original pkt's timeout timestamp requirement */
  pktTimeoutTimestamp: string;
  /** Relayer field */
  virtualProof?: Proof;
  /** Relayer field */
  creator: string;
}

export interface MsgWriteTimeoutResponse {
  /** if request handling failed due to source chain invalid data, success is false and error_message is set */
  success: boolean;
  errorMessage: string;
}

function createBaseMsgCreateClient(): MsgCreateClient {
  return { clientState: undefined, consensusState: undefined, creator: "", chainMemo: "" };
}

export const MsgCreateClient = {
  encode(message: MsgCreateClient, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientState !== undefined) {
      Any.encode(message.clientState, writer.uint32(10).fork()).ldelim();
    }
    if (message.consensusState !== undefined) {
      Any.encode(message.consensusState, writer.uint32(18).fork()).ldelim();
    }
    if (message.creator !== "") {
      writer.uint32(26).string(message.creator);
    }
    if (message.chainMemo !== "") {
      writer.uint32(34).string(message.chainMemo);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateClient {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateClient();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientState = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.consensusState = Any.decode(reader, reader.uint32());
          break;
        case 3:
          message.creator = reader.string();
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

  fromJSON(object: any): MsgCreateClient {
    return {
      clientState: isSet(object.clientState) ? Any.fromJSON(object.clientState) : undefined,
      consensusState: isSet(object.consensusState) ? Any.fromJSON(object.consensusState) : undefined,
      creator: isSet(object.creator) ? String(object.creator) : "",
      chainMemo: isSet(object.chainMemo) ? String(object.chainMemo) : "",
    };
  },

  toJSON(message: MsgCreateClient): unknown {
    const obj: any = {};
    message.clientState !== undefined &&
      (obj.clientState = message.clientState ? Any.toJSON(message.clientState) : undefined);
    message.consensusState !== undefined &&
      (obj.consensusState = message.consensusState ? Any.toJSON(message.consensusState) : undefined);
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainMemo !== undefined && (obj.chainMemo = message.chainMemo);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateClient>, I>>(object: I): MsgCreateClient {
    const message = createBaseMsgCreateClient();
    message.clientState = (object.clientState !== undefined && object.clientState !== null)
      ? Any.fromPartial(object.clientState)
      : undefined;
    message.consensusState = (object.consensusState !== undefined && object.consensusState !== null)
      ? Any.fromPartial(object.consensusState)
      : undefined;
    message.creator = object.creator ?? "";
    message.chainMemo = object.chainMemo ?? "";
    return message;
  },
};

function createBaseMsgCreateClientResponse(): MsgCreateClientResponse {
  return { clientId: "" };
}

export const MsgCreateClientResponse = {
  encode(message: MsgCreateClientResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateClientResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateClientResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateClientResponse {
    return { clientId: isSet(object.clientId) ? String(object.clientId) : "" };
  },

  toJSON(message: MsgCreateClientResponse): unknown {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateClientResponse>, I>>(object: I): MsgCreateClientResponse {
    const message = createBaseMsgCreateClientResponse();
    message.clientId = object.clientId ?? "";
    return message;
  },
};

function createBaseMsgUpdateClient(): MsgUpdateClient {
  return { clientId: "", header: undefined, creator: "" };
}

export const MsgUpdateClient = {
  encode(message: MsgUpdateClient, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    if (message.header !== undefined) {
      Any.encode(message.header, writer.uint32(18).fork()).ldelim();
    }
    if (message.creator !== "") {
      writer.uint32(26).string(message.creator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateClient {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateClient();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        case 2:
          message.header = Any.decode(reader, reader.uint32());
          break;
        case 3:
          message.creator = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateClient {
    return {
      clientId: isSet(object.clientId) ? String(object.clientId) : "",
      header: isSet(object.header) ? Any.fromJSON(object.header) : undefined,
      creator: isSet(object.creator) ? String(object.creator) : "",
    };
  },

  toJSON(message: MsgUpdateClient): unknown {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    message.header !== undefined && (obj.header = message.header ? Any.toJSON(message.header) : undefined);
    message.creator !== undefined && (obj.creator = message.creator);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateClient>, I>>(object: I): MsgUpdateClient {
    const message = createBaseMsgUpdateClient();
    message.clientId = object.clientId ?? "";
    message.header = (object.header !== undefined && object.header !== null)
      ? Any.fromPartial(object.header)
      : undefined;
    message.creator = object.creator ?? "";
    return message;
  },
};

function createBaseMsgUpdateClientResponse(): MsgUpdateClientResponse {
  return { type: "", height: undefined };
}

export const MsgUpdateClientResponse = {
  encode(message: MsgUpdateClientResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.height !== undefined) {
      Height.encode(message.height, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateClientResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateClientResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;
        case 2:
          message.height = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateClientResponse {
    return {
      type: isSet(object.type) ? String(object.type) : "",
      height: isSet(object.height) ? Height.fromJSON(object.height) : undefined,
    };
  },

  toJSON(message: MsgUpdateClientResponse): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    message.height !== undefined && (obj.height = message.height ? Height.toJSON(message.height) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateClientResponse>, I>>(object: I): MsgUpdateClientResponse {
    const message = createBaseMsgUpdateClientResponse();
    message.type = object.type ?? "";
    message.height = (object.height !== undefined && object.height !== null)
      ? Height.fromPartial(object.height)
      : undefined;
    return message;
  },
};

function createBaseMsgSendPacket(): MsgSendPacket {
  return {
    creator: "",
    channelID: "",
    timeoutTimestamp: "0",
    remoteSenderAddress: new Uint8Array(),
    payload: new Uint8Array(),
    sequence: "0",
    proof: undefined,
  };
}

export const MsgSendPacket = {
  encode(message: MsgSendPacket, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== "") {
      writer.uint32(10).string(message.creator);
    }
    if (message.channelID !== "") {
      writer.uint32(18).string(message.channelID);
    }
    if (message.timeoutTimestamp !== "0") {
      writer.uint32(24).uint64(message.timeoutTimestamp);
    }
    if (message.remoteSenderAddress.length !== 0) {
      writer.uint32(34).bytes(message.remoteSenderAddress);
    }
    if (message.payload.length !== 0) {
      writer.uint32(42).bytes(message.payload);
    }
    if (message.sequence !== "0") {
      writer.uint32(48).uint64(message.sequence);
    }
    if (message.proof !== undefined) {
      Proof.encode(message.proof, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendPacket {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendPacket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.channelID = reader.string();
          break;
        case 3:
          message.timeoutTimestamp = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.remoteSenderAddress = reader.bytes();
          break;
        case 5:
          message.payload = reader.bytes();
          break;
        case 6:
          message.sequence = longToString(reader.uint64() as Long);
          break;
        case 7:
          message.proof = Proof.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSendPacket {
    return {
      creator: isSet(object.creator) ? String(object.creator) : "",
      channelID: isSet(object.channelID) ? String(object.channelID) : "",
      timeoutTimestamp: isSet(object.timeoutTimestamp) ? String(object.timeoutTimestamp) : "0",
      remoteSenderAddress: isSet(object.remoteSenderAddress)
        ? bytesFromBase64(object.remoteSenderAddress)
        : new Uint8Array(),
      payload: isSet(object.payload) ? bytesFromBase64(object.payload) : new Uint8Array(),
      sequence: isSet(object.sequence) ? String(object.sequence) : "0",
      proof: isSet(object.proof) ? Proof.fromJSON(object.proof) : undefined,
    };
  },

  toJSON(message: MsgSendPacket): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.channelID !== undefined && (obj.channelID = message.channelID);
    message.timeoutTimestamp !== undefined && (obj.timeoutTimestamp = message.timeoutTimestamp);
    message.remoteSenderAddress !== undefined &&
      (obj.remoteSenderAddress = base64FromBytes(
        message.remoteSenderAddress !== undefined ? message.remoteSenderAddress : new Uint8Array(),
      ));
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(message.payload !== undefined ? message.payload : new Uint8Array()));
    message.sequence !== undefined && (obj.sequence = message.sequence);
    message.proof !== undefined && (obj.proof = message.proof ? Proof.toJSON(message.proof) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgSendPacket>, I>>(object: I): MsgSendPacket {
    const message = createBaseMsgSendPacket();
    message.creator = object.creator ?? "";
    message.channelID = object.channelID ?? "";
    message.timeoutTimestamp = object.timeoutTimestamp ?? "0";
    message.remoteSenderAddress = object.remoteSenderAddress ?? new Uint8Array();
    message.payload = object.payload ?? new Uint8Array();
    message.sequence = object.sequence ?? "0";
    message.proof = (object.proof !== undefined && object.proof !== null) ? Proof.fromPartial(object.proof) : undefined;
    return message;
  },
};

function createBaseMsgSendPacketResponse(): MsgSendPacketResponse {
  return { success: false, errorMessage: "" };
}

export const MsgSendPacketResponse = {
  encode(message: MsgSendPacketResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    if (message.errorMessage !== "") {
      writer.uint32(18).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendPacketResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendPacketResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        case 2:
          message.errorMessage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSendPacketResponse {
    return {
      success: isSet(object.success) ? Boolean(object.success) : false,
      errorMessage: isSet(object.errorMessage) ? String(object.errorMessage) : "",
    };
  },

  toJSON(message: MsgSendPacketResponse): unknown {
    const obj: any = {};
    message.success !== undefined && (obj.success = message.success);
    message.errorMessage !== undefined && (obj.errorMessage = message.errorMessage);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgSendPacketResponse>, I>>(object: I): MsgSendPacketResponse {
    const message = createBaseMsgSendPacketResponse();
    message.success = object.success ?? false;
    message.errorMessage = object.errorMessage ?? "";
    return message;
  },
};

function createBaseMsgAcknowledgementResponse(): MsgAcknowledgementResponse {
  return {};
}

export const MsgAcknowledgementResponse = {
  encode(_: MsgAcknowledgementResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAcknowledgementResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAcknowledgementResponse();
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

  fromJSON(_: any): MsgAcknowledgementResponse {
    return {};
  },

  toJSON(_: MsgAcknowledgementResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgAcknowledgementResponse>, I>>(_: I): MsgAcknowledgementResponse {
    const message = createBaseMsgAcknowledgementResponse();
    return message;
  },
};

function createBaseMsgCreateVibcClient(): MsgCreateVibcClient {
  return { creator: "", nativeClientID: "", params: new Uint8Array() };
}

export const MsgCreateVibcClient = {
  encode(message: MsgCreateVibcClient, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== "") {
      writer.uint32(10).string(message.creator);
    }
    if (message.nativeClientID !== "") {
      writer.uint32(18).string(message.nativeClientID);
    }
    if (message.params.length !== 0) {
      writer.uint32(26).bytes(message.params);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateVibcClient {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateVibcClient();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.nativeClientID = reader.string();
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

  fromJSON(object: any): MsgCreateVibcClient {
    return {
      creator: isSet(object.creator) ? String(object.creator) : "",
      nativeClientID: isSet(object.nativeClientID) ? String(object.nativeClientID) : "",
      params: isSet(object.params) ? bytesFromBase64(object.params) : new Uint8Array(),
    };
  },

  toJSON(message: MsgCreateVibcClient): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.nativeClientID !== undefined && (obj.nativeClientID = message.nativeClientID);
    message.params !== undefined &&
      (obj.params = base64FromBytes(message.params !== undefined ? message.params : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateVibcClient>, I>>(object: I): MsgCreateVibcClient {
    const message = createBaseMsgCreateVibcClient();
    message.creator = object.creator ?? "";
    message.nativeClientID = object.nativeClientID ?? "";
    message.params = object.params ?? new Uint8Array();
    return message;
  },
};

function createBaseMsgCreateVibcClientResponse(): MsgCreateVibcClientResponse {
  return {};
}

export const MsgCreateVibcClientResponse = {
  encode(_: MsgCreateVibcClientResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateVibcClientResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateVibcClientResponse();
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

  fromJSON(_: any): MsgCreateVibcClientResponse {
    return {};
  },

  toJSON(_: MsgCreateVibcClientResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateVibcClientResponse>, I>>(_: I): MsgCreateVibcClientResponse {
    const message = createBaseMsgCreateVibcClientResponse();
    return message;
  },
};

function createBaseMsgCreateVibcConnection(): MsgCreateVibcConnection {
  return { creator: "", vibcClientID: "", delayPeriod: "0" };
}

export const MsgCreateVibcConnection = {
  encode(message: MsgCreateVibcConnection, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== "") {
      writer.uint32(10).string(message.creator);
    }
    if (message.vibcClientID !== "") {
      writer.uint32(18).string(message.vibcClientID);
    }
    if (message.delayPeriod !== "0") {
      writer.uint32(24).uint64(message.delayPeriod);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateVibcConnection {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateVibcConnection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.vibcClientID = reader.string();
          break;
        case 3:
          message.delayPeriod = longToString(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateVibcConnection {
    return {
      creator: isSet(object.creator) ? String(object.creator) : "",
      vibcClientID: isSet(object.vibcClientID) ? String(object.vibcClientID) : "",
      delayPeriod: isSet(object.delayPeriod) ? String(object.delayPeriod) : "0",
    };
  },

  toJSON(message: MsgCreateVibcConnection): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.vibcClientID !== undefined && (obj.vibcClientID = message.vibcClientID);
    message.delayPeriod !== undefined && (obj.delayPeriod = message.delayPeriod);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateVibcConnection>, I>>(object: I): MsgCreateVibcConnection {
    const message = createBaseMsgCreateVibcConnection();
    message.creator = object.creator ?? "";
    message.vibcClientID = object.vibcClientID ?? "";
    message.delayPeriod = object.delayPeriod ?? "0";
    return message;
  },
};

function createBaseMsgCreateVibcConnectionResponse(): MsgCreateVibcConnectionResponse {
  return {};
}

export const MsgCreateVibcConnectionResponse = {
  encode(_: MsgCreateVibcConnectionResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateVibcConnectionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateVibcConnectionResponse();
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

  fromJSON(_: any): MsgCreateVibcConnectionResponse {
    return {};
  },

  toJSON(_: MsgCreateVibcConnectionResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateVibcConnectionResponse>, I>>(_: I): MsgCreateVibcConnectionResponse {
    const message = createBaseMsgCreateVibcConnectionResponse();
    return message;
  },
};

function createBaseMsgOpenIBCChannel(): MsgOpenIBCChannel {
  return {
    portId: "",
    version: "",
    ordering: 0,
    connectionHops: [],
    counterpartyPortId: "",
    counterpartyChannelId: "",
    virtualProof: undefined,
    creator: "",
  };
}

export const MsgOpenIBCChannel = {
  encode(message: MsgOpenIBCChannel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.portId !== "") {
      writer.uint32(10).string(message.portId);
    }
    if (message.version !== "") {
      writer.uint32(18).string(message.version);
    }
    if (message.ordering !== 0) {
      writer.uint32(24).int32(message.ordering);
    }
    for (const v of message.connectionHops) {
      writer.uint32(34).string(v!);
    }
    if (message.counterpartyPortId !== "") {
      writer.uint32(42).string(message.counterpartyPortId);
    }
    if (message.counterpartyChannelId !== "") {
      writer.uint32(50).string(message.counterpartyChannelId);
    }
    if (message.virtualProof !== undefined) {
      Proof.encode(message.virtualProof, writer.uint32(58).fork()).ldelim();
    }
    if (message.creator !== "") {
      writer.uint32(66).string(message.creator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgOpenIBCChannel {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgOpenIBCChannel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.portId = reader.string();
          break;
        case 2:
          message.version = reader.string();
          break;
        case 3:
          message.ordering = reader.int32() as any;
          break;
        case 4:
          message.connectionHops.push(reader.string());
          break;
        case 5:
          message.counterpartyPortId = reader.string();
          break;
        case 6:
          message.counterpartyChannelId = reader.string();
          break;
        case 7:
          message.virtualProof = Proof.decode(reader, reader.uint32());
          break;
        case 8:
          message.creator = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgOpenIBCChannel {
    return {
      portId: isSet(object.portId) ? String(object.portId) : "",
      version: isSet(object.version) ? String(object.version) : "",
      ordering: isSet(object.ordering) ? orderFromJSON(object.ordering) : 0,
      connectionHops: Array.isArray(object?.connectionHops) ? object.connectionHops.map((e: any) => String(e)) : [],
      counterpartyPortId: isSet(object.counterpartyPortId) ? String(object.counterpartyPortId) : "",
      counterpartyChannelId: isSet(object.counterpartyChannelId) ? String(object.counterpartyChannelId) : "",
      virtualProof: isSet(object.virtualProof) ? Proof.fromJSON(object.virtualProof) : undefined,
      creator: isSet(object.creator) ? String(object.creator) : "",
    };
  },

  toJSON(message: MsgOpenIBCChannel): unknown {
    const obj: any = {};
    message.portId !== undefined && (obj.portId = message.portId);
    message.version !== undefined && (obj.version = message.version);
    message.ordering !== undefined && (obj.ordering = orderToJSON(message.ordering));
    if (message.connectionHops) {
      obj.connectionHops = message.connectionHops.map((e) => e);
    } else {
      obj.connectionHops = [];
    }
    message.counterpartyPortId !== undefined && (obj.counterpartyPortId = message.counterpartyPortId);
    message.counterpartyChannelId !== undefined && (obj.counterpartyChannelId = message.counterpartyChannelId);
    message.virtualProof !== undefined &&
      (obj.virtualProof = message.virtualProof ? Proof.toJSON(message.virtualProof) : undefined);
    message.creator !== undefined && (obj.creator = message.creator);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgOpenIBCChannel>, I>>(object: I): MsgOpenIBCChannel {
    const message = createBaseMsgOpenIBCChannel();
    message.portId = object.portId ?? "";
    message.version = object.version ?? "";
    message.ordering = object.ordering ?? 0;
    message.connectionHops = object.connectionHops?.map((e) => e) || [];
    message.counterpartyPortId = object.counterpartyPortId ?? "";
    message.counterpartyChannelId = object.counterpartyChannelId ?? "";
    message.virtualProof = (object.virtualProof !== undefined && object.virtualProof !== null)
      ? Proof.fromPartial(object.virtualProof)
      : undefined;
    message.creator = object.creator ?? "";
    return message;
  },
};

function createBaseMsgOpenIBCChannelResponse(): MsgOpenIBCChannelResponse {
  return { channelId: "", version: "", success: false, errorMessage: "" };
}

export const MsgOpenIBCChannelResponse = {
  encode(message: MsgOpenIBCChannelResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.channelId !== "") {
      writer.uint32(10).string(message.channelId);
    }
    if (message.version !== "") {
      writer.uint32(18).string(message.version);
    }
    if (message.success === true) {
      writer.uint32(24).bool(message.success);
    }
    if (message.errorMessage !== "") {
      writer.uint32(34).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgOpenIBCChannelResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgOpenIBCChannelResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.channelId = reader.string();
          break;
        case 2:
          message.version = reader.string();
          break;
        case 3:
          message.success = reader.bool();
          break;
        case 4:
          message.errorMessage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgOpenIBCChannelResponse {
    return {
      channelId: isSet(object.channelId) ? String(object.channelId) : "",
      version: isSet(object.version) ? String(object.version) : "",
      success: isSet(object.success) ? Boolean(object.success) : false,
      errorMessage: isSet(object.errorMessage) ? String(object.errorMessage) : "",
    };
  },

  toJSON(message: MsgOpenIBCChannelResponse): unknown {
    const obj: any = {};
    message.channelId !== undefined && (obj.channelId = message.channelId);
    message.version !== undefined && (obj.version = message.version);
    message.success !== undefined && (obj.success = message.success);
    message.errorMessage !== undefined && (obj.errorMessage = message.errorMessage);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgOpenIBCChannelResponse>, I>>(object: I): MsgOpenIBCChannelResponse {
    const message = createBaseMsgOpenIBCChannelResponse();
    message.channelId = object.channelId ?? "";
    message.version = object.version ?? "";
    message.success = object.success ?? false;
    message.errorMessage = object.errorMessage ?? "";
    return message;
  },
};

function createBaseMsgConnectIBCChannel(): MsgConnectIBCChannel {
  return { portId: "", channelId: "", virtualProof: undefined, creator: "" };
}

export const MsgConnectIBCChannel = {
  encode(message: MsgConnectIBCChannel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.portId !== "") {
      writer.uint32(10).string(message.portId);
    }
    if (message.channelId !== "") {
      writer.uint32(18).string(message.channelId);
    }
    if (message.virtualProof !== undefined) {
      Proof.encode(message.virtualProof, writer.uint32(26).fork()).ldelim();
    }
    if (message.creator !== "") {
      writer.uint32(34).string(message.creator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgConnectIBCChannel {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgConnectIBCChannel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.portId = reader.string();
          break;
        case 2:
          message.channelId = reader.string();
          break;
        case 3:
          message.virtualProof = Proof.decode(reader, reader.uint32());
          break;
        case 4:
          message.creator = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgConnectIBCChannel {
    return {
      portId: isSet(object.portId) ? String(object.portId) : "",
      channelId: isSet(object.channelId) ? String(object.channelId) : "",
      virtualProof: isSet(object.virtualProof) ? Proof.fromJSON(object.virtualProof) : undefined,
      creator: isSet(object.creator) ? String(object.creator) : "",
    };
  },

  toJSON(message: MsgConnectIBCChannel): unknown {
    const obj: any = {};
    message.portId !== undefined && (obj.portId = message.portId);
    message.channelId !== undefined && (obj.channelId = message.channelId);
    message.virtualProof !== undefined &&
      (obj.virtualProof = message.virtualProof ? Proof.toJSON(message.virtualProof) : undefined);
    message.creator !== undefined && (obj.creator = message.creator);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgConnectIBCChannel>, I>>(object: I): MsgConnectIBCChannel {
    const message = createBaseMsgConnectIBCChannel();
    message.portId = object.portId ?? "";
    message.channelId = object.channelId ?? "";
    message.virtualProof = (object.virtualProof !== undefined && object.virtualProof !== null)
      ? Proof.fromPartial(object.virtualProof)
      : undefined;
    message.creator = object.creator ?? "";
    return message;
  },
};

function createBaseMsgConnectIBCChannelResponse(): MsgConnectIBCChannelResponse {
  return { success: false, errorMessage: "" };
}

export const MsgConnectIBCChannelResponse = {
  encode(message: MsgConnectIBCChannelResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    if (message.errorMessage !== "") {
      writer.uint32(18).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgConnectIBCChannelResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgConnectIBCChannelResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        case 2:
          message.errorMessage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgConnectIBCChannelResponse {
    return {
      success: isSet(object.success) ? Boolean(object.success) : false,
      errorMessage: isSet(object.errorMessage) ? String(object.errorMessage) : "",
    };
  },

  toJSON(message: MsgConnectIBCChannelResponse): unknown {
    const obj: any = {};
    message.success !== undefined && (obj.success = message.success);
    message.errorMessage !== undefined && (obj.errorMessage = message.errorMessage);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgConnectIBCChannelResponse>, I>>(object: I): MsgConnectIBCChannelResponse {
    const message = createBaseMsgConnectIBCChannelResponse();
    message.success = object.success ?? false;
    message.errorMessage = object.errorMessage ?? "";
    return message;
  },
};

function createBaseMsgCloseIBCChannel(): MsgCloseIBCChannel {
  return { portId: "", channelId: "", virtualProof: undefined, creator: "" };
}

export const MsgCloseIBCChannel = {
  encode(message: MsgCloseIBCChannel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.portId !== "") {
      writer.uint32(10).string(message.portId);
    }
    if (message.channelId !== "") {
      writer.uint32(18).string(message.channelId);
    }
    if (message.virtualProof !== undefined) {
      Proof.encode(message.virtualProof, writer.uint32(26).fork()).ldelim();
    }
    if (message.creator !== "") {
      writer.uint32(34).string(message.creator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCloseIBCChannel {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCloseIBCChannel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.portId = reader.string();
          break;
        case 2:
          message.channelId = reader.string();
          break;
        case 3:
          message.virtualProof = Proof.decode(reader, reader.uint32());
          break;
        case 4:
          message.creator = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCloseIBCChannel {
    return {
      portId: isSet(object.portId) ? String(object.portId) : "",
      channelId: isSet(object.channelId) ? String(object.channelId) : "",
      virtualProof: isSet(object.virtualProof) ? Proof.fromJSON(object.virtualProof) : undefined,
      creator: isSet(object.creator) ? String(object.creator) : "",
    };
  },

  toJSON(message: MsgCloseIBCChannel): unknown {
    const obj: any = {};
    message.portId !== undefined && (obj.portId = message.portId);
    message.channelId !== undefined && (obj.channelId = message.channelId);
    message.virtualProof !== undefined &&
      (obj.virtualProof = message.virtualProof ? Proof.toJSON(message.virtualProof) : undefined);
    message.creator !== undefined && (obj.creator = message.creator);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCloseIBCChannel>, I>>(object: I): MsgCloseIBCChannel {
    const message = createBaseMsgCloseIBCChannel();
    message.portId = object.portId ?? "";
    message.channelId = object.channelId ?? "";
    message.virtualProof = (object.virtualProof !== undefined && object.virtualProof !== null)
      ? Proof.fromPartial(object.virtualProof)
      : undefined;
    message.creator = object.creator ?? "";
    return message;
  },
};

function createBaseMsgCloseIBCChannelResponse(): MsgCloseIBCChannelResponse {
  return { success: false, errorMessage: "" };
}

export const MsgCloseIBCChannelResponse = {
  encode(message: MsgCloseIBCChannelResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    if (message.errorMessage !== "") {
      writer.uint32(18).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCloseIBCChannelResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCloseIBCChannelResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        case 2:
          message.errorMessage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCloseIBCChannelResponse {
    return {
      success: isSet(object.success) ? Boolean(object.success) : false,
      errorMessage: isSet(object.errorMessage) ? String(object.errorMessage) : "",
    };
  },

  toJSON(message: MsgCloseIBCChannelResponse): unknown {
    const obj: any = {};
    message.success !== undefined && (obj.success = message.success);
    message.errorMessage !== undefined && (obj.errorMessage = message.errorMessage);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCloseIBCChannelResponse>, I>>(object: I): MsgCloseIBCChannelResponse {
    const message = createBaseMsgCloseIBCChannelResponse();
    message.success = object.success ?? false;
    message.errorMessage = object.errorMessage ?? "";
    return message;
  },
};

function createBaseMsgWriteAcknowledgement(): MsgWriteAcknowledgement {
  return { packet: undefined, ackPacket: undefined, virtualProof: undefined, creator: "" };
}

export const MsgWriteAcknowledgement = {
  encode(message: MsgWriteAcknowledgement, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.packet !== undefined) {
      Packet.encode(message.packet, writer.uint32(10).fork()).ldelim();
    }
    if (message.ackPacket !== undefined) {
      Acknowledgement.encode(message.ackPacket, writer.uint32(18).fork()).ldelim();
    }
    if (message.virtualProof !== undefined) {
      Proof.encode(message.virtualProof, writer.uint32(26).fork()).ldelim();
    }
    if (message.creator !== "") {
      writer.uint32(34).string(message.creator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWriteAcknowledgement {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWriteAcknowledgement();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.packet = Packet.decode(reader, reader.uint32());
          break;
        case 2:
          message.ackPacket = Acknowledgement.decode(reader, reader.uint32());
          break;
        case 3:
          message.virtualProof = Proof.decode(reader, reader.uint32());
          break;
        case 4:
          message.creator = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgWriteAcknowledgement {
    return {
      packet: isSet(object.packet) ? Packet.fromJSON(object.packet) : undefined,
      ackPacket: isSet(object.ackPacket) ? Acknowledgement.fromJSON(object.ackPacket) : undefined,
      virtualProof: isSet(object.virtualProof) ? Proof.fromJSON(object.virtualProof) : undefined,
      creator: isSet(object.creator) ? String(object.creator) : "",
    };
  },

  toJSON(message: MsgWriteAcknowledgement): unknown {
    const obj: any = {};
    message.packet !== undefined && (obj.packet = message.packet ? Packet.toJSON(message.packet) : undefined);
    message.ackPacket !== undefined &&
      (obj.ackPacket = message.ackPacket ? Acknowledgement.toJSON(message.ackPacket) : undefined);
    message.virtualProof !== undefined &&
      (obj.virtualProof = message.virtualProof ? Proof.toJSON(message.virtualProof) : undefined);
    message.creator !== undefined && (obj.creator = message.creator);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgWriteAcknowledgement>, I>>(object: I): MsgWriteAcknowledgement {
    const message = createBaseMsgWriteAcknowledgement();
    message.packet = (object.packet !== undefined && object.packet !== null)
      ? Packet.fromPartial(object.packet)
      : undefined;
    message.ackPacket = (object.ackPacket !== undefined && object.ackPacket !== null)
      ? Acknowledgement.fromPartial(object.ackPacket)
      : undefined;
    message.virtualProof = (object.virtualProof !== undefined && object.virtualProof !== null)
      ? Proof.fromPartial(object.virtualProof)
      : undefined;
    message.creator = object.creator ?? "";
    return message;
  },
};

function createBaseMsgWriteAcknowledgementResponse(): MsgWriteAcknowledgementResponse {
  return { success: false, errorMessage: "" };
}

export const MsgWriteAcknowledgementResponse = {
  encode(message: MsgWriteAcknowledgementResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    if (message.errorMessage !== "") {
      writer.uint32(18).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWriteAcknowledgementResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWriteAcknowledgementResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        case 2:
          message.errorMessage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgWriteAcknowledgementResponse {
    return {
      success: isSet(object.success) ? Boolean(object.success) : false,
      errorMessage: isSet(object.errorMessage) ? String(object.errorMessage) : "",
    };
  },

  toJSON(message: MsgWriteAcknowledgementResponse): unknown {
    const obj: any = {};
    message.success !== undefined && (obj.success = message.success);
    message.errorMessage !== undefined && (obj.errorMessage = message.errorMessage);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgWriteAcknowledgementResponse>, I>>(
    object: I,
  ): MsgWriteAcknowledgementResponse {
    const message = createBaseMsgWriteAcknowledgementResponse();
    message.success = object.success ?? false;
    message.errorMessage = object.errorMessage ?? "";
    return message;
  },
};

function createBaseMsgWriteTimeout(): MsgWriteTimeout {
  return {
    destinationPort: "",
    destinationChannel: "",
    sequence: "0",
    pktTimeoutHeight: "0",
    pktTimeoutTimestamp: "0",
    virtualProof: undefined,
    creator: "",
  };
}

export const MsgWriteTimeout = {
  encode(message: MsgWriteTimeout, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.destinationPort !== "") {
      writer.uint32(10).string(message.destinationPort);
    }
    if (message.destinationChannel !== "") {
      writer.uint32(18).string(message.destinationChannel);
    }
    if (message.sequence !== "0") {
      writer.uint32(24).uint64(message.sequence);
    }
    if (message.pktTimeoutHeight !== "0") {
      writer.uint32(32).uint64(message.pktTimeoutHeight);
    }
    if (message.pktTimeoutTimestamp !== "0") {
      writer.uint32(40).uint64(message.pktTimeoutTimestamp);
    }
    if (message.virtualProof !== undefined) {
      Proof.encode(message.virtualProof, writer.uint32(50).fork()).ldelim();
    }
    if (message.creator !== "") {
      writer.uint32(58).string(message.creator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWriteTimeout {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWriteTimeout();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.destinationPort = reader.string();
          break;
        case 2:
          message.destinationChannel = reader.string();
          break;
        case 3:
          message.sequence = longToString(reader.uint64() as Long);
          break;
        case 4:
          message.pktTimeoutHeight = longToString(reader.uint64() as Long);
          break;
        case 5:
          message.pktTimeoutTimestamp = longToString(reader.uint64() as Long);
          break;
        case 6:
          message.virtualProof = Proof.decode(reader, reader.uint32());
          break;
        case 7:
          message.creator = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgWriteTimeout {
    return {
      destinationPort: isSet(object.destinationPort) ? String(object.destinationPort) : "",
      destinationChannel: isSet(object.destinationChannel) ? String(object.destinationChannel) : "",
      sequence: isSet(object.sequence) ? String(object.sequence) : "0",
      pktTimeoutHeight: isSet(object.pktTimeoutHeight) ? String(object.pktTimeoutHeight) : "0",
      pktTimeoutTimestamp: isSet(object.pktTimeoutTimestamp) ? String(object.pktTimeoutTimestamp) : "0",
      virtualProof: isSet(object.virtualProof) ? Proof.fromJSON(object.virtualProof) : undefined,
      creator: isSet(object.creator) ? String(object.creator) : "",
    };
  },

  toJSON(message: MsgWriteTimeout): unknown {
    const obj: any = {};
    message.destinationPort !== undefined && (obj.destinationPort = message.destinationPort);
    message.destinationChannel !== undefined && (obj.destinationChannel = message.destinationChannel);
    message.sequence !== undefined && (obj.sequence = message.sequence);
    message.pktTimeoutHeight !== undefined && (obj.pktTimeoutHeight = message.pktTimeoutHeight);
    message.pktTimeoutTimestamp !== undefined && (obj.pktTimeoutTimestamp = message.pktTimeoutTimestamp);
    message.virtualProof !== undefined &&
      (obj.virtualProof = message.virtualProof ? Proof.toJSON(message.virtualProof) : undefined);
    message.creator !== undefined && (obj.creator = message.creator);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgWriteTimeout>, I>>(object: I): MsgWriteTimeout {
    const message = createBaseMsgWriteTimeout();
    message.destinationPort = object.destinationPort ?? "";
    message.destinationChannel = object.destinationChannel ?? "";
    message.sequence = object.sequence ?? "0";
    message.pktTimeoutHeight = object.pktTimeoutHeight ?? "0";
    message.pktTimeoutTimestamp = object.pktTimeoutTimestamp ?? "0";
    message.virtualProof = (object.virtualProof !== undefined && object.virtualProof !== null)
      ? Proof.fromPartial(object.virtualProof)
      : undefined;
    message.creator = object.creator ?? "";
    return message;
  },
};

function createBaseMsgWriteTimeoutResponse(): MsgWriteTimeoutResponse {
  return { success: false, errorMessage: "" };
}

export const MsgWriteTimeoutResponse = {
  encode(message: MsgWriteTimeoutResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    if (message.errorMessage !== "") {
      writer.uint32(18).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWriteTimeoutResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWriteTimeoutResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        case 2:
          message.errorMessage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgWriteTimeoutResponse {
    return {
      success: isSet(object.success) ? Boolean(object.success) : false,
      errorMessage: isSet(object.errorMessage) ? String(object.errorMessage) : "",
    };
  },

  toJSON(message: MsgWriteTimeoutResponse): unknown {
    const obj: any = {};
    message.success !== undefined && (obj.success = message.success);
    message.errorMessage !== undefined && (obj.errorMessage = message.errorMessage);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgWriteTimeoutResponse>, I>>(object: I): MsgWriteTimeoutResponse {
    const message = createBaseMsgWriteTimeoutResponse();
    message.success = object.success ?? false;
    message.errorMessage = object.errorMessage ?? "";
    return message;
  },
};

/** Msg defines the Msg service. */
export interface Msg {
  /**
   * CreateClient creates a new native light client. All client types share the
   * endpoint and msg type. Msg payload determines the client type.
   */
  CreateClient(request: MsgCreateClient): Promise<MsgCreateClientResponse>;
  /** UpdateClient updates an existing native light client with a new header. */
  UpdateClient(request: MsgUpdateClient): Promise<MsgUpdateClientResponse>;
  /** SendPacket defines an RPC handler method for MsgSendPacket */
  SendPacket(request: MsgSendPacket): Promise<MsgSendPacketResponse>;
  /**
   * CreateVibcClient creates a virtual IBC client that wraps an existing native
   * client
   */
  CreateVibcClient(request: MsgCreateVibcClient): Promise<MsgCreateVibcClientResponse>;
  /**
   * CreateVibcConnection creates a virtual IBC connection between the specified
   * vibc client and Polymer client
   */
  CreateVibcConnection(request: MsgCreateVibcConnection): Promise<MsgCreateVibcConnectionResponse>;
  /**
   * OpenIBCChannel relays contract call on virtual chains. It's equivalent to
   * ChanOpenInit or ChanOpenTry depending on the counterparty channel state.
   */
  OpenIBCChannel(request: MsgOpenIBCChannel): Promise<MsgOpenIBCChannelResponse>;
  /**
   * ConnectIBCChannel relays contract call on virtual chains. It's equivalent
   * to ChanOpenAck or ChanOpenConfirm depending on the counterparty channel
   * state.
   */
  ConnectIBCChannel(request: MsgConnectIBCChannel): Promise<MsgConnectIBCChannelResponse>;
  /**
   * CloseIBCChnanel relays contract call on virtual chains. It's equivalent
   * to ChanCloseInit or ChanCloseConfirm depending on channel status.
   */
  CloseIBCChannel(request: MsgCloseIBCChannel): Promise<MsgCloseIBCChannelResponse>;
  /**
   * WriteAcknowledgement writes an acknowledgement to the specified channel.
   * Relayer calls this method after receiving an acknowledgement from
   * PolymerCoreSC on a virtual chain.
   */
  WriteAcknowledgement(request: MsgWriteAcknowledgement): Promise<MsgWriteAcknowledgementResponse>;
  /**
   * WriteTimeout writes a timeout to a specific pkt.
   * Relayer calls this method after receiving a `writeTimeout` event from vIBC core SC on remote chain.
   */
  WriteTimeout(request: MsgWriteTimeout): Promise<MsgWriteTimeoutResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "polyibc.core.Msg";
    this.rpc = rpc;
    this.CreateClient = this.CreateClient.bind(this);
    this.UpdateClient = this.UpdateClient.bind(this);
    this.SendPacket = this.SendPacket.bind(this);
    this.CreateVibcClient = this.CreateVibcClient.bind(this);
    this.CreateVibcConnection = this.CreateVibcConnection.bind(this);
    this.OpenIBCChannel = this.OpenIBCChannel.bind(this);
    this.ConnectIBCChannel = this.ConnectIBCChannel.bind(this);
    this.CloseIBCChannel = this.CloseIBCChannel.bind(this);
    this.WriteAcknowledgement = this.WriteAcknowledgement.bind(this);
    this.WriteTimeout = this.WriteTimeout.bind(this);
  }
  CreateClient(request: MsgCreateClient): Promise<MsgCreateClientResponse> {
    const data = MsgCreateClient.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreateClient", data);
    return promise.then((data) => MsgCreateClientResponse.decode(new _m0.Reader(data)));
  }

  UpdateClient(request: MsgUpdateClient): Promise<MsgUpdateClientResponse> {
    const data = MsgUpdateClient.encode(request).finish();
    const promise = this.rpc.request(this.service, "UpdateClient", data);
    return promise.then((data) => MsgUpdateClientResponse.decode(new _m0.Reader(data)));
  }

  SendPacket(request: MsgSendPacket): Promise<MsgSendPacketResponse> {
    const data = MsgSendPacket.encode(request).finish();
    const promise = this.rpc.request(this.service, "SendPacket", data);
    return promise.then((data) => MsgSendPacketResponse.decode(new _m0.Reader(data)));
  }

  CreateVibcClient(request: MsgCreateVibcClient): Promise<MsgCreateVibcClientResponse> {
    const data = MsgCreateVibcClient.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreateVibcClient", data);
    return promise.then((data) => MsgCreateVibcClientResponse.decode(new _m0.Reader(data)));
  }

  CreateVibcConnection(request: MsgCreateVibcConnection): Promise<MsgCreateVibcConnectionResponse> {
    const data = MsgCreateVibcConnection.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreateVibcConnection", data);
    return promise.then((data) => MsgCreateVibcConnectionResponse.decode(new _m0.Reader(data)));
  }

  OpenIBCChannel(request: MsgOpenIBCChannel): Promise<MsgOpenIBCChannelResponse> {
    const data = MsgOpenIBCChannel.encode(request).finish();
    const promise = this.rpc.request(this.service, "OpenIBCChannel", data);
    return promise.then((data) => MsgOpenIBCChannelResponse.decode(new _m0.Reader(data)));
  }

  ConnectIBCChannel(request: MsgConnectIBCChannel): Promise<MsgConnectIBCChannelResponse> {
    const data = MsgConnectIBCChannel.encode(request).finish();
    const promise = this.rpc.request(this.service, "ConnectIBCChannel", data);
    return promise.then((data) => MsgConnectIBCChannelResponse.decode(new _m0.Reader(data)));
  }

  CloseIBCChannel(request: MsgCloseIBCChannel): Promise<MsgCloseIBCChannelResponse> {
    const data = MsgCloseIBCChannel.encode(request).finish();
    const promise = this.rpc.request(this.service, "CloseIBCChannel", data);
    return promise.then((data) => MsgCloseIBCChannelResponse.decode(new _m0.Reader(data)));
  }

  WriteAcknowledgement(request: MsgWriteAcknowledgement): Promise<MsgWriteAcknowledgementResponse> {
    const data = MsgWriteAcknowledgement.encode(request).finish();
    const promise = this.rpc.request(this.service, "WriteAcknowledgement", data);
    return promise.then((data) => MsgWriteAcknowledgementResponse.decode(new _m0.Reader(data)));
  }

  WriteTimeout(request: MsgWriteTimeout): Promise<MsgWriteTimeoutResponse> {
    const data = MsgWriteTimeout.encode(request).finish();
    const promise = this.rpc.request(this.service, "WriteTimeout", data);
    return promise.then((data) => MsgWriteTimeoutResponse.decode(new _m0.Reader(data)));
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
