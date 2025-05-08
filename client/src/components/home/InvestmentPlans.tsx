import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
              Investment Plans
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
              Investment Plans
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
      minDeposit: '100',
      maxDeposit: '1000',
      durationDays: 30,
      features: ['Min Deposit: 100 USDT', 'Max Deposit: 1,000 USDT', 'Duration: 30 days', '24/7 Support'],
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
    <section id="plans" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
            Investment Plans
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-dark-500 sm:mt-4">
            Choose an investment plan that matches your financial goals.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:max-w-5xl lg:mx-auto xl:max-w-none xl:mx-0">
          {displayPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardContent className="pt-6 flex-1 flex flex-col">
                <h3 className="text-xl font-medium text-dark-900 font-heading">{plan.name}</h3>
                <p className="mt-4 text-sm text-dark-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-primary-600">{plan.monthlyRate}%</span>
                  <span className="text-base font-medium text-dark-500">/ month</span>
                </p>
                <div className="mt-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center mt-4 first:mt-0">
                      <div className="flex-shrink-0 text-secondary-500">
                        <Check className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-sm text-dark-700">{feature}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button 
                      variant={plan.name === 'Standard' ? 'default' : 'outline'} 
                      className="w-full"
                    >
                      Select Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
