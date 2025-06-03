import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/auth';
import { Menu, X, LogOut, UserCircle } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    throwOnError: false,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Clear auth token from localStorage
      localStorage.removeItem('token');
      // Clear all queries to reset the app state
      queryClient.clear();
      // Invalidate user auth state
      queryClient.setQueryData(['/api/auth/me'], null);

      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });

      // Navigate to the home page without a full page reload
      // to ensure React components update correctly
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isActive = (path: string) => {
    return location === path;
  };

  useEffect(() => {
    // Close mobile menu when location changes
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-gradient-to-r from-orange-50 to-yellow-50 shadow-md border-b border-orange-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer py-2">
                  <Logo size="md" className="mr-2 sm:mr-3" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500 font-heading font-bold text-lg sm:text-xl md:text-2xl">ProsperityGroups</span>
                </div>
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-10 sm:flex sm:space-x-10 items-center">
              <Link href="/">
                <div className={`inline-flex items-center px-2 pt-1 pb-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'border-purple-500 text-purple-700 font-semibold' 
                    : 'border-transparent text-gray-600 hover:border-blue-300 hover:text-purple-600'
                } cursor-pointer`}>
                  Home
                </div>
              </Link>
              <Link href="/#plans">
                <div className="border-transparent text-gray-600 hover:border-blue-300 hover:text-purple-600 inline-flex items-center px-2 pt-1 pb-1 border-b-2 text-sm font-medium transition-colors duration-200 cursor-pointer">
                  Investment Plans
                </div>
              </Link>
              <Link href="/about">
                <div className={`inline-flex items-center px-2 pt-1 pb-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/about') 
                    ? 'border-purple-500 text-purple-700 font-semibold' 
                    : 'border-transparent text-gray-600 hover:border-blue-300 hover:text-purple-600'
                } cursor-pointer`}>
                  About Us
                </div>
              </Link>
              <Link href="/contact">
                <div className={`inline-flex items-center px-2 pt-1 pb-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  isActive('/contact') 
                    ? 'border-purple-500 text-purple-700 font-semibold' 
                    : 'border-transparent text-gray-600 hover:border-blue-300 hover:text-purple-600'
                } cursor-pointer`}>
                  Contact
                </div>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <UserCircle className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="default" 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="text-orange-500 h-12 w-12 -mr-3"
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-orange-100 shadow-inner">
          <div className="pt-4 pb-4 space-y-2">
            <Link href="/">
              <div className={`block pl-4 pr-4 py-4 border-l-4 text-lg font-medium min-h-[48px] flex items-center ${
                isActive('/') 
                  ? 'border-purple-500 text-purple-700 bg-purple-50' 
                  : 'border-transparent text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-purple-600'
              } cursor-pointer`}>
                Home
              </div>
            </Link>
            <Link href="/#plans">
              <div className="block pl-4 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-purple-600 cursor-pointer min-h-[48px] flex items-center">
                Investment Plans
              </div>
            </Link>
            <Link href="/about">
              <div className={`block pl-4 pr-4 py-4 border-l-4 text-lg font-medium min-h-[48px] flex items-center ${
                isActive('/about') 
                  ? 'border-purple-500 text-purple-700 bg-purple-50' 
                  : 'border-transparent text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-purple-600'
              } cursor-pointer`}>
                About Us
              </div>
            </Link>
            <Link href="/contact">
              <div className={`block pl-4 pr-4 py-4 border-l-4 text-lg font-medium min-h-[48px] flex items-center ${
                isActive('/contact') 
                  ? 'border-purple-500 text-purple-700 bg-purple-50' 
                  : 'border-transparent text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-purple-600'
              } cursor-pointer`}>
                Contact
              </div>
            </Link>
          </div>
          <div className="pt-4 pb-4 border-t border-orange-100">
            {user ? (
              <div className="space-y-2">
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <div className="block pl-4 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-purple-600 cursor-pointer min-h-[48px] flex items-center">
                    Dashboard
                  </div>
                </Link>
                <div 
                  onClick={handleLogout}
                  className="block pl-4 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-purple-600 cursor-pointer min-h-[48px] flex items-center"
                >
                  Logout
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login">
                  <div className="block pl-4 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-purple-600 cursor-pointer min-h-[48px] flex items-center">
                    Login
                  </div>
                </Link>
                <Link href="/register">
                  <div className="block pl-4 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-purple-600 cursor-pointer min-h-[48px] flex items-center">
                    Register
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}