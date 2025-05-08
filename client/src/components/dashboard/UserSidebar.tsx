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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function UserSidebar() {
  const [location] = useLocation();
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
    <div className="h-screen flex flex-col bg-primary-800 text-white">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Avatar>
            <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="bg-primary-700">{getInitials(user)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-xs text-primary-200">Member</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                  location === item.href
                    ? "bg-primary-700 text-white"
                    : "text-primary-100 hover:bg-primary-700 hover:text-white"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </a>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-primary-700">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-primary-100 hover:bg-primary-700 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
