import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { UserStatsCards } from '@/components/dashboard/StatsCards';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatCurrency, formatDate, calculateEndDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { TrendingUp, Plus, Calendar, Target, ArrowUpRight } from 'lucide-react';
import InvestModal from '@/components/dashboard/InvestModal';

interface Plan {
  id: number;
  name: string;
  monthlyRate: string;
  minDeposit: string;
  maxDeposit: string;
  durationDays: number;
  description: string;
  features: string[];
}

interface Investment {
  id: number;
  userId: number;
  planId: number;
  amount: string;
  status: string;
  createdAt: string;
  endDate: string;
  profit: string;
  plan: Plan;
}

export default function UserInvestments() {
  const { toast } = useToast();
  const [investModalOpen, setInvestModalOpen] = useState(false);

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/user/dashboard'],
    staleTime: 60000, // 1 minute
  });

  const { data: investments, isLoading: isLoadingInvestments } = useQuery<Investment[]>({
    queryKey: ['/api/user/investments'],
    staleTime: 60000, // 1 minute
  });

  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    staleTime: 300000, // 5 minutes
  });

  // Calculate days remaining and completion percentage for investments
  const calculateProgress = (createdAt: string, endDate: string) => {
    const start = new Date(createdAt).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    
    // If investment has ended
    if (now > end) return 100;
    
    // If investment is still active
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const calculateExpectedReturn = (investment: Investment) => {
    const amount = parseFloat(investment.amount);
    const rate = parseFloat(investment.plan.monthlyRate);
    const durationDays = investment.plan.durationDays;
    // Calculate monthly return and then adjust for the actual duration
    const monthlyReturn = amount * (rate / 100);
    const dailyReturn = monthlyReturn / 30;
    const totalReturn = dailyReturn * durationDays;
    return totalReturn;
  };

  const columns: ColumnDef<Investment>[] = [
    {
      accessorKey: 'plan.name',
      header: 'Plan',
      cell: ({ row }) => {
        return (
          <div className="font-medium text-primary-700">
            {row.getValue('plan.name')}
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Invested Amount',
      cell: ({ row }) => {
        return formatCurrency(row.getValue('amount'), 'USDT');
      },
    },
    {
      accessorKey: 'profit',
      header: 'Current Profit',
      cell: ({ row }) => {
        return formatCurrency(row.getValue('profit'), 'USDT');
      },
    },
    {
      accessorKey: 'plan.monthlyRate',
      header: 'Rate',
      cell: ({ row }) => {
        return <div>{row.getValue('plan.monthlyRate')}% Monthly</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const color = status === 'active' ? 'bg-green-100 text-green-800' :
                      status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800';
        
        return (
          <Badge variant="outline" className={`${color} capitalize`}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => {
        return formatDate(row.getValue('endDate') as string);
      },
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        const endDate = row.original.endDate;
        const progress = calculateProgress(createdAt, endDate);
        const daysRemaining = calculateDaysRemaining(endDate);
        
        return (
          <div className="w-full">
            <Progress value={progress} className="h-2 mb-1" />
            <div className="text-xs text-muted-foreground">
              {daysRemaining} days remaining
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Investments - ProsperityGroups</title>
        <meta name="description" content="Manage your ProsperityGroups investments and track your returns." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <UserSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Investments</h1>
              <Button onClick={() => setInvestModalOpen(true)} className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                New Investment
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Invested</p>
                      <p className="text-2xl font-bold">
                        {isLoadingStats 
                          ? <span className="animate-pulse">Loading...</span>
                          : formatCurrency(dashboardStats?.totalInvested || '0', 'USDT')
                        }
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Profit</p>
                      <p className="text-2xl font-bold">
                        {isLoadingStats 
                          ? <span className="animate-pulse">Loading...</span>
                          : formatCurrency(dashboardStats?.totalEarnings || '0', 'USDT')
                        }
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Active Investments</p>
                      <p className="text-2xl font-bold">
                        {isLoadingInvestments 
                          ? <span className="animate-pulse">Loading...</span>
                          : investments?.filter(inv => inv.status === 'active').length || 0
                        }
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                      <Target className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Completed Investments</p>
                      <p className="text-2xl font-bold">
                        {isLoadingInvestments 
                          ? <span className="animate-pulse">Loading...</span>
                          : investments?.filter(inv => inv.status === 'completed').length || 0
                        }
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>My Investments</CardTitle>
                <CardDescription>
                  Track the performance of your active and past investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingInvestments ? (
                  <div className="flex justify-center py-8">
                    <p>Loading investments...</p>
                  </div>
                ) : investments && investments.length > 0 ? (
                  <DataTable 
                    columns={columns} 
                    data={investments} 
                    searchColumn="plan.name"
                    searchPlaceholder="Search by plan name..."
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No investments found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setInvestModalOpen(true)}
                    >
                      Create your first investment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {investments && investments.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.filter(inv => inv.status === 'active').slice(0, 3).map((investment) => (
                  <Card key={investment.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        <span className="flex items-center">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          {investment.plan.name}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Invested on {formatDate(investment.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Investment Amount</span>
                          <span className="font-medium">{formatCurrency(investment.amount, 'USDT')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Profit</span>
                          <span className="font-medium text-green-600">{formatCurrency(investment.profit, 'USDT')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Expected Return</span>
                          <span className="font-medium">+{formatCurrency(calculateExpectedReturn(investment), 'USDT')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Rate</span>
                          <span className="font-medium">{investment.plan.monthlyRate}% Monthly</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">End Date</span>
                          <span className="font-medium">{formatDate(investment.endDate)}</span>
                        </div>
                        <div className="space-y-1 pt-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{calculateProgress(investment.createdAt, investment.endDate)}%</span>
                          </div>
                          <Progress value={calculateProgress(investment.createdAt, investment.endDate)} className="h-2" />
                          <div className="text-xs text-right text-muted-foreground">
                            {calculateDaysRemaining(investment.endDate)} days remaining
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <InvestModal 
        open={investModalOpen} 
        onOpenChange={setInvestModalOpen} 
        plans={plans || []}
        currentBalance={parseFloat(dashboardStats?.walletBalance || '0')}
      />
    </>
  );
}
