import { CHAIN, CHAIN_CONFIGS } from 'utils/chains/configs';
import { SimIcon } from 'components/icons'

export function ChainCell({chain}: {chain: string}) {
  if (!chain) return null;

  const size = 32;
  const sim: boolean = chain.toLowerCase().includes('sim');
  const chainName = chain.split('-')[0];
  let icon: JSX.Element = <span>{chain}</span>;

  for (const key in CHAIN_CONFIGS) {
    if (chainName.toLowerCase().includes(key.toLowerCase())) {
      icon = CHAIN_CONFIGS[key as CHAIN].icon(size);
    }
  }

  return (
    <div className="relative">
      <div className="opacity-75 mr-1" title={chain}>
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
