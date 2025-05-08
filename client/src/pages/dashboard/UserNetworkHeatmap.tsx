import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatMapVisualizer } from "@/components/ui/heatmap-visualizer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function UserNetworkHeatmap() {
  // Fetch network performance data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/user/network-performance'],
    retry: 1,
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-transparent bg-clip-text">
          Network Performance Heatmap
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Network Performance Heat Map */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">Referral Network Performance</span>
              </CardTitle>
              <CardDescription>
                Visualize your referral network's performance with color-coded indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-[500px] w-full rounded-xl" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error loading network data</AlertTitle>
                  <AlertDescription>
                    There was a problem loading your network performance data. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : data ? (
                <HeatMapVisualizer data={data} height={600} />
              ) : (
                <div className="text-center py-10">
                  <p>No network data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2" />
                <span>How to Read the Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">Performance Score</h3>
                  <p className="text-gray-600 mb-4">
                    Each person in your network is assigned a performance score from 0-100 based on:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Account activity status (50%)</li>
                    <li>Investment amount (30%)</li>
                    <li>Recent transaction activity (20%)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Color Coding</h3>
                  <p className="text-gray-600 mb-2">
                    The heatmap uses color intensity to show performance:
                  </p>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-red-900 mr-2"></div>
                      <span>Dark Red: 80-100% (Excellent performance)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-red-600 mr-2"></div>
                      <span>Medium Red: 60-79% (Good performance)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-red-400 mr-2"></div>
                      <span>Light Red: 40-59% (Average performance)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-orange-300 mr-2"></div>
                      <span>Light Orange: 20-39% (Needs improvement)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-orange-200 mr-2"></div>
                      <span>Very Light Orange: 0-19% (Poor performance)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}