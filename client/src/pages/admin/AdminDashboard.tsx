import React from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import { AdminStatsCards } from '@/components/dashboard/StatsCards';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
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
        <title>Admin Dashboard - RichLance</title>
        <meta name="description" content="Manage the RichLance platform and view system statistics." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <AdminSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
            
            {/* Stats Cards */}
            <AdminStatsCards stats={dashboardStats || {}} isLoading={isLoadingStats} />
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Platform financial activity over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${formatCurrency(value, 'USDT')}`} />
                        <Legend />
                        <Line type="monotone" dataKey="deposits" stroke="#3B82F6" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="withdrawals" stroke="#EF4444" />
                        <Line type="monotone" dataKey="investments" stroke="#10B981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Investment Distribution</CardTitle>
                  <CardDescription>Distribution by investment plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Transactions</CardTitle>
                  <CardDescription>Breakdown of transaction types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
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
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData.map(d => ({ ...d, users: Math.floor(Math.random() * 500) + 100 }))}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Users and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Newly registered platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex justify-center py-8">
                      <p>Loading recent users...</p>
                    </div>
                  ) : dashboardStats?.recentUsers ? (
                    <DataTable 
                      columns={userColumns} 
                      data={dashboardStats.recentUsers} 
                      searchColumn="firstName"
                      showPagination={false}
                      pageSize={5}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent users found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest financial activities on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex justify-center py-8">
                      <p>Loading recent transactions...</p>
                    </div>
                  ) : dashboardStats?.recentTransactions ? (
                    <DataTable 
                      columns={transactionColumns} 
                      data={dashboardStats.recentTransactions} 
                      searchColumn="type"
                      showPagination={false}
                      pageSize={5}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent transactions found</p>
                    </div>
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
