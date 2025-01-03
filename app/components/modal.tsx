'use client';

import { Fragment, ReactElement } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { OrbitLoader } from 'components/loading/loader';
import { FiX } from 'react-icons/fi';

/**
 * Modal component props interface
 */
interface ModalProps {
  /** Controls modal visibility */
  open: boolean;
  /** Callback function to handle modal close */
  onClose: () => void;
  /** Modal content */
  content: ReactElement;
  /** Loading state flag */
  loading?: boolean;
}

/**
 * A reusable modal component with transition effects and loading state
 * @param props - Modal component properties
 * @returns Modal component with transition effects
 */
export function Modal({ open, onClose, content, loading }: ModalProps): ReactElement {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 dark:bg-dark-gray/75 backdrop-blur-sm" />
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
                className="w-fit max-w-full min-w-36 transform bg-vapor dark:bg-black p-9 transition-all">
                {!loading && (
                  <button 
                    type="button"
                    className="absolute top-0 right-0 m-4"
                    onClick={onClose}
                    aria-label="Close modal">
                    <FiX className="w-6 h-6" />
                  </button>
                )}
                {!loading && (
                  <div className="mb-2 pr-4 text-wrap">
                    {content}
                  </div>
                )}
                {loading && (
                  <div className="flex justify-center px-8 py-6">
                    <OrbitLoader />
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
