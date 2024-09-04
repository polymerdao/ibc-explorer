import { CHAIN, CHAIN_CONFIGS } from 'utils/chains/configs';
import { SimIcon, UnknownIcon } from 'components/icons'
import { shortenHex } from './format-strings';

export function ChainCell({chain}: {chain: string}) {
  const size = 32;

  if (!chain) {
    return UnknownIcon(size);
  }

  const sim: boolean = chain.toLowerCase().includes('sim');
  const chainName = chain.split('-')[0];
  let icon: JSX.Element = <span>{
    chain.length > 25 ? shortenHex(chain) : chain
  }</span>;

  for (const key in CHAIN_CONFIGS) {
    if (chainName.toLowerCase().includes(key.toLowerCase())) {
      icon = CHAIN_CONFIGS[key as CHAIN].icon(size);
    }
  }

  return (
    <div className="relative">
      <div className="opacity-80 mr-1" title={chain}>
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
    <div className="w-full min-w-6 ml-8 mr-1.5 relative grid justify-items-end content-center opacity-70">
      <div className="h-[1px] rounded-full w-full bg-black dark:bg-white"></div>
      <div className="h-[1px] rounded-full absolute w-[10px] mt-[15.6px] origin-right rotate-[40deg] bg-black dark:bg-white"></div>
      <div className="h-[1px] rounded-full absolute w-[10px] mt-[15.6px] origin-right -rotate-[40deg] bg-black dark:bg-white"></div>
    </div>
  );
}
