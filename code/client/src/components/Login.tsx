import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@headlessui/react';
import kirunaImage from '../img/kiruna.jpg'; // Assicurati che il percorso sia corretto

function Login(props: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (props.isLogged) {
      navigate("/");
    }
  }, [props.isLogged, navigate]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    props.login(username, password);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="hidden lg:block lg:w-3/5 h-full relative">
        <div 
          className="absolute inset-0 bg-cover bg-center animate-slide" 
          style={{ backgroundImage: `url(${kirunaImage})` }}
        ></div>
      </div>
      <div className="w-full lg:w-2/5 flex justify-center items-center bg-gray-50 overflow-hidden">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 transition-transform transform hover:scale-105">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Login</h2>
          {!props.isLogged && props.message.type === 'danger' && (
            <p className="text-red-500 text-center mb-4">{props.message.msg}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <Button 
                type="submit"
                className="flex-1 bg-blue-950 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300"
              >
                Login
              </Button>
              <Link 
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg text-center transition duration-300 no-underline"
                to={'/'}
                onClick={props.handleBack}
              >
                Back
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LogoutButton(props: any) {
  const location = useLocation();
  const isLoginPath = location.pathname === '/login';
  return (
    <>
      {!isLoginPath && (
        <Link 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium no-underline" 
          to="/" 
          onClick={props.logout}
        >
          Logout
        </Link>
      )}
    </>
  );
}

function LoginButton(props: any) {
  const location = useLocation();
  const isLoginPath = location.pathname === '/login';
  return (
    <>
      {!isLoginPath && (
        <Link 
          to={'/login'}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium no-underline"
        >
          Login
        </Link>
      )}
    </>
  );
}

export { Login, LogoutButton, LoginButton };
