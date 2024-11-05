import { Disclosure } from '@headlessui/react'
import { useLocation } from 'react-router-dom'
import { LogoutButton, LoginButton } from './Login';
import { ButtonHomePage } from './HomePage';
import logo from '../img/logoKiruna.png';


export default function Navbar(props: any) {
  const location = useLocation();

  return (
    <Disclosure as="nav" className="bg-blue-950">
      <div className="mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-left sm:items-stretch sm:justify-start">
            <div className="flex items-center space-x-4">
              <img
                alt="Kimura Company"
                src={logo}
                className="h-12 w-auto rounded-full hidden sm:block"
              />
              <div className="text-gray-300 font-semibold text-lg sm:text-xl">
                Kiruna <span className="text-blue-300">eXplorer</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {!props.isLogged ? <><ButtonHomePage/> <LoginButton/></> : <><ButtonHomePage/><LogoutButton className="ml-4" logout={props.logout}/></>}
          </div>
        </div>
      </div>    
    </Disclosure>

  )
}

export {Navbar}
