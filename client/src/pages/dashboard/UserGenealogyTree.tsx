import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UserSidebar from '@/components/dashboard/UserSidebar';
import { GenealogyTree } from '@/components/ui/genealogy-tree';
import ReferralTools from '@/components/dashboard/ReferralTools';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { GitBranchPlus, NetworkIcon, Users, Share2 } from 'lucide-react';

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
    active: boolean;
  };
}

interface TreeNode {
  id: number;
  name: string;
  level: number;
  children?: TreeNode[];
  isActive?: boolean;
}

export default function UserGenealogyTree() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<TreeNode | null>(null);

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/user/dashboard'],
    staleTime: 60000, // 1 minute
  });

  const { data: referrals, isLoading: isLoadingReferrals } = useQuery<Record<string, Referral[]>>({
    queryKey: ['/api/user/referrals'],
    staleTime: 60000, // 1 minute
  });

  // Build tree data structure from referrals
  useEffect(() => {
    if (referrals && user) {
      // Create root node (current user)
      const root: TreeNode = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        level: 0,
        isActive: true,
        children: []
      };

      // Helper function to find a node in the tree by ID (recursive)
      const findNodeById = (node: TreeNode, id: number): TreeNode | null => {
        if (node.id === id) return node;
        if (!node.children) return null;
        
        for (const child of node.children) {
          const found = findNodeById(child, id);
          if (found) return found;
        }
        
        return null;
      };

      // Process level 1 referrals (direct)
      const level1Referrals = referrals['1'] || [];
      
      for (const ref of level1Referrals) {
        const childNode: TreeNode = {
          id: ref.referredUser.id,
          name: `${ref.referredUser.firstName} ${ref.referredUser.lastName}`,
          level: 1,
          isActive: ref.referredUser.active,
          children: []
        };
        
        root.children!.push(childNode);
      }

      // Process higher level referrals
      for (let level = 2; level <= 5; level++) {
        const levelReferrals = referrals[level.toString()] || [];
        
        for (const ref of levelReferrals) {
          // Find the parent node in the tree
          // This is simplified - in a real system, you'd need to know the actual parent ID
          // Here we're just attaching level 2 to the first level 1 node, level 3 to first level 2, etc.
          // A real implementation would need proper parent-child relationships
          
          // For demo purposes, we'll randomly assign parents
          if (level === 2 && root.children && root.children.length > 0) {
            // For level 2, pick a random level 1 parent
            const randomIndex = Math.floor(Math.random() * root.children.length);
            const parentNode = root.children[randomIndex];
            
            if (parentNode) {
              if (!parentNode.children) parentNode.children = [];
              
              parentNode.children.push({
                id: ref.referredUser.id,
                name: `${ref.referredUser.firstName} ${ref.referredUser.lastName}`,
                level: level,
                isActive: ref.referredUser.active,
                children: []
              });
            }
          } else if (level > 2) {
            // For higher levels, just append to the first available parent
            // This is just for visualization purposes
            // A real implementation would need the actual parent-child relationships
            const potentialParents: TreeNode[] = [];
            
            const findPotentialParents = (node: TreeNode, targetLevel: number) => {
              if (node.level === targetLevel - 1) {
                potentialParents.push(node);
                return;
              }
              
              if (node.children) {
                for (const child of node.children) {
                  findPotentialParents(child, targetLevel);
                }
              }
            };
            
            findPotentialParents(root, level);
            
            if (potentialParents.length > 0) {
              const randomIndex = Math.floor(Math.random() * potentialParents.length);
              const parentNode = potentialParents[randomIndex];
              
              if (parentNode) {
                if (!parentNode.children) parentNode.children = [];
                
                parentNode.children.push({
                  id: ref.referredUser.id,
                  name: `${ref.referredUser.firstName} ${ref.referredUser.lastName}`,
                  level: level,
                  isActive: ref.referredUser.active,
                  children: []
                });
              }
            }
          }
        }
      }

      setTreeData(root);
    }
  }, [referrals, user]);

  // Generate referral link based on user info
  const referralLink = user ? `${window.location.origin}/register?ref=${user.referralCode}` : '';

  // Count total referrals across all levels
  const countTotalReferrals = () => {
    if (!referrals) return 0;
    
    return Object.values(referrals).reduce((total, levelReferrals) => {
      return total + levelReferrals.length;
    }, 0);
  };

  // Check if there are ANY referrals
  const hasAnyReferrals = referrals && Object.values(referrals).some(level => level.length > 0);

  return (
    <>
      <Helmet>
        <title>Genealogy Tree - RichLance</title>
        <meta name="description" content="Visualize your RichLance referral network with our interactive genealogy tree." />
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-64 lg:w-72">
          <UserSidebar />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Genealogy Tree</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Referrals</p>
                      <p className="text-2xl font-bold">
                        {isLoadingReferrals 
                          ? <span className="animate-pulse">Loading...</span>
                          : countTotalReferrals()
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
                      <p className="text-sm text-gray-500">Network Depth</p>
                      <p className="text-2xl font-bold">
                        {isLoadingReferrals 
                          ? <span className="animate-pulse">Loading...</span>
                          : hasAnyReferrals 
                            ? `${Object.keys(referrals || {}).length} Levels` 
                            : '0 Levels'
                        }
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                      <NetworkIcon className="h-5 w-5" />
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
                      <GitBranchPlus className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>My Network Visualization</CardTitle>
                    <CardDescription>
                      Interactive view of your referral network across all levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReferrals ? (
                      <div className="flex justify-center items-center h-[400px]">
                        <p>Loading genealogy tree...</p>
                      </div>
                    ) : treeData ? (
                      <div className="overflow-auto">
                        <GenealogyTree data={treeData} width={800} height={600} />
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center h-[400px]">
                        <GitBranchPlus className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-muted-foreground text-center">
                          Your genealogy tree is empty. Start inviting people using your referral link!
                        </p>
                        <Button className="mt-4" onClick={() => {
                          if (referralLink) {
                            navigator.clipboard.writeText(referralLink);
                            toast({
                              title: "Copied!",
                              description: "Referral link copied to clipboard",
                            });
                          }
                        }}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Copy Referral Link
                        </Button>
                      </div>
                    )}
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
                <CardTitle>Referral Levels</CardTitle>
                <CardDescription>
                  View detailed information about your referrals at each level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="1">
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
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground mb-2">
                            Level {level} referrals ({referrals[level.toString()].length}) - 
                            Commission rate: {level === 1 ? '10%' : 
                                              level === 2 ? '5%' : 
                                              level === 3 ? '3%' : 
                                              level === 4 ? '2%' : '1%'}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {referrals[level.toString()].map(referral => (
                              <Card key={referral.id} className="bg-gray-50">
                                <CardContent className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                                      {referral.referredUser.firstName[0]}{referral.referredUser.lastName[0]}
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {referral.referredUser.firstName} {referral.referredUser.lastName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Joined: {new Date(referral.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Commission earned:</span>
                                      <span className="font-medium text-green-600">
                                        {formatCurrency(referral.commissionAmount, 'USDT')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                      <span className="text-muted-foreground">Status:</span>
                                      <span className={`font-medium ${referral.referredUser.active ? 'text-green-600' : 'text-gray-500'}`}>
                                        {referral.referredUser.active ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
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
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
