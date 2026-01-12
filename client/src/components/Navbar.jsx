import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight text-blue-400">
          GigFlow
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-gray-300">Dashboard</Link>
          
          {user ? (
            <>
              <span className="text-gray-400 hidden md:inline">
                Welcome, {user.name}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-bold transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}