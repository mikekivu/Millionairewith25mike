import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Check, Gift, Smartphone, Tablet, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Plan {
  id: number;
  name: string;
  description: string;
  monthlyRate: string;
  minDeposit: string;
  maxDeposit: string;
  durationDays: number;
  features: string[];
  active: boolean;
}

// Enhanced plan data with gift information
const planGifts = {
  'Basic': {
    icon: <Smartphone className="h-5 w-5" />,
    name: 'iPhone SE',
    qualification: '5+ active referrals'
  },
  'Standard': {
    icon: <Tablet className="h-5 w-5" />,
    name: 'iPad Air',
    qualification: '10+ active referrals'
  },
  'Premium': {
    icon: <Laptop className="h-5 w-5" />,
    name: 'MacBook Air',
    qualification: '15+ active referrals'
  }
};

export default function InvestmentPlans() {
  const { data: plans = [], isLoading, error } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  if (isLoading) {
    return (
      <section id="plans" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
                Investment Plans
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
                Investment Plans
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

  // Fallback to static plans if API returns empty
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: 1,
      name: 'Basic',
      description: 'Perfect for beginners looking to start their investment journey.',
      monthlyRate: '5',
      minDeposit: '25',
      maxDeposit: '1000',
      durationDays: 30,
      features: ['Min Deposit: 25 USDT', 'Max Deposit: 1,000 USDT', 'Duration: 30 days', '24/7 Support'],
      active: true
    },
    {
      id: 2,
      name: 'Standard',
      description: 'Our most popular plan for active investors.',
      monthlyRate: '8',
      minDeposit: '1000',
      maxDeposit: '10000',
      durationDays: 30,
      features: ['Min Deposit: 1,000 USDT', 'Max Deposit: 10,000 USDT', 'Duration: 30 days', '24/7 Support + Financial Advisor'],
      active: true
    },
    {
      id: 3,
      name: 'Premium',
      description: 'For serious investors seeking maximum returns.',
      monthlyRate: '12',
      minDeposit: '10000',
      maxDeposit: '50000',
      durationDays: 30,
      features: ['Min Deposit: 10,000 USDT', 'Max Deposit: 50,000 USDT', 'Duration: 30 days', 'VIP Support + Dedicated Manager'],
      active: true
    }
  ];

  return (
    <section id="plans" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              Investment Plans
            </span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 sm:mt-4">
            Choose an investment plan that matches your financial goals and unlock exclusive rewards.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:max-w-5xl lg:mx-auto xl:max-w-none xl:mx-0">
          {displayPlans.map((plan) => {
            const gift = planGifts[plan.name as keyof typeof planGifts];
            const isPopular = plan.name === 'Standard';
            
            return (
              <Card 
                key={plan.id} 
                className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isPopular ? 'border-yellow-500 shadow-md' : 'hover:border-orange-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white m-2">
                      POPULAR
                    </Badge>
                  </div>
                )}
                <CardHeader className={`pb-0 ${isPopular ? 'bg-gradient-to-r from-orange-50 to-yellow-50' : ''}`}>
                  <h3 className="text-xl font-bold text-dark-900 font-heading">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-6 pb-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-center">
                    <p className="text-center">
                      <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
                        {plan.monthlyRate}%
                      </span>
                      <span className="text-base font-medium text-gray-500 ml-1">/ month</span>
                    </p>
                  </div>
                  
                  {gift && (
                    <div className="mt-6 mb-4 px-4 py-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-3 bg-white p-2 rounded-full">
                          <Gift className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Gift: {gift.name}</p>
                          <p className="text-xs text-gray-600">Qualify with {gift.qualification}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-3 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="flex-shrink-0 text-green-500">
                          <Check className="h-5 w-5" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pb-6 pt-2">
                  <Link href="/register">
                    <Button
                      variant={isPopular ? "default" : "outline"}
                      className={`w-full ${
                        isPopular
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                          : "border-orange-500 text-orange-600 hover:bg-orange-50"
                      }`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            All plans include automatic compound interest and multi-level referral rewards.
            <br />Gifts are awarded based on qualification criteria and active referrals.
          </p>
        </div>
      </div>
    </section>
  );
}
