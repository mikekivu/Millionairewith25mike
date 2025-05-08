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
  MailQuestion
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminSidebar() {
  const [location] = useLocation();
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
    <div className="h-screen flex flex-col bg-dark-900 text-white">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Avatar>
            <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="bg-dark-800">{getInitials(user)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-xs text-primary-200">Administrator</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                  location === item.href
                    ? "bg-dark-700 text-white"
                    : "text-gray-300 hover:bg-dark-700 hover:text-white"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </a>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-dark-700">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:bg-dark-700 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
