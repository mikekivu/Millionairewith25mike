import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { AdminStatsCards } from '@/components/dashboard/StatsCards';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Menu } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  walletBalance: string;
  active: boolean;
  role: string;
  referralCode: string;
}

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  paymentMethod?: string;
}

export default function AdminDashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Fetch admin dashboard stats
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    staleTime: 60000, // 1 minute
  });

  // Generate sample data for charts
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Last 6 months
    return months.slice(currentMonth - 5, currentMonth + 1).map((month, index) => ({
      name: month,
      deposits: Math.floor(Math.random() * 50000) + 10000,
      withdrawals: Math.floor(Math.random() * 30000) + 5000,
      investments: Math.floor(Math.random() * 40000) + 15000,
    }));
  };

  const generatePieData = () => {
    return [
      { name: 'Basic Plan', value: 30 },
      { name: 'Standard Plan', value: 45 },
      { name: 'Premium Plan', value: 25 },
    ];
  };

  const chartData = generateChartData();
  const pieData = generatePieData();
  const COLORS = ['#3B82F6', '#10B981', '#FACC15'];

  // Define columns for recent users table
  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => {
        const firstName = row.getValue('firstName') as string;
        const lastName = row.original.lastName;
        
        return (
          <div className="font-medium">
            {firstName} {lastName}
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'walletBalance',
      header: 'Balance',
      cell: ({ row }) => {
        return formatCurrency(row.getValue('walletBalance'), 'USDT');
      },
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.getValue('active') as boolean;
        
        return (
          <div className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {active ? 'Active' : 'Inactive'}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Join Date',
      cell: ({ row }) => {
        return row.original.createdAt ? formatDate(row.original.createdAt) : '-';
      },
    },
  ];

  // Define columns for recent transactions table
  const transactionColumns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        return <div className="capitalize">{row.getValue('type')}</div>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        return formatCurrency(row.getValue('amount'), row.original.currency);
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        
        return (
          <div className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        return formatDate(row.getValue('createdAt') as string);
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - ProsperityGroups</title>
        <meta name="description" content="Manage the ProsperityGroups platform and view system statistics." />
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
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
            <div></div>
          </div>
        </div>

        {/* Sidebar */}
        <AdminSidebar 
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 pt-16 md:pt-0 overflow-auto">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Desktop Header */}
              <div className="hidden md:block">
                <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
              </div>
            
            {/* Stats Cards */}
            <AdminStatsCards stats={dashboardStats || {}} isLoading={isLoadingStats} />
            
            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Financial Overview</CardTitle>
                  <CardDescription className="text-sm">Platform financial activity over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 15,
                          left: 10,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value) => `${formatCurrency(value, 'USDT')}`} />
                        <Legend />
                        <Line type="monotone" dataKey="deposits" stroke="#3B82F6" activeDot={{ r: 6 }} strokeWidth={2} />
                        <Line type="monotone" dataKey="withdrawals" stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="investments" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Investment Distribution</CardTitle>
                  <CardDescription className="text-sm">Distribution by investment plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          fontSize={12}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Monthly Transactions</CardTitle>
                  <CardDescription className="text-sm">Breakdown of transaction types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 15,
                          left: 10,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value) => `${formatCurrency(value, 'USDT')}`} />
                        <Legend />
                        <Bar dataKey="deposits" fill="#3B82F6" />
                        <Bar dataKey="withdrawals" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">User Growth</CardTitle>
                  <CardDescription className="text-sm">New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData.map(d => ({ ...d, users: Math.floor(Math.random() * 500) + 100 }))}
                        margin={{
                          top: 5,
                          right: 15,
                          left: 10,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 6 }} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Users and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Recent Users</CardTitle>
                  <CardDescription className="text-sm">Newly registered platform users</CardDescription>
                </CardHeader>
                <CardContent className="px-2 md:px-6">
                  {isLoadingStats ? (
                    <div className="flex justify-center py-8">
                      <p className="text-sm">Loading recent users...</p>
                    </div>
                  ) : dashboardStats?.recentUsers ? (
                    <div className="overflow-x-auto">
                      <DataTable 
                        columns={userColumns} 
                        data={dashboardStats.recentUsers} 
                        searchColumn="firstName"
                        showPagination={false}
                        pageSize={5}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No recent users found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Recent Transactions</CardTitle>
                  <CardDescription className="text-sm">Latest financial activities on the platform</CardDescription>
                </CardHeader>
                <CardContent className="px-2 md:px-6">
                  {isLoadingStats ? (
                    <div className="flex justify-center py-8">
                      <p className="text-sm">Loading recent transactions...</p>
                    </div>
                  ) : dashboardStats?.recentTransactions ? (
                    <div className="overflow-x-auto">
                      <DataTable 
                        columns={transactionColumns} 
                        data={dashboardStats.recentTransactions} 
                        searchColumn="type"
                        showPagination={false}
                        pageSize={5}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No recent transactions found</p>
                    </div>
                  )}
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
