import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Check, Gift, Smartphone, Tablet, Laptop, Monitor, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: number;
  name: string;
  description?: string;
  joinAmount: string;
  requiredReferrals: number;
  totalIncome: string;
  reEntryAmount: string;
  totalIncomeAfterReEntry: string;
  rewardGift: string;
  features?: string[];
  active: boolean;
}

// Icons for each plan gift
const giftIcons = {
  'Health Product': <Gift className="h-5 w-5" />,
  'Mobile phone': <Smartphone className="h-5 w-5" />,
  'Tablet': <Tablet className="h-5 w-5" />,
  'IPad': <Tablet className="h-5 w-5" />,
  'Laptop': <Laptop className="h-5 w-5" />,
  'Holiday treatment vocation': <Plane className="h-5 w-5" />
};

export default function InvestmentPlans() {
  const { data: plansFromApi = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/plans'],
  });

  if (isLoading) {
    return (
      <section id="plans" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
                Matrix Board Plans
              </span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-dark-500 sm:mt-4">
              Loading investment plans...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="plans" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
                Matrix Board Plans
              </span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-red-500 sm:mt-4">
              Error loading plans. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Matrix Board Plans
  const matrixBoardPlans: Plan[] = [
    {
      id: 1,
      name: 'Matrix Board 1',
      joinAmount: '25',
      requiredReferrals: 15,
      totalIncome: '200',
      reEntryAmount: '25',
      totalIncomeAfterReEntry: '200',
      rewardGift: 'Health Product',
      active: true
    },
    {
      id: 2,
      name: 'Matrix Board 2',
      joinAmount: '100',
      requiredReferrals: 15,
      totalIncome: '800',
      reEntryAmount: '100',
      totalIncomeAfterReEntry: '700',
      rewardGift: 'Mobile phone',
      active: true
    },
    {
      id: 3,
      name: 'Matrix Board 3',
      joinAmount: '500',
      requiredReferrals: 15,
      totalIncome: '4000',
      reEntryAmount: '500',
      totalIncomeAfterReEntry: '3500',
      rewardGift: 'Tablet',
      active: true
    },
    {
      id: 4,
      name: 'Matrix Board 4',
      joinAmount: '1000',
      requiredReferrals: 15,
      totalIncome: '8000',
      reEntryAmount: '1000',
      totalIncomeAfterReEntry: '7000',
      rewardGift: 'IPad',
      active: true
    },
    {
      id: 5,
      name: 'Matrix Board 5',
      joinAmount: '4000',
      requiredReferrals: 15,
      totalIncome: '32000',
      reEntryAmount: '4000',
      totalIncomeAfterReEntry: '28000',
      rewardGift: 'Laptop',
      active: true
    },
    {
      id: 6,
      name: 'Matrix Board 6',
      joinAmount: '8000',
      requiredReferrals: 15,
      totalIncome: '64000',
      reEntryAmount: '8000',
      totalIncomeAfterReEntry: '56000',
      rewardGift: 'Holiday treatment vocation',
      active: true
    }
  ];

  return (
    <section id="plans" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              Matrix Board Plans
            </span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-slate-600 sm:mt-4">
            Choose a Matrix Board level that matches your financial goals and unlock exclusive rewards.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:max-w-5xl lg:mx-auto xl:max-w-none xl:mx-0">
          {matrixBoardPlans.map((plan) => {
            const giftIcon = giftIcons[plan.rewardGift as keyof typeof giftIcons] || <Gift className="h-5 w-5" />;
            const isPopular = plan.name === 'Matrix Board 3';
            
            return (
              <Card 
                key={plan.id} 
                className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  isPopular ? 'border-2 border-orange-500 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50' : 'hover:border-orange-300 bg-gradient-to-br from-slate-50 to-orange-50'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white m-2 shadow-lg">
                      POPULAR
                    </Badge>
                  </div>
                )}
                <CardHeader className={`pb-0 ${isPopular ? 'bg-gradient-to-r from-orange-100 to-yellow-100' : 'bg-gradient-to-r from-slate-100 to-orange-100'}`}>
                  <h3 className="text-xl font-bold text-slate-800 font-heading">
                    {plan.name}
                  </h3>
                </CardHeader>
                <CardContent className="pt-4 pb-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-center">
                    <p className="text-center">
                      <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
                        {plan.joinAmount}
                      </span>
                      <span className="text-base font-medium text-slate-600 ml-1">USDT</span>
                    </p>
                  </div>
                  
                  <div className="mt-6 mb-4 px-4 py-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg border border-orange-200">
                    <div className="flex items-center">
                      <div className="mr-3 bg-white p-2 rounded-full shadow-md">
                        <div className="text-orange-600">
                          {giftIcon}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Reward: {plan.rewardGift}</p>
                        <p className="text-xs text-slate-600">After referring 15 people</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3 flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-emerald-500">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-sm text-slate-700 font-medium">Total Income: <span className="text-orange-600 font-semibold">{plan.totalIncome} USDT</span></p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-emerald-500">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-sm text-slate-700 font-medium">Re-Entry: <span className="text-orange-600 font-semibold">{plan.reEntryAmount} USDT</span></p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-emerald-500">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-sm text-slate-700 font-medium">After Re-Entry: <span className="text-orange-600 font-semibold">{plan.totalIncomeAfterReEntry} USDT</span></p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-emerald-500">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-sm text-slate-700 font-medium">Required Referrals: <span className="text-orange-600 font-semibold">{plan.requiredReferrals}</span></p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pb-6 pt-2">
                  <Link href="/register">
                    <Button
                      variant={isPopular ? "default" : "outline"}
                      className={`w-full transition-all duration-300 shadow-md hover:shadow-lg ${
                        isPopular
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-orange-500/20"
                          : "border-2 border-orange-500 text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 hover:border-yellow-500"
                      }`}
                    >
                      Join Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            All plans include a multi-level referral system with exciting reward gifts.
            <br />
            <span className="text-orange-600 font-medium">Start with any Matrix Board level</span> and level up your earnings as you grow your network.
          </p>
        </div>
      </div>
    </section>
  );
}
