import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    label?: string;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, change, className }: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center">
            {change.type === 'increase' ? (
              <ArrowUp className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs ${change.type === 'increase' ? 'text-emerald-500' : 'text-red-500'}`}>
              {change.value}%
            </span>
            {change.label && (
              <span className="text-xs text-muted-foreground ml-2">{change.label}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
