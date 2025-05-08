import {
  Wallet,
  TrendingUp,
  Coins,
  Users,
  ArrowUpRight,
  DollarSign,
  ArrowDownRight,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface UserStats {
  walletBalance: string;
  totalInvested: string;
  totalEarnings: string;
  referralEarnings: string;
  activeInvestments: number;
  referralCount: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalInvested: string;
  totalDeposits: string;
  totalWithdrawals: string;
}

interface UserStatsCardsProps {
  stats: UserStats;
  isLoading?: boolean;
}

interface AdminStatsCardsProps {
  stats: AdminStats;
  isLoading?: boolean;
}

export function UserStatsCards({ stats, isLoading = false }: UserStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-gray-200 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const cards = [
    {
      title: 'Wallet Balance',
      value: formatCurrency(stats.walletBalance),
      icon: <Wallet className="h-6 w-6" />,
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-800'
    },
    {
      title: 'Total Invested',
      value: formatCurrency(stats.totalInvested),
      icon: <TrendingUp className="h-6 w-6" />,
      bgColor: 'bg-secondary-100',
      iconColor: 'text-secondary-800'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      icon: <Coins className="h-6 w-6" />,
      bgColor: 'bg-gold-100',
      iconColor: 'text-gold-800'
    },
    {
      title: 'Referral Earnings',
      value: formatCurrency(stats.referralEarnings),
      icon: <Users className="h-6 w-6" />,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-full ${card.bgColor} flex items-center justify-center ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminStatsCards({ stats, isLoading = false }: AdminStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-gray-200 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const cards = [
    {
      title: 'Total Members',
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6" />,
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-800'
    },
    {
      title: 'Active Members',
      value: stats.activeUsers,
      icon: <UserCheck className="h-6 w-6" />,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-800'
    },
    {
      title: 'Inactive Members',
      value: stats.inactiveUsers,
      icon: <UserX className="h-6 w-6" />,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-800'
    },
    {
      title: 'Total Invested',
      value: formatCurrency(stats.totalInvested),
      icon: <TrendingUp className="h-6 w-6" />,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-800'
    },
    {
      title: 'Total Deposits',
      value: formatCurrency(stats.totalDeposits),
      icon: <ArrowDownRight className="h-6 w-6" />,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-800'
    },
    {
      title: 'Total Withdrawals',
      value: formatCurrency(stats.totalWithdrawals),
      icon: <ArrowUpRight className="h-6 w-6" />,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold">
                  {typeof card.value === 'string' ? card.value : card.value && typeof card.value === 'number' ? card.value.toLocaleString() : '0'}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full ${card.bgColor} flex items-center justify-center ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
