export function BooleanCell({ value }: { value: boolean }) {
  return (
      <div className="w-full flex pl-6">
        {value ? (
          <div className="h-[9px] w-[18px] border border-slate-500 rounded-lg bg-sky-600"></div>
        ) : (
          <div className="h-[9px] w-[18px] border-[1.5px] border-slate-500 rounded-lg"></div>
        )}
      </div>
  );
}
