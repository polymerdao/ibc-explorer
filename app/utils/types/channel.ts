import { IdentifiedChannel as BaseIdentifiedChannel, State } from 'cosmjs-types/ibc/core/channel/v1/channel';
export { State };

export interface IdentifiedChannel extends BaseIdentifiedChannel {
  createTime?: number;
  transactionHash?: string;
}

export function stateToString(state: State): string {
  switch (state) {
    case State.STATE_OPEN: return 'Open'
    case State.STATE_INIT: return 'Initialized'
    case State.STATE_CLOSED: return 'Closed'
    case State.STATE_TRYOPEN: return 'Initialized'
    case State.UNRECOGNIZED:
    case State.STATE_UNINITIALIZED_UNSPECIFIED:
      return 'Pending'
    default:
      return 'Pending'
  }
}
