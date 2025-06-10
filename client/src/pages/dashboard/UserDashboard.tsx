import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { TrendingUp, Users, DollarSign, Clock, Share2, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { UserStatsCards } from '@/components/dashboard/StatsCards';
import InvestmentPerformance from '@/components/dashboard/InvestmentPerformance';
import ReferralTools from '@/components/dashboard/ReferralTools';

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/user/dashboard'],
    staleTime: 60000, // 1 minute
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['/api/user/transactions'],
    staleTime: 60000, // 1 minute
  });

  const { data: referrals } = useQuery({
    queryKey: ['/api/user/referrals'],
    staleTime: 60000, // 1 minute
  });

  // Calculate referral stats
  const totalReferrals = referrals && referrals['1'] ? referrals['1'].length : 0;
  const referralEarnings = totalReferrals * 20; // $20 per referral

  const referralLink = user ? `${window.location.origin}/register?ref=${user.referralCode}` : '';

  const handleCopyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  if (isLoadingStats) {
    return (
      <div className="min-h-screen flex">
        <UserSidebar 
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex-1 bg-gray-50 md:ml-0">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - ProsperityGroups</title>
        <meta name="description" content="Manage your ProsperityGroups investments and track your portfolio performance." />
      </Helmet>

      <div className="min-h-screen flex">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Dashboard</h1>
            <div></div>
          </div>
        </div>

        {/* Sidebar */}
        <UserSidebar 
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 pt-16 md:pt-0 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                <span className="hidden md:inline">Welcome back, </span>
                <span className="md:hidden">Hi, </span>
                {user?.firstName || user?.username || 'User'}!
              </h1>
            </div>

            <UserStatsCards stats={{
                totalBalance: user?.walletBalance || dashboardStats?.walletBalance || '0',
                totalInvestments: dashboardStats?.totalInvested || '0',
                totalEarnings: dashboardStats?.totalEarnings || '0',
                referralCount: dashboardStats?.referralCount || 0,
              }} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2 space-y-6">
                <InvestmentPerformance />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentTransactions && recentTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {recentTransactions.slice(0, 5).map((transaction: any) => (
                          <div key={transaction.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                            <div>
                              <p className="font-medium">{transaction.type}</p>
                              <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                            </div>
                            <div className={`font-medium ${
                              transaction.type === 'deposit' || transaction.type === 'referral_bonus' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {transaction.type === 'deposit' || transaction.type === 'referral_bonus' ? '+' : '-'}
                              {formatCurrency(transaction.amount, transaction.currency || 'USDT')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent transactions</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Referral Program
                    </CardTitle>
                    <CardDescription>
                      Earn $20 for every successful referral
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">${referralEarnings}</div>
                          <div className="text-sm text-green-600">Total Earned</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold">{totalReferrals}</div>
                          <div className="text-xs text-gray-500">Referrals</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">$20</div>
                          <div className="text-xs text-gray-500">Per Referral</div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleCopyReferralLink}
                        className="w-full"
                        size="sm"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Copy Referral Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <ReferralTools 
                  referralCode={user?.referralCode || ''} 
                  referralLink={referralLink}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Invested:</span>
                        <span className="font-medium">{formatCurrency(dashboardStats?.totalInvested || '0', 'USDT')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Earnings:</span>
                        <span className="font-medium text-green-600">{formatCurrency(dashboardStats?.totalEarnings || '0', 'USDT')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Referral Bonus:</span>
                        <span className="font-medium text-blue-600">${referralEarnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Wallet Balance:</span>
                        <span className="font-medium">{formatCurrency(dashboardStats?.walletBalance || '0', 'USDT')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}