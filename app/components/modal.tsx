import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX } from 'react-icons/fi';

export function Modal({open, setOpen, title, content}: {open: boolean, setOpen: (open: boolean) => void, title: string, content: JSX.Element}) {
  return (

    <Transition appear show={open} as={Fragment}>
      <Dialog className="relative z-10" onClose={() => setOpen(false)}>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-bg-dark/40 dark:bg-bg-dark/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-6"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-6">
              <Dialog.Panel
                className="w-fit max-w-full min-w-36 transform border border-slate-800 dark:border-slate-300 rounded-md bg-bg-light dark:bg-bg-dark p-6 transition-all">
                <button className="absolute top-0 right-0 m-4"
                  onClick={() => setOpen(false)}>
                  <FiX className="w-6 h-6" />
                </button>
                <Dialog.Title className="text-lg font-medium pr-10">
                  {title}
                </Dialog.Title>
                <div className="mt-4 mb-2 pr-4 text-wrap">
                  {content}
                </div>
              </Dialog.Panel>
            </Transition.Child>

          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
