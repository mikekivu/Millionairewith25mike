import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartData {
  name: string;
  investment: number;
  profit: number;
}

interface InvestmentPerformanceProps {
  data: ChartData[];
  isLoading?: boolean;
}

export default function InvestmentPerformance({ data, isLoading = false }: InvestmentPerformanceProps) {
  const [timeRange, setTimeRange] = useState('30');
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Investment Performance</CardTitle>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 w-full bg-gray-100 animate-pulse flex items-center justify-center">
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter data based on selected time range
  const filteredData = data.slice(-parseInt(timeRange));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Investment Performance</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} USDT`} />
              <Legend />
              <Area
                type="monotone"
                dataKey="investment"
                stackId="1"
                stroke="#3B82F6"
                fill="#93C5FD"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stackId="1"
                stroke="#10B981"
                fill="#6EE7B7"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function InvestmentPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Investment Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500">Investment performance chart will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  );
}
