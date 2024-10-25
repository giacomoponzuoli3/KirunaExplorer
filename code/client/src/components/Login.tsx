import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../API/API'; // Make sure the path is correct
import { Button } from '@headlessui/react';
import { Link } from 'react-router-dom';

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
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 transition-transform transform hover:scale-105">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Login</h2>
        { !props.isLogged && props.message.type === 'danger' && (
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300"
            >
              Login
            </Button>
            <Link 
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg text-center transition duration-300"
              to={'/'}
              onClick={props.handleBack}
            >
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function LogoutButton(props: any) {
  const location = useLocation();
  const isLoginPath = location.pathname === '/login';
  return (
    <>
      { !isLoginPath ? (
        <Link className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium" to="/" onClick={props.logout}>
          Logout
        </Link>
      ) : null }
    </>
  );
}

function LoginButton(props: any) {
  const location = useLocation();
  const isLoginPath = location.pathname === '/login';
  return (
    <>
      { !isLoginPath ? (
        <Link to={'/login'}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
        >
          Login
        </Link>
      ) : null }
    </>
  );
}

export { Login, LogoutButton, LoginButton };
