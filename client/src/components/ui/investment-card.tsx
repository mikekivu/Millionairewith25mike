import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow, format } from 'date-fns';

interface InvestmentCardProps {
  investment: {
    id: number;
    planId: number;
    amount: number;
    status: string;
    startDate: string;
    endDate: string;
    plan: {
      name: string;
      monthlyReturn: number;
      durationMonths: number;
    };
  };
  onViewDetails?: (id: number) => void;
}

export function InvestmentCard({ investment, onViewDetails }: InvestmentCardProps) {
  // Calculate progress
  const startDate = new Date(investment.startDate);
  const endDate = new Date(investment.endDate);
  const currentDate = new Date();
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();
  
  // Ensure progress is between 0 and 100
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  
  // Calculate expected earnings
  const monthlyEarnings = (investment.amount * investment.plan.monthlyReturn) / 100;
  const totalExpectedEarnings = monthlyEarnings * investment.plan.durationMonths;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className={`pb-2 ${getStatusColor(investment.status)}`}>
        <div className="flex justify-between items-center">
          <CardTitle>{investment.plan.name}</CardTitle>
          <Badge variant={getVariant(investment.status)}>{investment.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Investment Amount</span>
            <span className="font-medium">{investment.amount.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monthly Return</span>
            <span className="font-medium">{investment.plan.monthlyReturn}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Expected Earnings</span>
            <span className="font-medium">{totalExpectedEarnings.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Start Date</span>
            <span className="font-medium">{format(new Date(investment.startDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">End Date</span>
            <span className="font-medium">{format(new Date(investment.endDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground text-center">
            {investment.status === 'active' ? 
              `${formatDistanceToNow(endDate, { addSuffix: true })}` : 
              `${investment.status === 'completed' ? 'Investment completed' : 'Investment terminated'}`
            }
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => onViewDetails && onViewDetails(investment.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'border-b-2 border-green-500';
    case 'completed':
      return 'border-b-2 border-blue-500';
    case 'terminated':
      return 'border-b-2 border-red-500';
    default:
      return '';
  }
}

function getVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'terminated':
      return 'destructive';
    default:
      return 'outline';
  }
}
