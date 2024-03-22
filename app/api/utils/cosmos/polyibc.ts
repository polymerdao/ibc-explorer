/* eslint-disable camelcase */

import { z } from 'zod'
import * as tx from './_generated/polyibc/core/tx'
import * as ibcchannel from 'cosmjs-types/ibc/core/channel/v1/tx'
import * as transfer from 'cosmjs-types/ibc/applications/transfer/v1/tx'

import { GeneratedType, EncodeObject } from '@cosmjs/proto-signing'
export * as tx from './_generated/polyibc/core/tx'
export * as query from './_generated/polyibc/core/query'
export * as client from './_generated/polyibc/core/client'
export * as genesis from './_generated/polyibc/core/genesis'
export * as params from './_generated/polyibc/core/params'
export * as packet from './_generated/polyibc/core/packet'
export * as proof from './_generated/polyibc/core/proof'
export * as channel from './_generated/ibc/core/channel/v1/channel'

export * as lightclients from './lightclients'
export * as ibcchannel from 'cosmjs-types/ibc/core/channel/v1/tx'
export * as transfer from 'cosmjs-types/ibc/applications/transfer/v1/tx'

const txMsgTypesRegistry = {
  '/polyibc.core.MsgSendIbcPacket': tx.MsgSendPacket,
  '/polyibc.core.MsgUpdateClient': tx.MsgUpdateClient,
  '/polyibc.core.MsgCreateClient': tx.MsgCreateClient,
  '/polyibc.core.MsgAcknowledgement': tx.MsgAcknowledgementResponse,
  '/polyibc.core.MsgCreateVibcClient': tx.MsgCreateVibcClient,
  '/polyibc.core.MsgCreateVibcConnection': tx.MsgCreateVibcConnection,
  '/polyibc.core.MsgOpenIBCChannel': tx.MsgOpenIBCChannel,
  '/polyibc.core.MsgConnectIBCChannel': tx.MsgConnectIBCChannel,
  '/ibc.core.channel.v1.MsgChannelOpenInit': ibcchannel.MsgChannelOpenInit,
  '/ibc.core.channel.v1.MsgChannelOpenTry': ibcchannel.MsgChannelOpenTry,
  '/ibc.core.channel.v1.MsgChannelOpenAck': ibcchannel.MsgChannelOpenAck,
  '/ibc.core.channel.v1.MsgChannelOpenConfirm': ibcchannel.MsgChannelOpenConfirm,
  '/ibc.applications.transfer.v1.MsgTransfer': transfer.MsgTransfer
}

/**
 *  Tx Msg type registrations for signer's registry
 */
export const txMsgTypes: ReadonlyArray<[string, GeneratedType]> = Object.entries(txMsgTypesRegistry)

interface txMsgEncodeObject<T extends keyof typeof txMsgTypesRegistry & string> extends EncodeObject {
  readonly typeUrl: T
  // the value obj's decode method returns a vanila js object with all msg fields
  readonly value: ReturnType<typeof txMsgTypesRegistry[T]['decode']>
}

export interface MsgCreateClientEncodeObject extends txMsgEncodeObject<'/polyibc.core.MsgCreateClient'> {}
export interface MsgSendIbcPacketEncodeObject extends txMsgEncodeObject<'/polyibc.core.MsgSendIbcPacket'> {}
export interface MsgAcknowledgementEncodeObject extends txMsgEncodeObject<'/polyibc.core.MsgAcknowledgement'> {}
export interface MsgCreateVibcClientEncodeObject extends txMsgEncodeObject<'/polyibc.core.MsgCreateVibcClient'> {}
export interface MsgCreateVibcConnectionEncodeObject
  extends txMsgEncodeObject<'/polyibc.core.MsgCreateVibcConnection'> {}
export interface MsgOpenIBCChannelEncodeObject extends txMsgEncodeObject<'/polyibc.core.MsgOpenIBCChannel'> {}
export interface MsgConnectIBCChannelEncodeObject extends txMsgEncodeObject<'/polyibc.core.MsgConnectIBCChannel'> {}

export interface MsgChannelOpenInitEncodeObject extends txMsgEncodeObject<'/ibc.core.channel.v1.MsgChannelOpenInit'> {}
export interface MsgChannelOpenTryEncodeObject extends txMsgEncodeObject<'/ibc.core.channel.v1.MsgChannelOpenTry'> {}
export interface MsgChannelOpenAckEncodeObject extends txMsgEncodeObject<'/ibc.core.channel.v1.MsgChannelOpenAck'> {}
export interface MsgChannelOpenConfirmEncodeObject
  extends txMsgEncodeObject<'/ibc.core.channel.v1.MsgChannelOpenConfirm'> {}
export interface MsgTransferEncodeObject extends txMsgEncodeObject<'/ibc.applications.transfer.v1.MsgTransfer'> {}

// TODO: is there a way to automate these?

export const MsgCreateVibcClientResponseSchema = z.object({
  client_id: z.string(),
  client_type: z.string(),
  sender: z.string()
})
export type MsgCreateVibcClientResponse = z.infer<typeof MsgCreateVibcClientResponseSchema>

export const MsgCreateVibcConnectionResponseSchema = z.object({
  client_id: z.string(),
  client_type: z.string(),
  connection_id: z.string(),
  counterparty_client_id: z.string(),
  counterparty_connection_id: z.string()
})
export type MsgCreateVibcConnectionResponse = z.infer<typeof MsgCreateVibcConnectionResponseSchema>

export const MsgOpenIBCChannelResponseSchema = z.object({
  port_id: z.string(),
  channel_id: z.string(),
  connection_id: z.string(),
  version: z.string().optional(),
  counterparty_channel_id: z.string().optional(),
  counterparty_port_id: z.string().optional()
})
export type MsgOpenIBCChannelResponse = z.infer<typeof MsgOpenIBCChannelResponseSchema>

export const MsgConnectIBCChannelResponseSchema = z.object({
  port_id: z.string(),
  channel_id: z.string(),
  connection_id: z.string(),
  counterparty_channel_id: z.string(),
  counterparty_port_id: z.string().optional()
})
export type MsgConnectIBCChannelResponse = z.infer<typeof MsgConnectIBCChannelResponseSchema>
