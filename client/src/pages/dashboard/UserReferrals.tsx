import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { DataTable } from '@/components/dashboard/DataTable';
import ReferralTools from '@/components/dashboard/ReferralTools';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/lib/auth';
import { Users, Share2, BadgeCheck, BadgeX, User, DollarSign } from 'lucide-react';
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

  // Calculate total number of direct referrals (level 1 only)
  const calculateTotalReferrals = () => {
    if (!referrals || !referrals['1']) return 0;
    return referrals['1'].length;
  };

  // Calculate total earnings from direct referrals
  const calculateTotalEarnings = () => {
    if (!referrals || !referrals['1']) return 0;
    return referrals['1'].length * 20; // $20 per referral
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
      header: 'Reward',
      cell: () => {
        return (
          <span className="text-green-600 font-medium">
            $20.00
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
        <meta name="description" content="Manage your ProsperityGroups referrals and earn $20 for each successful referral." />
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
                      <p className="text-sm text-gray-500">Active Referrals</p>
                      <p className="text-2xl font-bold">
                        {isLoadingReferrals 
                          ? <span className="animate-pulse">Loading...</span>
                          : referrals && referrals['1'] ? referrals['1'].filter(r => r.referredUser.active).length : 0
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
                      <p className="text-sm text-gray-500">Total Earnings</p>
                      <p className="text-2xl font-bold">
                        ${calculateTotalEarnings()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Reward Per Referral</p>
                      <p className="text-2xl font-bold">
                        $20
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800">
                      <Share2 className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Referral Program</CardTitle>
                    <CardDescription>
                      Earn $20 for every friend who joins and makes their first investment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">$20</div>
                        <div className="text-lg font-medium text-green-800">Per Successful Referral</div>
                        <div className="text-sm text-green-600 mt-2">Paid instantly to your account</div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-700">{calculateTotalReferrals()}</div>
                          <div className="text-sm text-green-600">Total Referrals</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-700">${calculateTotalEarnings()}</div>
                          <div className="text-sm text-green-600">Total Earned</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <h4 className="font-semibold">How it works:</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center mr-3">1</span>
                          Share your referral link with friends
                        </div>
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center mr-3">2</span>
                          Friend registers and makes their first investment
                        </div>
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center mr-3">3</span>
                          You receive $20 in your account instantly
                        </div>
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
                <CardTitle>My Referrals</CardTitle>
                <CardDescription>
                  View all your successful referrals and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReferrals ? (
                  <div className="py-8 text-center">
                    <p>Loading referrals...</p>
                  </div>
                ) : referrals && referrals['1'] && referrals['1'].length > 0 ? (
                  <DataTable 
                    columns={columns} 
                    data={referrals['1']} 
                    searchColumn="referredUser.firstName"
                    searchPlaceholder="Search referrals..."
                  />
                ) : (
                  <div className="py-8 text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No referrals yet</p>
                    <Button 
                      variant="outline"
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
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  Start sharing your referral link to earn $20 for every friend who joins and invests!
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}