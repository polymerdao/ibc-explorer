import {
  OptimismIcon,
  BaseIcon
} from "utils/chains/icons";
import { SimIcon } from "components/icons"

export function ChainCell({chain, iconSize}: {chain: string, iconSize?: number}) {
  const size = iconSize || 32;
  const sim: boolean = chain.toLowerCase().includes('sim');

  let icon;
  if (chain.toLowerCase().includes('optimism')) {
    icon = OptimismIcon(size);
  } else if (chain.toLowerCase().includes('base')) {
    icon = BaseIcon(size);
  } else {
    return <span>{chain}</span>
  }

  return (
    <div className="relative">
      <div className="opacity-75">
        {icon}
      </div>
      {sim && 
        <div className="absolute translate-x-[26px] -translate-y-[22px]">
          <SimIcon />
        </div>
      }
    </div>
  );
}

export function Arrow() {
  return (
    <div className="w-full min-w-6 ml-7 relative grid justify-items-end content-center opacity-70">
      <div className="h-[1px] rounded-full w-full bg-fg-light dark:bg-fg-dark"></div>
      <div className="h-[1px] rounded-full absolute w-[10px] mt-[15.6px] origin-right rotate-[40deg] bg-fg-light dark:bg-fg-dark"></div>
      <div className="h-[1px] rounded-full absolute w-[10px] mt-[15.6px] origin-right -rotate-[40deg] bg-fg-light dark:bg-fg-dark"></div>
    </div>
  );
}
