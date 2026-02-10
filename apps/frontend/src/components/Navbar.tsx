import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Home, Calendar, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getHomePath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'turf_owner') return '/dashboard/turfs';
    return '/home';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <span className="text-xl font-bold text-gray-800">TurfBook</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to={getHomePath()}
              className="flex flex-col items-center text-gray-700 hover:text-green-600 transition"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>

            {user ? (
              <>
                {user.role === 'turf_owner' && (
                  <Link
                    to="/dashboard/turfs"
                    className="flex flex-col items-center text-gray-700 hover:text-green-600 transition"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-xs mt-1">My Turfs</span>
                  </Link>
                )}
                {user.role === 'user' && (
                  <Link
                    to="/dashboard/bookings"
                    className="flex flex-col items-center text-gray-700 hover:text-green-600 transition"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs mt-1">Bookings</span>
                  </Link>
                )}
                <Link
                  to="/dashboard/profile"
                  className="flex flex-col items-center text-gray-700 hover:text-green-600 transition"
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs mt-1">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-xs mt-1">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

