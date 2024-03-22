/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { PageRequest, PageResponse } from "../../cosmos/base/query/v1beta1/pagination";
import { Height, IdentifiedClientState, QueryConsensusStateRequest, QueryConsensusStateResponse } from "./client";
import { Params } from "./params";

export const protobufPackage = "polyibc.core";

/**
 * PrepareSendConsensusUpdateRequest is request type for the PrepareSendConsensusUpdate RPC method.
 * It is used to query if light client is good to accept a update immeidately
 * There are 3 cases:
 *   1. Can update immediately
 *   2. Can not update, and no clue.  This indicates a fatal
 *   3. Can not update, and provided clues.  Relayer then can use this clue to satisfy the preconditions.
 */
export interface PrepareSendConsensusUpdateRequest {
  clientId: string;
  height?: Height;
  updateBytes: Uint8Array;
}

export interface PrepareSendConsensusUpdateResponse {
  canUpdate: boolean;
  additionalClues: Uint8Array;
}

/**
 * GetLastFinalizedCheckpointRequest is request used by relayer to query the last finalized checkpoint
 *   -- The response includes
 *       -- height of the checkpoint
 *       -- checkpoint bytes, this is flexbile based on the client type
 */
export interface GetLastFinalizedCheckpointRequest {
  clientId: string;
}

export interface GetLastFinalizedCheckpointResponse {
  height?: Height;
  checkpointBytes: Uint8Array;
}

/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {
}

/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params holds all the parameters of this module. */
  params?: Params;
}

/**
 * QueryClientStatesRequest is the request type for the Query/ClientStates RPC
 * method
 */
export interface QueryClientStatesRequest {
  /** pagination request */
  pagination?: PageRequest;
}

/**
 * QueryClientStatesResponse is the response type for the Query/ClientStates RPC
 * method.
 */
export interface QueryClientStatesResponse {
  /** list of stored ClientStates of the chain. */
  clientStates: IdentifiedClientState[];
  /** pagination response */
  pagination?: PageResponse;
}

/**
 * QueryClientStatusRequest is the request type for the Query/ClientStatus RPC
 * method
 */
export interface QueryClientStatusRequest {
  /** client unique identifier */
  clientId: string;
}

export interface QueryClientStateRequest {
  /** client unique identifier */
  clientId: string;
}

export interface QueryClientStateResponse {
  /** list of stored ClientStates of the chain. */
  clientState?: IdentifiedClientState;
}

/**
 * QueryClientStatusResponse is the response type for the Query/ClientStatus RPC
 * method. It returns the current status of the IBC client.
 */
export interface QueryClientStatusResponse {
  status: string;
}

export interface QueryClientChainMemoRequest {
  /** client unique identifier */
  clientId: string;
}

export interface QueryClientChainMemoResponse {
  /** json encoded string containing chain information */
  chainMemo: string;
}

function createBasePrepareSendConsensusUpdateRequest(): PrepareSendConsensusUpdateRequest {
  return { clientId: "", height: undefined, updateBytes: new Uint8Array() };
}

export const PrepareSendConsensusUpdateRequest = {
  encode(message: PrepareSendConsensusUpdateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    if (message.height !== undefined) {
      Height.encode(message.height, writer.uint32(18).fork()).ldelim();
    }
    if (message.updateBytes.length !== 0) {
      writer.uint32(26).bytes(message.updateBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PrepareSendConsensusUpdateRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePrepareSendConsensusUpdateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        case 2:
          message.height = Height.decode(reader, reader.uint32());
          break;
        case 3:
          message.updateBytes = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PrepareSendConsensusUpdateRequest {
    return {
      clientId: isSet(object.clientId) ? String(object.clientId) : "",
      height: isSet(object.height) ? Height.fromJSON(object.height) : undefined,
      updateBytes: isSet(object.updateBytes) ? bytesFromBase64(object.updateBytes) : new Uint8Array(),
    };
  },

  toJSON(message: PrepareSendConsensusUpdateRequest): unknown {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    message.height !== undefined && (obj.height = message.height ? Height.toJSON(message.height) : undefined);
    message.updateBytes !== undefined &&
      (obj.updateBytes = base64FromBytes(message.updateBytes !== undefined ? message.updateBytes : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PrepareSendConsensusUpdateRequest>, I>>(
    object: I,
  ): PrepareSendConsensusUpdateRequest {
    const message = createBasePrepareSendConsensusUpdateRequest();
    message.clientId = object.clientId ?? "";
    message.height = (object.height !== undefined && object.height !== null)
      ? Height.fromPartial(object.height)
      : undefined;
    message.updateBytes = object.updateBytes ?? new Uint8Array();
    return message;
  },
};

function createBasePrepareSendConsensusUpdateResponse(): PrepareSendConsensusUpdateResponse {
  return { canUpdate: false, additionalClues: new Uint8Array() };
}

export const PrepareSendConsensusUpdateResponse = {
  encode(message: PrepareSendConsensusUpdateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.canUpdate === true) {
      writer.uint32(8).bool(message.canUpdate);
    }
    if (message.additionalClues.length !== 0) {
      writer.uint32(18).bytes(message.additionalClues);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PrepareSendConsensusUpdateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePrepareSendConsensusUpdateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.canUpdate = reader.bool();
          break;
        case 2:
          message.additionalClues = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PrepareSendConsensusUpdateResponse {
    return {
      canUpdate: isSet(object.canUpdate) ? Boolean(object.canUpdate) : false,
      additionalClues: isSet(object.additionalClues) ? bytesFromBase64(object.additionalClues) : new Uint8Array(),
    };
  },

  toJSON(message: PrepareSendConsensusUpdateResponse): unknown {
    const obj: any = {};
    message.canUpdate !== undefined && (obj.canUpdate = message.canUpdate);
    message.additionalClues !== undefined &&
      (obj.additionalClues = base64FromBytes(
        message.additionalClues !== undefined ? message.additionalClues : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PrepareSendConsensusUpdateResponse>, I>>(
    object: I,
  ): PrepareSendConsensusUpdateResponse {
    const message = createBasePrepareSendConsensusUpdateResponse();
    message.canUpdate = object.canUpdate ?? false;
    message.additionalClues = object.additionalClues ?? new Uint8Array();
    return message;
  },
};

function createBaseGetLastFinalizedCheckpointRequest(): GetLastFinalizedCheckpointRequest {
  return { clientId: "" };
}

export const GetLastFinalizedCheckpointRequest = {
  encode(message: GetLastFinalizedCheckpointRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetLastFinalizedCheckpointRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetLastFinalizedCheckpointRequest();
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

  fromJSON(object: any): GetLastFinalizedCheckpointRequest {
    return { clientId: isSet(object.clientId) ? String(object.clientId) : "" };
  },

  toJSON(message: GetLastFinalizedCheckpointRequest): unknown {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GetLastFinalizedCheckpointRequest>, I>>(
    object: I,
  ): GetLastFinalizedCheckpointRequest {
    const message = createBaseGetLastFinalizedCheckpointRequest();
    message.clientId = object.clientId ?? "";
    return message;
  },
};

function createBaseGetLastFinalizedCheckpointResponse(): GetLastFinalizedCheckpointResponse {
  return { height: undefined, checkpointBytes: new Uint8Array() };
}

export const GetLastFinalizedCheckpointResponse = {
  encode(message: GetLastFinalizedCheckpointResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.height !== undefined) {
      Height.encode(message.height, writer.uint32(10).fork()).ldelim();
    }
    if (message.checkpointBytes.length !== 0) {
      writer.uint32(18).bytes(message.checkpointBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetLastFinalizedCheckpointResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetLastFinalizedCheckpointResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = Height.decode(reader, reader.uint32());
          break;
        case 2:
          message.checkpointBytes = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetLastFinalizedCheckpointResponse {
    return {
      height: isSet(object.height) ? Height.fromJSON(object.height) : undefined,
      checkpointBytes: isSet(object.checkpointBytes) ? bytesFromBase64(object.checkpointBytes) : new Uint8Array(),
    };
  },

  toJSON(message: GetLastFinalizedCheckpointResponse): unknown {
    const obj: any = {};
    message.height !== undefined && (obj.height = message.height ? Height.toJSON(message.height) : undefined);
    message.checkpointBytes !== undefined &&
      (obj.checkpointBytes = base64FromBytes(
        message.checkpointBytes !== undefined ? message.checkpointBytes : new Uint8Array(),
      ));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GetLastFinalizedCheckpointResponse>, I>>(
    object: I,
  ): GetLastFinalizedCheckpointResponse {
    const message = createBaseGetLastFinalizedCheckpointResponse();
    message.height = (object.height !== undefined && object.height !== null)
      ? Height.fromPartial(object.height)
      : undefined;
    message.checkpointBytes = object.checkpointBytes ?? new Uint8Array();
    return message;
  },
};

function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}

export const QueryParamsRequest = {
  encode(_: QueryParamsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsRequest();
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

  fromJSON(_: any): QueryParamsRequest {
    return {};
  },

  toJSON(_: QueryParamsRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryParamsRequest>, I>>(_: I): QueryParamsRequest {
    const message = createBaseQueryParamsRequest();
    return message;
  },
};

function createBaseQueryParamsResponse(): QueryParamsResponse {
  return { params: undefined };
}

export const QueryParamsResponse = {
  encode(message: QueryParamsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryParamsResponse {
    return { params: isSet(object.params) ? Params.fromJSON(object.params) : undefined };
  },

  toJSON(message: QueryParamsResponse): unknown {
    const obj: any = {};
    message.params !== undefined && (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryParamsResponse>, I>>(object: I): QueryParamsResponse {
    const message = createBaseQueryParamsResponse();
    message.params = (object.params !== undefined && object.params !== null)
      ? Params.fromPartial(object.params)
      : undefined;
    return message;
  },
};

function createBaseQueryClientStatesRequest(): QueryClientStatesRequest {
  return { pagination: undefined };
}

export const QueryClientStatesRequest = {
  encode(message: QueryClientStatesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClientStatesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientStatesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryClientStatesRequest {
    return { pagination: isSet(object.pagination) ? PageRequest.fromJSON(object.pagination) : undefined };
  },

  toJSON(message: QueryClientStatesRequest): unknown {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination ? PageRequest.toJSON(message.pagination) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClientStatesRequest>, I>>(object: I): QueryClientStatesRequest {
    const message = createBaseQueryClientStatesRequest();
    message.pagination = (object.pagination !== undefined && object.pagination !== null)
      ? PageRequest.fromPartial(object.pagination)
      : undefined;
    return message;
  },
};

function createBaseQueryClientStatesResponse(): QueryClientStatesResponse {
  return { clientStates: [], pagination: undefined };
}

export const QueryClientStatesResponse = {
  encode(message: QueryClientStatesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.clientStates) {
      IdentifiedClientState.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClientStatesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientStatesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientStates.push(IdentifiedClientState.decode(reader, reader.uint32()));
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryClientStatesResponse {
    return {
      clientStates: Array.isArray(object?.clientStates)
        ? object.clientStates.map((e: any) => IdentifiedClientState.fromJSON(e))
        : [],
      pagination: isSet(object.pagination) ? PageResponse.fromJSON(object.pagination) : undefined,
    };
  },

  toJSON(message: QueryClientStatesResponse): unknown {
    const obj: any = {};
    if (message.clientStates) {
      obj.clientStates = message.clientStates.map((e) => e ? IdentifiedClientState.toJSON(e) : undefined);
    } else {
      obj.clientStates = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination ? PageResponse.toJSON(message.pagination) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClientStatesResponse>, I>>(object: I): QueryClientStatesResponse {
    const message = createBaseQueryClientStatesResponse();
    message.clientStates = object.clientStates?.map((e) => IdentifiedClientState.fromPartial(e)) || [];
    message.pagination = (object.pagination !== undefined && object.pagination !== null)
      ? PageResponse.fromPartial(object.pagination)
      : undefined;
    return message;
  },
};

function createBaseQueryClientStatusRequest(): QueryClientStatusRequest {
  return { clientId: "" };
}

export const QueryClientStatusRequest = {
  encode(message: QueryClientStatusRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClientStatusRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientStatusRequest();
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

  fromJSON(object: any): QueryClientStatusRequest {
    return { clientId: isSet(object.clientId) ? String(object.clientId) : "" };
  },

  toJSON(message: QueryClientStatusRequest): unknown {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClientStatusRequest>, I>>(object: I): QueryClientStatusRequest {
    const message = createBaseQueryClientStatusRequest();
    message.clientId = object.clientId ?? "";
    return message;
  },
};

function createBaseQueryClientStateRequest(): QueryClientStateRequest {
  return { clientId: "" };
}

export const QueryClientStateRequest = {
  encode(message: QueryClientStateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClientStateRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientStateRequest();
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

  fromJSON(object: any): QueryClientStateRequest {
    return { clientId: isSet(object.clientId) ? String(object.clientId) : "" };
  },

  toJSON(message: QueryClientStateRequest): unknown {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClientStateRequest>, I>>(object: I): QueryClientStateRequest {
    const message = createBaseQueryClientStateRequest();
    message.clientId = object.clientId ?? "";
    return message;
  },
};

function createBaseQueryClientStateResponse(): QueryClientStateResponse {
  return { clientState: undefined };
}

export const QueryClientStateResponse = {
  encode(message: QueryClientStateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientState !== undefined) {
      IdentifiedClientState.encode(message.clientState, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClientStateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientState = IdentifiedClientState.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryClientStateResponse {
    return { clientState: isSet(object.clientState) ? IdentifiedClientState.fromJSON(object.clientState) : undefined };
  },

  toJSON(message: QueryClientStateResponse): unknown {
    const obj: any = {};
    message.clientState !== undefined &&
      (obj.clientState = message.clientState ? IdentifiedClientState.toJSON(message.clientState) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClientStateResponse>, I>>(object: I): QueryClientStateResponse {
    const message = createBaseQueryClientStateResponse();
    message.clientState = (object.clientState !== undefined && object.clientState !== null)
      ? IdentifiedClientState.fromPartial(object.clientState)
      : undefined;
    return message;
  },
};

function createBaseQueryClientStatusResponse(): QueryClientStatusResponse {
  return { status: "" };
}

export const QueryClientStatusResponse = {
  encode(message: QueryClientStatusResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== "") {
      writer.uint32(10).string(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClientStatusResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryClientStatusResponse {
    return { status: isSet(object.status) ? String(object.status) : "" };
  },

  toJSON(message: QueryClientStatusResponse): unknown {
    const obj: any = {};
    message.status !== undefined && (obj.status = message.status);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClientStatusResponse>, I>>(object: I): QueryClientStatusResponse {
    const message = createBaseQueryClientStatusResponse();
    message.status = object.status ?? "";
    return message;
  },
};

function createBaseQueryClientChainMemoRequest(): QueryClientChainMemoRequest {
  return { clientId: "" };
}

export const QueryClientChainMemoRequest = {
  encode(message: QueryClientChainMemoRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClientChainMemoRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientChainMemoRequest();
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

  fromJSON(object: any): QueryClientChainMemoRequest {
    return { clientId: isSet(object.clientId) ? String(object.clientId) : "" };
  },

  toJSON(message: QueryClientChainMemoRequest): unknown {
    const obj: any = {};
    message.clientId !== undefined && (obj.clientId = message.clientId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClientChainMemoRequest>, I>>(object: I): QueryClientChainMemoRequest {
    const message = createBaseQueryClientChainMemoRequest();
    message.clientId = object.clientId ?? "";
    return message;
  },
};

function createBaseQueryClientChainMemoResponse(): QueryClientChainMemoResponse {
  return { chainMemo: "" };
}

export const QueryClientChainMemoResponse = {
  encode(message: QueryClientChainMemoResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chainMemo !== "") {
      writer.uint32(10).string(message.chainMemo);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryClientChainMemoResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientChainMemoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainMemo = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryClientChainMemoResponse {
    return { chainMemo: isSet(object.chainMemo) ? String(object.chainMemo) : "" };
  },

  toJSON(message: QueryClientChainMemoResponse): unknown {
    const obj: any = {};
    message.chainMemo !== undefined && (obj.chainMemo = message.chainMemo);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<QueryClientChainMemoResponse>, I>>(object: I): QueryClientChainMemoResponse {
    const message = createBaseQueryClientChainMemoResponse();
    message.chainMemo = object.chainMemo ?? "";
    return message;
  },
};

/** Query defines the gRPC querier service. */
export interface Query {
  /** Parameters queries the parameters of the module. */
  Params(request: QueryParamsRequest): Promise<QueryParamsResponse>;
  /** ClientStates queries all the Poly IBC light clients */
  ClientStates(request: QueryClientStatesRequest): Promise<QueryClientStatesResponse>;
  /** ClientState queries a persisted light client by client_id */
  ClientState(request: QueryClientStateRequest): Promise<QueryClientStateResponse>;
  /** ClientStatus queries the status of an IBC client. */
  ClientStatus(request: QueryClientStatusRequest): Promise<QueryClientStatusResponse>;
  /** ClientChainMemo queries for the chain memo of an IBC client. */
  ClientChainMemo(request: QueryClientChainMemoRequest): Promise<QueryClientChainMemoResponse>;
  /**
   * ConsensusState queries a consensus state associated with a client state at
   * a given height.
   */
  ConsensusState(request: QueryConsensusStateRequest): Promise<QueryConsensusStateResponse>;
  PrepareSendConsensusUpdate(request: PrepareSendConsensusUpdateRequest): Promise<PrepareSendConsensusUpdateResponse>;
  /** GetLastFinalizedCheckpoint queries a persisted and finalized checkpoint by client_id */
  GetLastFinalizedCheckpoint(request: GetLastFinalizedCheckpointRequest): Promise<GetLastFinalizedCheckpointResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "polyibc.core.Query";
    this.rpc = rpc;
    this.Params = this.Params.bind(this);
    this.ClientStates = this.ClientStates.bind(this);
    this.ClientState = this.ClientState.bind(this);
    this.ClientStatus = this.ClientStatus.bind(this);
    this.ClientChainMemo = this.ClientChainMemo.bind(this);
    this.ConsensusState = this.ConsensusState.bind(this);
    this.PrepareSendConsensusUpdate = this.PrepareSendConsensusUpdate.bind(this);
    this.GetLastFinalizedCheckpoint = this.GetLastFinalizedCheckpoint.bind(this);
  }
  Params(request: QueryParamsRequest): Promise<QueryParamsResponse> {
    const data = QueryParamsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "Params", data);
    return promise.then((data) => QueryParamsResponse.decode(new _m0.Reader(data)));
  }

  ClientStates(request: QueryClientStatesRequest): Promise<QueryClientStatesResponse> {
    const data = QueryClientStatesRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ClientStates", data);
    return promise.then((data) => QueryClientStatesResponse.decode(new _m0.Reader(data)));
  }

  ClientState(request: QueryClientStateRequest): Promise<QueryClientStateResponse> {
    const data = QueryClientStateRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ClientState", data);
    return promise.then((data) => QueryClientStateResponse.decode(new _m0.Reader(data)));
  }

  ClientStatus(request: QueryClientStatusRequest): Promise<QueryClientStatusResponse> {
    const data = QueryClientStatusRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ClientStatus", data);
    return promise.then((data) => QueryClientStatusResponse.decode(new _m0.Reader(data)));
  }

  ClientChainMemo(request: QueryClientChainMemoRequest): Promise<QueryClientChainMemoResponse> {
    const data = QueryClientChainMemoRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ClientChainMemo", data);
    return promise.then((data) => QueryClientChainMemoResponse.decode(new _m0.Reader(data)));
  }

  ConsensusState(request: QueryConsensusStateRequest): Promise<QueryConsensusStateResponse> {
    const data = QueryConsensusStateRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ConsensusState", data);
    return promise.then((data) => QueryConsensusStateResponse.decode(new _m0.Reader(data)));
  }

  PrepareSendConsensusUpdate(request: PrepareSendConsensusUpdateRequest): Promise<PrepareSendConsensusUpdateResponse> {
    const data = PrepareSendConsensusUpdateRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "PrepareSendConsensusUpdate", data);
    return promise.then((data) => PrepareSendConsensusUpdateResponse.decode(new _m0.Reader(data)));
  }

  GetLastFinalizedCheckpoint(request: GetLastFinalizedCheckpointRequest): Promise<GetLastFinalizedCheckpointResponse> {
    const data = GetLastFinalizedCheckpointRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetLastFinalizedCheckpoint", data);
    return promise.then((data) => GetLastFinalizedCheckpointResponse.decode(new _m0.Reader(data)));
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
