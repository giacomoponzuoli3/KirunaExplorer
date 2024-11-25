import { useState, useEffect } from 'react';
import { Disclosure } from '@headlessui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogoutButton, LoginButton } from './Login';
// import logo from '../img/logoKiruna.png';
import logo from '../img/iconKiruna.png';
import { ButtonHomePage } from './HomePage';
import { Button } from 'react-bootstrap';
import { ChevronRightIcon } from '@heroicons/react/24/outline';


export default function Navbar(props: any) {
  const navigate = useNavigate();
  const location = useLocation();

  const previousPath: string | null = location.state?.from || null;

  // State to track the active option 
  const [activeTab, setActiveTab] = useState("home");

  // Set `activeTab` with the current position
  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("home");
    } else if (location.pathname === "/documents") {
      setActiveTab("documents");
    } else if (previousPath === "/documents") {
      console.log("entrato")
      setActiveTab("links"); 
    } else if (location.pathname === "/diagram") {
      setActiveTab("diagram");
    } else {
      setActiveTab("");
    }
  }, [location.pathname]);


  return (
    <Disclosure as="nav" className="bg-blue-950 border-b border-gray-700">
      <div className="mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-left sm:items-stretch sm:justify-start">
            <div className="flex items-center space-x-2">
              <img
                alt="Kimura Company"
                src={logo}
                className="h-12 w-auto rounded-full hidden sm:block"
              />
              <div className="text-gray-300 font-semibold text-lg sm:text-xl">
                Kiruna <span className="text-blue-300">eXplorer</span>
              </div>
            </div>

            {/* Navigation links (Documents and Diagram) */}
            <div className="flex space-x-2 ml-10 items-center"> 
              <Link
                to="/"
                onClick={() => setActiveTab("home")}
                className={`text-yellow-300 hover:text-yellow-400 text-base font-semibold px-2 py-1 no-underline mr-2 ${
                  activeTab === "home" ? "border-b-2 border-yellow-400" : "border-transparent"
                } hover:bg-yellow-500/20 rounded-md transition-all duration-300`}
              >
                Home
              </Link>
              <Link
                to="/documents"
                onClick={() => setActiveTab("documents")}
                className={`text-yellow-300 hover:text-yellow-400 text-base font-semibold px-2 py-1 no-underline ${
                  activeTab === "documents" ? "border-b-2 border-yellow-400" : "border-transparent"
                } hover:bg-yellow-500/20 rounded-md transition-all duration-300`}
              >
                Documents
              </Link>
              {/* Show ChevronRight and "Links" if the previous path is "/documents" */}
              {previousPath === "/documents" && (
                <>
                <ChevronRightIcon className=" text-yellow-300 h-5 w-5" />
                <div className={`text-yellow-300 hover:text-yellow-400 text-base font-semibold px-2 py-1 no-underline ${
                  activeTab === "links" ? "border-b-2 border-yellow-400 " : "border-transparent"
                } hover:bg-yellow-500/20 rounded-md transition-all duration-300`}>
                  
                  <span className="text-base font-semibold">Links</span>
                </div>
                </>
              )}
              {/*<Link
                to="/diagram"
                onClick={() => setActiveTab("diagram")}
                className={`text-yellow-300 hover:text-yellow-400 text-base font-semibold px-2 py-1 no-underline ${
                  activeTab === "diagram" ? "border-t-0 border-b-2 border-yellow-400" : "border-transparent"
                } hover:bg-yellow-500/20 rounded-md transition-all duration-300`}
              >
                Diagram
              </Link>*/}
            </div>
          </div>

          {/* Right-aligned login/logout buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/*<ButtonHomePage />*/}
            {!props.isLogged ? (
              <>
                <LoginButton />
              </>
            ) : (
              <>   
                <LogoutButton className="ml-4" logout={props.logout} />
              </>
            )}
          </div>
        </div>
      </div>
    </Disclosure>
  );
}

export {Navbar}
