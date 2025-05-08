import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import HeatmapVisualizer, { ReferralNode } from '@/components/ui/heatmap-visualizer';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, AlertCircle } from 'lucide-react';

export default function UserNetworkHeatmap() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/user/network-performance'],
    enabled: !!user,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-[600px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[400px]" />
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load network performance data. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    // Check if there's no data or empty referral network
    if (!data || !data.networkTree || Object.keys(data.networkTree).length === 0) {
      return (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No Network Data</AlertTitle>
          <AlertDescription>
            You don't have any referrals in your network yet. Start inviting others to see your
            network performance data here.
          </AlertDescription>
        </Alert>
      );
    }

    return <HeatmapVisualizer data={data.networkTree as ReferralNode} />;
  };

  return (
    <DashboardLayout>
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Network Performance Heatmap</h1>
          <p className="text-muted-foreground mt-2">
            Visualize your referral network's performance as a heat map. The colors indicate performance
            levels with red representing lower performance and green representing higher performance.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Network Performance</CardTitle>
              <CardDescription>
                View the performance of your referral network based on activity, investments, and 
                referrals. This visualization helps you identify which branches of your network are
                performing well and which may need attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Use This Visualization</CardTitle>
              <CardDescription>
                Understanding the network performance heatmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">Color-Coding</h3>
                  <p className="text-muted-foreground">
                    Each member in your network is represented by a box with a color indicating their performance:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><span className="font-medium text-green-500">Green (75-100%)</span>: Excellent performance</li>
                    <li><span className="font-medium text-yellow-500">Yellow (50-74%)</span>: Good performance</li>
                    <li><span className="font-medium text-orange-500">Orange (25-49%)</span>: Fair performance</li>
                    <li><span className="font-medium text-red-500">Red (0-24%)</span>: Poor performance</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">Performance Metrics</h3>
                  <p className="text-muted-foreground">
                    Performance is calculated based on multiple factors:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Active status and login frequency</li>
                    <li>Investment activity and amounts</li>
                    <li>Number of personal referrals</li>
                    <li>Depth and breadth of their referral network</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">Tips for Improvement</h3>
                  <p className="text-muted-foreground">
                    To improve the performance of your network:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Focus on branches with lower performance (red/orange)</li>
                    <li>Reach out to inactive members to re-engage them</li>
                    <li>Provide additional guidance to members who haven't referred others</li>
                    <li>Recognize and reward high performers (green)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}