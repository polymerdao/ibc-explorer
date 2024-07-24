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
      <button className={classNames(
        showCheck
        ? 'invisible'
        : ''
        , 'opacity-70 w-5 h-5 pl-[1px] ml-1.5 mt-[1px] hover:opacity-100 transition ease-in-out duration-200'
        )}
        onClick={() => handleClick()}>
        <FiCopy />
      </button>

      <FiCheck className={classNames(
        showCheck
        ? ''
        : 'invisible'
        , 'absolute cursor-pointer bottom-[4px] left-[6px] w-[18px] h-[18px] text-turquoise'
      )} />
    </div>
  );
}
