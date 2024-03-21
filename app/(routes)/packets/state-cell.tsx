import { PacketStates } from "utils/types/packet";
import { classNames } from "utils/functions";

export function StateCell(state: string) {
  return (
    <div className={classNames(
      state === 'Delivered'
      ? "bg-emerald-500/60"
      : "bg-sky-500/50"
      , "flex flex-row w-32 justify-center rounded-xl py-[2.2px]"
    )}>
      <span className="text-fg-light dark:text-fg-dark mr-[1.5px] mb-[1.5px] font-primary">{state}</span>
    </div>
  );
}

export function stateToString (state: PacketStates): string {
  switch (state) {
    case PacketStates.SENT:
    case PacketStates.POLY_RECV:
      return 'Relaying';
    case PacketStates.RECV:
    case PacketStates.WRITE_ACK:
    case PacketStates.POLY_WRITE_ACK:
      return 'Confirming';
      break;
    case PacketStates.ACK:
      return 'Delivered';
      break;
    default:
      return 'Relaying';
  }
}
