import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/auth';
import { Menu, X } from 'lucide-react';
import logoImage from '@/assets/logoo.png';

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
      // Clear all queries to reset the app state
      queryClient.clear();
      // Invalidate user auth state
      queryClient.setQueryData(['/api/auth/me'], null);
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });
      
      // Redirect to home page
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
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  <img src={logoImage} alt="MillionaireWith$25 Logo" className="h-10 w-auto mr-2" />
                  <span className="text-primary-800 font-heading font-bold text-xl md:text-2xl">MillionaireWith$25</span>
                </a>
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-primary-500 text-primary-800' 
                    : 'border-transparent text-dark-500 hover:border-dark-300 hover:text-dark-700'
                }`}>
                  Home
                </a>
              </Link>
              <Link href="/#plans">
                <a className="border-transparent text-dark-500 hover:border-dark-300 hover:text-dark-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Investment Plans
                </a>
              </Link>
              <Link href="/about">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/about') 
                    ? 'border-primary-500 text-primary-800' 
                    : 'border-transparent text-dark-500 hover:border-dark-300 hover:text-dark-700'
                }`}>
                  About Us
                </a>
              </Link>
              <Link href="/contact">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/contact') 
                    ? 'border-primary-500 text-primary-800' 
                    : 'border-transparent text-dark-500 hover:border-dark-300 hover:text-dark-700'
                }`}>
                  Contact
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button variant="default" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'border-primary-500 text-primary-800 bg-primary-50' 
                  : 'border-transparent text-dark-500 hover:bg-gray-50 hover:border-gray-300 hover:text-dark-700'
              }`}>
                Home
              </a>
            </Link>
            <Link href="/#plans">
              <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-dark-500 hover:bg-gray-50 hover:border-gray-300 hover:text-dark-700">
                Investment Plans
              </a>
            </Link>
            <Link href="/about">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/about') 
                  ? 'border-primary-500 text-primary-800 bg-primary-50' 
                  : 'border-transparent text-dark-500 hover:bg-gray-50 hover:border-gray-300 hover:text-dark-700'
              }`}>
                About Us
              </a>
            </Link>
            <Link href="/contact">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/contact') 
                  ? 'border-primary-500 text-primary-800 bg-primary-50' 
                  : 'border-transparent text-dark-500 hover:bg-gray-50 hover:border-gray-300 hover:text-dark-700'
              }`}>
                Contact
              </a>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-dark-500 hover:bg-gray-50 hover:border-gray-300 hover:text-dark-700">
                    Dashboard
                  </a>
                </Link>
                <a 
                  onClick={handleLogout}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-dark-500 hover:bg-gray-50 hover:border-gray-300 hover:text-dark-700 cursor-pointer"
                >
                  Logout
                </a>
              </div>
            ) : (
              <div className="space-y-1">
                <Link href="/login">
                  <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-dark-500 hover:bg-gray-50 hover:border-gray-300 hover:text-dark-700">
                    Login
                  </a>
                </Link>
                <Link href="/register">
                  <a className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-dark-500 hover:bg-gray-50 hover:border-gray-300 hover:text-dark-700">
                    Register
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
