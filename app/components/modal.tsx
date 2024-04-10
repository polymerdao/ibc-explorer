import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { OrbitLoader } from 'components/loading/loader';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  content: JSX.Element;
  loading?: boolean;
}

export function Modal({open, onClose, content, loading}: ModalProps) {
  return (

    <Transition appear show={open} as={Fragment}>
      <Dialog className="relative z-10" onClose={() => onClose()}>

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
              enterFrom="opacity-0 -translate-y-12"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-12">
              <Dialog.Panel
                className="w-fit max-w-full min-w-36 transform border-[1.5px] border-slate-800 dark:border-slate-300 rounded-md bg-bg-light dark:bg-bg-dark p-6 transition-all">
                {!loading &&
                <button className="absolute top-0 right-0 m-4"
                  onClick={() => onClose()}>
                  <FiX className="w-6 h-6" />
                </button>}
                {!loading &&
                <div className="mb-2 pr-4 text-wrap">
                  {content}
                </div>}
                {loading &&
                <div className="flex justify-center px-8 py-6">
                  <OrbitLoader />
                </div>}
              </Dialog.Panel>
            </Transition.Child>

          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
