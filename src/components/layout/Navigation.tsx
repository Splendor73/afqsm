"use client";

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Quotations', href: '/quotations' },
  { name: 'Services', href: '/services' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Disclosure as="nav" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-transparent text-slate-800' 
        : 'bg-transparent text-slate-800'
    }`}>
      {({ open }: { open: boolean }) => (
        <>
          <div className="container mx-auto px-4 py-6">
            <div className="relative rounded-xl bg-white/80 backdrop-blur-md shadow-lg px-6 border border-white/40 hover:shadow-xl transition-all duration-300">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="flex-shrink-0">
                    <Link href="/" className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                          <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
                        </svg>
                      </div>
                      <span className="font-bold text-xl hidden sm:block">Prisam Engitech</span>
                    </Link>
                  </div>
                  
                  {/* Left-aligned Navigation */}
                  <div className="hidden sm:flex">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`relative inline-flex items-center px-3 py-2 text-lg font-medium transition-all duration-200 
                            ${pathname === item.href 
                              ? 'text-blue-700' 
                              : 'text-slate-600 hover:text-blue-700'
                            }`}
                        >
                          {item.name}
                          {pathname === item.href && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex sm:items-center">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 p-1.5 text-white hover:from-indigo-700 hover:to-blue-700 focus:outline-none transition-all duration-200 shadow-md hover:shadow-lg">
                        <span className="sr-only">Open user menu</span>
                        <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white/90 backdrop-blur-lg py-2 shadow-lg ring-1 ring-black/5 focus:outline-none">
                        <Menu.Item>
                          {({ active }: { active: boolean }) => (
                            <button
                              className={`${active ? 'bg-slate-100' : ''} block w-full px-4 py-2 text-left text-sm text-slate-700`}
                            >
                              Settings
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }: { active: boolean }) => (
                            <button
                              className={`${active ? 'bg-slate-100' : ''} block w-full px-4 py-2 text-left text-sm text-slate-700`}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700 focus:outline-none transition-all duration-200">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          <Transition
            enter="transition duration-200 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-100 ease-in"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="sm:hidden">
              <div className="container mx-auto px-4">
                <div className="rounded-xl overflow-hidden shadow-lg bg-white/90 backdrop-blur-lg border border-white/40 mt-2">
                  <div className="space-y-1 pt-2 pb-3 px-3">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        href={item.href}
                        className={`block rounded-md px-3 py-2 text-lg font-medium transition-all duration-200 ${
                          pathname === item.href
                            ? 'text-blue-700'
                            : 'text-slate-600 hover:text-blue-700'
                        }`}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 pb-3 pt-4">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <div className="p-1 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                          <UserCircleIcon className="h-8 w-8" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-slate-700">User Name</div>
                        <div className="text-sm font-medium text-slate-500">user@example.com</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 px-3">
                      <Disclosure.Button
                        as="button"
                        className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                      >
                        Settings
                      </Disclosure.Button>
                      <Disclosure.Button
                        as="button"
                        className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                      >
                        Sign out
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
} 