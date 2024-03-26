import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { FiChevronDown } from 'react-icons/fi'
import { classNames } from 'utils/functions'

interface Option {
  value: string | number;
  label: string | number;
}

interface Props {
  options: Option[];
  onChange: (value: string | number) => void;
}

export function Select({ options, onChange }: Props) {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleChange = (option: Option) => {
    setSelectedOption(option);
    onChange(option.value);
  }

  return (
    <div className="relative w-24">
      <Listbox value={selectedOption} onChange={(e) => {handleChange(e)}}>
        {({ open }) => (<>
          <Listbox.Button className="w-full flex flex-row justify-between items-center h-8 pl-[9px] pr-1.5 cursor-default rounded bg-bg-dark-accent border-[0.5px] hover:border-fg-dark border-slate-500 text-fg-dark transition east-in-out duration-200">
            <span className="truncate">{selectedOption.label}</span>
            <FiChevronDown className={classNames(
              open
              ? "scale-y-[-1]"
              : ""
              , "transition ease-in-out duration-200"
            )}/>
          </Listbox.Button>

          <Transition
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="transform scale-95 opacity-0 -translate-y-6 z-30"
            enterTo="transform scale-100 opacity-100 z-30"
            leave="ease-in duration-150"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0">
            <Listbox.Options className="absolute left-0 mt-1.5 overflow-auto rounded-md bg-bg-dark py-2 border-[0.5px] border-slate-500">
              {options.map((option) => (
                <Listbox.Option key={option.value} value={option}
                  className={({ active }) => classNames(
                    active
                    ? "bg-bg-dark-accent"
                    : ""
                    , "relative cursor-default select-none py-1.5 ml-2 mr-2.5 pl-2.5 pr-3 rounded"
                  )}>
                  <div className="flex flex-row">
                    <span className="text-fg-light dark:text-fg-dark">
                      {option.label}
                    </span>
                  </div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </>)}
      </Listbox>
    </div>
  )
}
