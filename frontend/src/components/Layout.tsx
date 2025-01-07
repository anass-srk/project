import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { Role } from '@/types/enums';

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full bg-white/50 dark:bg-dark-800/100 backdrop-blur-md border-b border-gray-200 dark:border-neon-blue/10 sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:h-16">
            <div className="flex justify-between h-16 md:h-auto">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  TransportApp
                </span>
              </Link>
              <div className="flex items-center space-x-4 md:hidden">
                <ThemeToggle />
                {user && (
                  <button
                    onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
                    className="text-gray-700 hover:text-neon-blue dark:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div id="mobile-menu" className="hidden md:flex md:items-center">
              {user ? (
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 py-4 md:py-0">
                  <Link to="/schedule" className="text-gray-700 hover:text-neon-blue dark:text-gray-300 transition-colors">
                    Schedule
                  </Link>
                  <Link to="/tickets" className="text-gray-700 hover:text-neon-blue dark:text-gray-300 transition-colors">
                    My Tickets
                  </Link>
                  <Link to="/subscriptions" className="text-gray-700 hover:text-neon-blue dark:text-gray-300 transition-colors">
                    Subscriptions
                  </Link>
                  {user.role === Role.ADMIN && (
                    <div className="relative group">
                      <button className="text-gray-700 hover:text-neon-blue dark:text-gray-300 transition-colors w-full md:w-auto text-left">
                        Administration
                      </button>
                      <div className="md:absolute left-0 w-48 mt-2 py-2 card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <Link
                          to="/admin/routes"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-neon-blue dark:text-gray-300 hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
                        >
                          Manage Routes
                        </Link>
                        <Link
                          to="/admin/drivers"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-neon-blue dark:text-gray-300 hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
                        >
                          Manage Drivers
                        </Link>
                        <Link
                          to="/admin/buses"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-neon-blue dark:text-gray-300 hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
                        >
                          Manage Buses
                        </Link>
                        <Link
                          to="/admin/trips"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-neon-blue dark:text-gray-300 hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
                        >
                          Manage Trips
                        </Link>
                        <Link
                          to="/admin/subscription-types"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-neon-blue dark:text-gray-300 hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
                        >
                          Manage Subscriptions
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="hidden md:block">
                    <ThemeToggle />
                  </div>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 w-full md:w-auto">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center text-white font-semibold">
                        {user.firstName[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {user.firstName}
                      </span>
                    </button>
                    <div className="md:absolute right-0 w-48 mt-2 py-2 card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-neon-blue dark:text-gray-300 hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
                      >
                        Profile Settings
                      </Link>
                      <Link
                        to="/notifications"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-neon-blue dark:text-gray-300 hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
                      >
                        Notification Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:text-neon-blue dark:text-gray-300 hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <Link to="/login">
                    <Button variant="secondary">Sign in</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full bg-gradient-to-b from-light-900 to-light-800 dark:from-dark-900 dark:to-dark-800">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}