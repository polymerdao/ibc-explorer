export const SimIcon = () => (
  <div 
    title="Uses sim client"
    className="grid justify-items-center content-center w-6 h-6 border-2 border-sky-600 border-dotted rounded-full bg-bg-light dark:bg-bg-dark-accent cursor-default">
    <span className="text-sky-600 font-primary text-xs font-semibold italic mr-[2.5px] mb-[0.3px]">S</span>
  </div>
);

export const UnknownIcon = (size?: number) => {
  size = size || 32;
  return (
  <div 
    style={{ width: size, height: size }}
    title="Unknown"
    className="grid justify-items-center content-center border-2 border-sky-600 border-dotted rounded-full bg-bg-light dark:bg-bg-dark-accent cursor-default">
    <span className="text-sky-600 font-primary text-s font-semibold mb-0.5">?</span>
  </div>
)};
