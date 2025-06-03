import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth, User } from '@/lib/auth';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  GitBranchPlus,
  History,
  Users,
  Settings,
  LogOut,
  BarChart4,
  Mail,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import { Logo } from '@/components/Logo';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function UserSidebar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Wallet',
      href: '/dashboard/wallet',
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: 'Investments',
      href: '/dashboard/investments',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: 'Genealogy Tree',
      href: '/dashboard/genealogy',
      icon: <GitBranchPlus className="h-5 w-5" />,
    },
    {
      title: 'Transactions',
      href: '/dashboard/transactions',
      icon: <History className="h-5 w-5" />,
    },
    {
      title: 'Referrals',
      href: '/dashboard/referrals',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Messages',
      href: '/dashboard/messages',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      title: 'Network Heatmap',
      href: '/dashboard/network-heatmap',
      icon: <BarChart4 className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
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
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-900 to-blue-950 text-white shadow-xl overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-6">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center mb-8">
            <Logo size="md" className="shadow-lg" />
            <div className="ml-2">
              <h1 className="text-xl font-bold text-white">
                <span className="text-orange-500">Millionare</span>
                <span className="text-yellow-400">With$25</span>
              </h1>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 mb-8 bg-blue-800/50 p-3 rounded-lg border border-blue-700">
            <Avatar className="h-12 w-12 ring-2 ring-blue-500">
              <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-700 to-blue-800 text-lg">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-xs bg-green-500 text-green-950 px-2 py-0.5 rounded-full inline-block font-semibold">Member</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all w-full",
                    location === item.href
                      ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  )}
                >
                  <span className={cn(
                    "mr-3 p-2 rounded-md",
                    location === item.href
                      ? "bg-blue-500/30"
                      : "bg-blue-900/30"
                  )}>
                    {item.icon}
                  </span>
                  {item.title}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-blue-800 bg-gradient-to-b from-blue-900 to-blue-950">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-blue-100 hover:bg-blue-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}