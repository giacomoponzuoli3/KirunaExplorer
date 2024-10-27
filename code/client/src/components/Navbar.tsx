import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import { LogoutButton, LoginButton } from './Login';
import logo from '../img/logoKiruna.png'; // Importa l'immagine


export default function Navbar(props: any) {
  const location = useLocation();

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-orange-400 to-yellow-500">
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img
                alt="Kimura Company"
                src={logo}
                className="h-12 w-auto rounded-full"
              />
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                     
            {!props.isLogged ? <LoginButton/> : <LogoutButton logout={props.logout}/>}
          </div>
        </div>
      </div>    
    </Disclosure>
  )
}

export {Navbar}
