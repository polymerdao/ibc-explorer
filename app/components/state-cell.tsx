import { classNames } from 'utils/functions';

export function StateCell(state: string) {
  return (
    <div className={classNames(
      state === 'Delivered' || state === 'Open'
      ? 'bg-turquoise/90 text-black'
      : 'bg-light-blue/90 text-white'
      , 'grid place-content-center w-32 h-7 rounded-xl py-[2.2px] pt-[3px]'
    )}>
      <span className="mr-[1.5px] mb-[1.5px] font-primary">{state}</span>
    </div>
  );
}
