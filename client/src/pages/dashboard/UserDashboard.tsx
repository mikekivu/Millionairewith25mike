import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { UserStatsCards } from '@/components/dashboard/StatsCards';
import InvestmentPerformance from '@/components/dashboard/InvestmentPerformance';
import ReferralTools from '@/components/dashboard/ReferralTools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate, getTransactionStatusColor, getTransactionTypeIcon } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState([]);

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/user/dashboard'],
    staleTime: 60000, // 1 minute
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/user/transactions'],
    staleTime: 60000, // 1 minute
    select: (data) => data.slice(0, 5), // Get only the first 5 transactions
  });

  // Generate sample performance data
  useEffect(() => {
    if (dashboardStats) {
      const generateData = () => {
        const today = new Date();
        const data = [];
        const totalInvested = parseFloat(dashboardStats.totalInvested);
        const totalEarnings = parseFloat(dashboardStats.totalEarnings);
        
        // Generate data for the last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          // Calculate a growing investment amount and profit
          const dayFactor = (30 - i) / 30;
          const investment = totalInvested * dayFactor;
          const profit = totalEarnings * dayFactor;
          
          data.push({
            name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            investment: parseFloat(investment.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
          });
        }
        
        return data;
      };
      
      setPerformanceData(generateData());
    }
  }, [dashboardStats]);

  // Generate referral link based on user info
  const referralLink = user ? `${window.location.origin}/register?ref=${user.referralCode}` : '';

  return (
    <>
      <Helmet>
        <title>Dashboard - MillionaireWith$25</title>
        <meta name="description" content="Manage your investments, track your earnings, and monitor your referrals from your MillionaireWith$25 dashboard." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <UserSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard Overview</h1>
            
            <UserStatsCards stats={dashboardStats || {}} isLoading={isLoadingStats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2">
                <InvestmentPerformance 
                  data={performanceData} 
                  isLoading={isLoadingStats}
                />
              </div>
              
              <div className="lg:col-span-1">
                <ReferralTools 
                  referralCode={user?.referralCode || ''} 
                  referralLink={referralLink}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTransactions ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center p-3 bg-gray-50 rounded-md animate-pulse">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          </div>
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction) => {
                        const IconComponent = 
                          transaction.type === 'deposit' ? ArrowDownRight :
                          transaction.type === 'withdrawal' ? ArrowUpRight :
                          transaction.type === 'investment' ? TrendingUp :
                          transaction.type === 'referral' ? Users :
                          ArrowDownRight;
                        
                        const isPositive = ['deposit', 'referral'].includes(transaction.type);
                        const amountColor = isPositive ? 'text-green-600' : 'text-red-600';
                        const amountPrefix = isPositive ? '+' : '-';
                        
                        return (
                          <div key={transaction.id} className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors">
                            <div className={`flex items-center justify-center h-10 w-10 rounded-full mr-3 ${
                              transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                              transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                              transaction.type === 'investment' ? 'bg-blue-100 text-blue-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium capitalize">{transaction.type}</p>
                              <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${amountColor}`}>
                                {amountPrefix}{formatCurrency(transaction.amount, transaction.currency)}
                              </p>
                              <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-gray-500">
                      No transactions yet. Start by making a deposit!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
