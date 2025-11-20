import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-[#3b82f6]">E-Commerce</h1>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link
                to="/shop"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/shop')
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Shop
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/orders')
                        ? 'bg-[#3b82f6] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          isActive('/admin')
                            ? 'bg-[#3b82f6] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Admin Panel
                      </Link>
                      <Link
                        to="/manageorders"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          isActive('/manageorders')
                            ? 'bg-[#3b82f6] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Manage Orders
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <User className="h-6 w-6 text-gray-700" />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <LogOut className="h-6 w-6 text-gray-700" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 