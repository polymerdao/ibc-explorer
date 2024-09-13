import { classNames } from 'utils/functions';

export function FilterButton({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
  return (
    <button
      className="ml-3.5 pt-2.5 pb-3 px-2 grid justify-items-center items-center"
      onClick={() => setOpen(!open)}
      data-testid="filter-button">
      <div className={classNames(
        open
        ? 'translate-y-4'
        : '',
        'relative h-0.5 w-6 bg-vapor transition-transform duration-200 ease-in-out'
      )}>
      </div>
      <div
        className="h-0.5 w-[15.5px] bg-vapor">
      </div>
      <div className={classNames(
        open
        ? '-translate-y-4'
        : '',
        'relative h-0.5 w-[7px] bg-vapor transition-transform duration-200 ease-in-out'
      )}>
      </div>
    </button>
  )
}
