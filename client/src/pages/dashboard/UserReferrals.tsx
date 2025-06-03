import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { DataTable } from '@/components/dashboard/DataTable';
import ReferralTools from '@/components/dashboard/ReferralTools';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/lib/auth';
import { Users, Share2, BadgeCheck, BadgeX, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Referral {
  id: number;
  referrerId: number;
  referredId: number;
  level: number;
  commissionRate: string;
  commissionAmount: string;
  status: string;
  createdAt: string;
  referredUser: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    walletBalance?: string;
    active: boolean;
    profileImage?: string;
  };
}

export default function UserReferrals() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('1');

  const { data: referrals, isLoading: isLoadingReferrals } = useQuery<Record<string, Referral[]>>({
    queryKey: ['/api/user/referrals'],
    staleTime: 60000, // 1 minute
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/user/dashboard'],
    staleTime: 60000, // 1 minute
  });

  // Generate referral link based on user info
  const referralLink = user ? `${window.location.origin}/register?ref=${user.referralCode}` : '';

  // Calculate total number of referrals
  const calculateTotalReferrals = () => {
    if (!referrals) return 0;
    
    return Object.values(referrals).reduce((total, levelReferrals) => {
      return total + levelReferrals.length;
    }, 0);
  };

  // Calculate total earnings from each level
  const calculateLevelEarnings = (level: number) => {
    if (!referrals || !referrals[level.toString()]) return 0;
    
    return referrals[level.toString()].reduce((total, referral) => {
      return total + parseFloat(referral.commissionAmount);
    }, 0);
  };

  const columns: ColumnDef<Referral>[] = [
    {
      accessorKey: 'referredUser.firstName',
      header: 'Name',
      cell: ({ row }) => {
        const referredUser = row.original.referredUser;
        if (!referredUser) {
          return <div>No user data</div>;
        }
        
        const firstName = referredUser.firstName || '';
        const lastName = referredUser.lastName || '';
        const initials = (firstName ? firstName[0] : '') + (lastName ? lastName[0] : '');
        
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-2 font-medium">
              {initials || 'U'}
            </div>
            <span>{firstName} {lastName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'referredUser.email',
      header: 'Email',
      cell: ({ row }) => {
        if (!row.original.referredUser) {
          return <div>No email available</div>;
        }
        return row.original.referredUser.email || 'No email available';
      },
    },
    {
      accessorKey: 'referredUser.active',
      header: 'Status',
      cell: ({ row }) => {
        if (!row.original.referredUser) {
          return (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center w-fit">
              <BadgeX className="h-3 w-3 mr-1" />
              Unknown
            </Badge>
          );
        }
        
        const isActive = row.original.referredUser.active;
        
        return isActive ? (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center w-fit">
            <BadgeCheck className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center w-fit">
            <BadgeX className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      },
    },
    {
      accessorKey: 'commissionRate',
      header: 'Commission Rate',
      cell: ({ row }) => {
        return `${row.getValue('commissionRate')}%`;
      },
    },
    {
      accessorKey: 'commissionAmount',
      header: 'Earnings',
      cell: ({ row }) => {
        return (
          <span className="text-green-600 font-medium">
            {formatCurrency(row.getValue('commissionAmount'), 'USDT')}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined Date',
      cell: ({ row }) => {
        return formatDate(row.getValue('createdAt') as string);
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Referrals - ProsperityGroups</title>
        <meta name="description" content="Manage your ProsperityGroups referrals and track your commissions." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <UserSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">My Referrals</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Referrals</p>
                      <p className="text-2xl font-bold">
                        {isLoadingReferrals 
                          ? <span className="animate-pulse">Loading...</span>
                          : calculateTotalReferrals()
                        }
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Level 1 Referrals</p>
                      <p className="text-2xl font-bold">
                        {isLoadingReferrals 
                          ? <span className="animate-pulse">Loading...</span>
                          : referrals && referrals['1'] ? referrals['1'].length : 0
                        }
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Referral Earnings</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(dashboardStats?.referralEarnings || '0', 'USDT')}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                      <Share2 className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Commission Rate</p>
                      <p className="text-2xl font-bold">
                        5 Levels
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Structure</CardTitle>
                    <CardDescription>
                      Earn commissions from up to 5 levels in your network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <span className="font-medium">Level</span>
                        <span className="font-medium">Commission Rate</span>
                        <span className="font-medium">Your Referrals</span>
                        <span className="font-medium">Total Earned</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Badge variant="outline" className="bg-primary-100 text-primary-800 mr-2">1</Badge>
                          Level 1 (Direct)
                        </span>
                        <span>10%</span>
                        <span>{isLoadingReferrals ? "-" : referrals && referrals['1'] ? referrals['1'].length : 0}</span>
                        <span className="text-green-600">{formatCurrency(calculateLevelEarnings(1), 'USDT')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Badge variant="outline" className="bg-primary-50 text-primary-800 mr-2">2</Badge>
                          Level 2
                        </span>
                        <span>5%</span>
                        <span>{isLoadingReferrals ? "-" : referrals && referrals['2'] ? referrals['2'].length : 0}</span>
                        <span className="text-green-600">{formatCurrency(calculateLevelEarnings(2), 'USDT')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Badge variant="outline" className="bg-primary-50 text-primary-800 mr-2">3</Badge>
                          Level 3
                        </span>
                        <span>3%</span>
                        <span>{isLoadingReferrals ? "-" : referrals && referrals['3'] ? referrals['3'].length : 0}</span>
                        <span className="text-green-600">{formatCurrency(calculateLevelEarnings(3), 'USDT')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Badge variant="outline" className="bg-primary-50 text-primary-800 mr-2">4</Badge>
                          Level 4
                        </span>
                        <span>2%</span>
                        <span>{isLoadingReferrals ? "-" : referrals && referrals['4'] ? referrals['4'].length : 0}</span>
                        <span className="text-green-600">{formatCurrency(calculateLevelEarnings(4), 'USDT')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Badge variant="outline" className="bg-primary-50 text-primary-800 mr-2">5</Badge>
                          Level 5
                        </span>
                        <span>1%</span>
                        <span>{isLoadingReferrals ? "-" : referrals && referrals['5'] ? referrals['5'].length : 0}</span>
                        <span className="text-green-600">{formatCurrency(calculateLevelEarnings(5), 'USDT')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <ReferralTools 
                  referralCode={user?.referralCode || ''} 
                  referralLink={referralLink}
                />
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Referral Details</CardTitle>
                <CardDescription>
                  View detailed information about your referrals at each level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="1">Level 1</TabsTrigger>
                    <TabsTrigger value="2">Level 2</TabsTrigger>
                    <TabsTrigger value="3">Level 3</TabsTrigger>
                    <TabsTrigger value="4">Level 4</TabsTrigger>
                    <TabsTrigger value="5">Level 5</TabsTrigger>
                  </TabsList>
                  
                  {[1, 2, 3, 4, 5].map(level => (
                    <TabsContent key={level} value={level.toString()}>
                      {isLoadingReferrals ? (
                        <div className="py-8 text-center">
                          <p>Loading referrals...</p>
                        </div>
                      ) : referrals && referrals[level.toString()] && referrals[level.toString()].length > 0 ? (
                        <DataTable 
                          columns={columns} 
                          data={referrals[level.toString()]} 
                          searchColumn="commissionRate"
                          searchPlaceholder="Search referrals..."
                        />
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">No level {level} referrals found</p>
                          {level === 1 && (
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => {
                                if (referralLink) {
                                  navigator.clipboard.writeText(referralLink);
                                  toast({
                                    title: "Copied!",
                                    description: "Referral link copied to clipboard",
                                  });
                                }
                              }}
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Referral Link
                            </Button>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  The more people you refer, the more you earn! Share your referral link and build your network.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
