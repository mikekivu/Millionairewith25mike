import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth, User } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  LineChart,
  Settings,
  LogOut,
  MailQuestion,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import logo from '@/assets/logo.png';
import Logo from '@/components/Logo';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Members',
      href: '/admin/members',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Withdrawals',
      href: '/admin/withdrawals',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: 'Deposits',
      href: '/admin/deposits',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'Investment Plans',
      href: '/admin/plans',
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      title: 'Payment Settings',
      href: '/admin/payment-settings',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: 'Contact Messages',
      href: '/admin/messages',
      icon: <MailQuestion className="h-5 w-5" />,
    },
    {
      title: 'Admin Withdraw',
      href: '/admin/withdraw',
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // Navigate to home page after logout
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 w-72 h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 text-white shadow-xl transform transition-transform duration-300 ease-in-out md:transform-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Logo and Brand */}
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <Logo size="lg" className="shadow-lg" />
              <div className="ml-2">
                <h1 className="text-lg md:text-xl font-bold text-white">
                  <span className="text-orange-500">Prosperity</span>
                  <span className="text-yellow-400">Groups</span>
                </h1>
              </div>
            </div>

            {/* Admin Info */}
            <div className="flex items-center space-x-3 mb-6 md:mb-8 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <Avatar className="h-10 md:h-12 w-10 md:w-12 ring-2 ring-red-500">
                <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-sm md:text-lg">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white text-sm md:text-base truncate">{`${user.firstName} ${user.lastName}`}</p>
                <p className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full inline-flex items-center font-semibold">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 md:space-y-2">
              {navItems.map((item) => (
                <div key={item.href} className="w-full">
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center px-3 md:px-4 py-2 md:py-3 text-sm font-medium rounded-lg transition-all w-full cursor-pointer",
                        location === item.href
                          ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-md"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                      onClick={() => {
                        if (onMobileClose) onMobileClose();
                      }}
                    >
                      <span className={cn(
                        "mr-3 p-1.5 md:p-2 rounded-md flex-shrink-0",
                        location === item.href
                          ? "bg-gray-600/50"
                          : "bg-gray-800/50"
                      )}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white text-sm md:text-base"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 md:h-5 w-4 md:w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}