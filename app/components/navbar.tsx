'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { classNames } from 'utils/functions';
import Link from 'next/link';
import Image from 'next/image';
import { FiSun, FiMoon } from 'react-icons/fi';

const tabs = [
  { name: 'Packets', href: '/packets' },
  { name: 'Channels', href: '/channels' },
  { name: 'Connections', href: '/connections' },
  { name: 'Clients', href: '/clients' }
];

export default function Navbar() {
  const [nav, setNav] = useState(false);
  const [dark, setDark] = useState(true);
  const pathname = usePathname();

  const toggleNav = () => {
    setNav(!nav);
  }

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  }

  return (
    <nav className="w-full z-20 sticky top-0 bg-bg-light-accent dark:bg-bg-dark border-b-[0px] border-gray-300 dark:border-gray-700 ease-in-out">
      <div className="h-16 min-w-0 xl:min-w-[80rem] max-w-screen-xl xl:w-4/5 mx-auto px-6 sm:px-8 flex justify-between sm:justify-start">

        <div className="flex items-center shrink-0 mr-10 pt-1">
          <Link href="/">
            <Image className="relative dark:invert opacity-95" src={'/logo512.png'} width={32} height={32} alt={'Logo'} />
          </Link>
        </div>

        <div className="hidden w-0 sm:w-full sm:flex justify-between" id="navbar-default">
          <div className="flex w-full space-x-8">
            {tabs.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  pathname === item.href
                    ? 'border-fg-light border-opacity-60 dark:border-fg-dark dark:border-opacity-60'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-fg-light dark:hover:text-fg-dark'
                    , 'inline-flex items-center px-1 pt-1 border-b-2 text-md font-medium transition ease-in-out'
                )}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* <button
            onClick={() => toggleTheme()}
            className="flex items-center justify-center h-10 mt-3 p-3 rounded-md bg-bg-light-accent hover:bg-bg-light dark:bg-bg-dark hover:dark:bg-bg-dark-accent transition ease-in-out">
            {dark
              ? <FiSun className="text-fg-dark w-5 h-5" />
              : <FiMoon className="text-fg-light w-5 h-5" />
            }
          </button> */}

        </div>

        {/* Mobile menu button */}
        <button 
          onClick={toggleNav}
          data-collapse-toggle="navbar-default"
          type="button"
          className="flex flex-col justify-between self-center inline-flex items-center w-7 h-5 justify-center text-sm sm:opacity-0 transition ease-in-out"
          aria-label="Expand navigation menu">
          <div 
            className={classNames(
              nav
                ? 'rotate-45 translate-y-[0.315rem]'
                : 'rotate-0 translate-y-0',
                  'w-full h-0.5 bg-fg-light dark:bg-fg-dark opacity-95 rounded-md mt-1 transition ease-in-out'
            )}
          ></div>
          <div 
            className={classNames(
              nav
                ? 'rotate-[-45deg] -translate-y-[0.315rem]'
                : 'rotate-0 translate-y-0',
                  'w-full h-0.5 bg-fg-light dark:bg-fg-dark opacity-95 rounded-md mb-1 transition ease-in-out'
            )}
          ></div>
        </button>

        {/* Mobile menu, show/hide based on menu state */}
        <div
          className={classNames(
            nav
              ? 'right-0'
              : 'right-[-100%] hidden'
              , 'fixed sm:hidden flex flex-col space-y-8 border-[0.8px] p-8 w-full h-screen top-16 border-gray-300 dark:border-gray-700 bg-bg-light-accent dark:bg-bg-dark ease-in-out duration-[400ms]'
          )}>
          {tabs.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                pathname === item.href
                  ? 'decoration-fg-light/70 dark:decoration-fg-dark/70'
                  : 'text-gray-600 dark:text-gray-300 decoration-fg-light/0 dark:decoration-fg-dark/0'
                  , 'inline-flex items-center px-1 pt-1 text-lg font-bold underline underline-offset-8 decoration-2 rounded-md transition ease-in-out'
              )}>
              {item.name}
            </Link>
          ))}
        </div>

      </div>
    </nav>
  );
}
