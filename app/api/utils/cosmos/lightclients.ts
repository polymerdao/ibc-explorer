/* eslint-disable camelcase */

import * as sim from './_generated/polyibc/lightclients/sim/sim'
import * as optimism from './_generated/polyibc/lightclients/opstackv2/opstackv2'
import { EncodeObject } from '@cosmjs/proto-signing'
export * as sim from './_generated/polyibc/lightclients/sim/sim'
export * as optimism from './_generated/polyibc/lightclients/opstackv2/opstackv2'

export const otherMsgTypesRegistry = {
  '/polyibc.lightclients.sim.ClientState': sim.ClientState,
  '/polyibc.lightclients.sim.ConsensusState': sim.ConsensusState,
  '/polyibc.lightclients.opstackv2.ClientState': optimism.ClientState,
  '/polyibc.lightclients.opstackv2.ConsensusState': optimism.ConsensusState,
}

interface msgEncodeObject<T extends keyof typeof otherMsgTypesRegistry & string> extends EncodeObject {
  readonly typeUrl: T
  // the value obj's decode method returns a vanila js object with all msg fields
  readonly value: ReturnType<typeof otherMsgTypesRegistry[T]['decode']>
}

export interface SimClientStateEncodeObject extends msgEncodeObject<'/polyibc.lightclients.sim.ClientState'> {}
export interface SimConsensusStateEncodeObject extends msgEncodeObject<'/polyibc.lightclients.sim.ConsensusState'> {}
export interface OpClientStateEncodeObject extends msgEncodeObject<'/polyibc.lightclients.opstackv2.ClientState'> {}
export interface OpConsensusStateEncodeObject extends msgEncodeObject<'/polyibc.lightclients.opstackv2.ConsensusState'> {}