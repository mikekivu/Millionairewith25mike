import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Check, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';

interface Plan {
  id: number;
  name: string;
  description: string;
  returnPercentage: string;
  minDeposit: string;
  maxDeposit: string;
  durationHours: number;
  features: string[];
  active: boolean;
}

export default function InvestmentPlans() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: plans = [], isLoading, error } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    staleTime: 300000, // 5 minutes
  });

  const handleGetStarted = (plan: Plan) => {
    if (isAuthenticated) {
      navigate('/dashboard/investments');
    } else {
      navigate('/register');
    }
  };

  if (isLoading) {
    return (
      <section id="plans" className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                Investment Plans
              </span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-slate-600 sm:mt-4">
              Loading investment plans...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="plans" className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
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

  // Filter only active plans
  const activePlans = plans.filter(plan => plan.active);

  return (
    <section id="plans" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Investment Plans
            </span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-slate-600 sm:mt-4">
            Choose the perfect investment plan that suits your financial goals and risk appetite.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-6">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-400" />
              <span>Guaranteed Returns</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-400" />
              <span>Secure Investments</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {activePlans.length > 0 ? (
          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:max-w-5xl lg:mx-auto xl:max-w-none xl:mx-0">
            {activePlans.map((plan, index) => {
              const isPopular = index === 1; // Make the second plan popular
              
              return (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isPopular ? 'border-2 border-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50' : 'hover:border-blue-300 bg-gradient-to-br from-slate-50 to-blue-50'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white m-2 shadow-lg">
                        POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={`pb-0 ${isPopular ? 'bg-gradient-to-r from-blue-100 to-purple-100' : 'bg-gradient-to-r from-slate-100 to-blue-100'}`}>
                    <h3 className="text-xl font-bold text-slate-800 font-heading">
                      {plan.name}
                    </h3>
                    <p className="text-slate-600 text-sm">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="pt-4 pb-2 flex-1 flex flex-col">
                    {/* Investment Range */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center mb-2">
                        <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                        <span className="text-sm text-gray-600">Investment Range</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        ${plan.minDeposit} - ${plan.maxDeposit}
                      </div>
                    </div>

                    {/* Returns */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-xs text-gray-600">Return</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {plan.returnPercentage}%
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-xs text-gray-600">Duration</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {plan.durationHours}h
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 flex-1">
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Instant activation
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Guaranteed returns
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Referral bonuses eligible
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            24/7 Support
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pb-6 pt-2">
                    <Button
                      onClick={() => handleGetStarted(plan)}
                      className={`w-full py-3 font-semibold transition-all duration-300 ${
                        isPopular 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                          : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black'
                      }`}
                    >
                      {isAuthenticated ? 'Invest Now' : 'Get Started'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Plans Available</h3>
            <p className="text-gray-600">Investment plans are currently being updated. Please check back soon.</p>
          </div>
        )}
        
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            All our investment plans come with guaranteed returns and competitive rates.
            <br />
            <span className="text-blue-600 font-medium">Start your investment journey today</span> and achieve your financial goals.
          </p>
        </div>
      </div>
    </section>
  );
}
