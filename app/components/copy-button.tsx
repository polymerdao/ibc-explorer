import { useState } from 'react';
import { classNames } from 'utils/functions';
import { FiCopy, FiCheck } from 'react-icons/fi';

export function CopyButton({str}: {str: string}) {
  const [showCheck, setShowCheck] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(str);
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 1500);
  }

  return (
    <div className="relative">
      <button className="opacity-70 hover:opacity-100 transition ease-in-out duration-200"
        onClick={() => handleClick()}>
        <FiCopy className="ml-2 -mb-0.5"/>
      </button>

      <FiCheck className={classNames(
        showCheck
        ? 'opacity-100'
        : 'opacity-0'
        , 'absolute bottom-[5px] left-[28px] w-[20px] h-[20px] text-emerald-500 transition ease-in-out duration-200'
      )} />
    </div>
  );
}
