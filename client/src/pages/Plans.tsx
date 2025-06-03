
import React from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';

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

export default function Plans() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: plans, isLoading } = useQuery<Plan[]>({
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

  return (
    <>
      <Helmet>
        <title>Investment Plans - MillionaireWith$25</title>
        <meta name="description" content="Choose from our range of investment plans designed to help you achieve financial freedom. Start your journey with MillionaireWith$25 today." />
        <meta property="og:title" content="Investment Plans - MillionaireWith$25" />
        <meta property="og:description" content="Choose from our range of investment plans designed to help you achieve financial freedom." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Investment Plans
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                  Choose the perfect investment plan that suits your financial goals and risk appetite
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                    <span>Guaranteed Returns</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                    <span>Secure Investments</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Plans Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading investment plans...</p>
                  </div>
                </div>
              ) : plans && plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plans.filter(plan => plan.active).map((plan, index) => (
                    <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                      index === 1 ? 'ring-2 ring-blue-500 scale-105' : ''
                    }`}>
                      {index === 1 && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                          Most Popular
                        </div>
                      )}
                      
                      <CardHeader className={index === 1 ? 'pt-12' : ''}>
                        <CardTitle className="text-2xl font-bold text-center text-gray-800">
                          {plan.name}
                        </CardTitle>
                        <p className="text-gray-600 text-center">{plan.description}</p>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Investment Range */}
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                            <span className="text-sm text-gray-600">Investment Range</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-800">
                            ${plan.minDeposit} - ${plan.maxDeposit}
                          </div>
                        </div>

                        {/* Returns */}
                        <div className="grid grid-cols-2 gap-4">
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
                              {plan.durationHours} hours
                            </div>
                          </div>
                        </div>

                        {/* Total Return */}
                        <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Total Return</div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {plan.returnPercentage}%
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          {plan.features && plan.features.length > 0 ? (
                            plan.features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                Instant activation
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                Guaranteed returns
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                Principal + profit return
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                Referral bonuses eligible
                              </div>
                            </>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button 
                          onClick={() => handleGetStarted(plan)}
                          className={`w-full py-3 font-semibold transition-all duration-300 ${
                            index === 1 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                              : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black'
                          }`}
                        >
                          {isAuthenticated ? 'Invest Now' : 'Get Started'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Plans Available</h3>
                  <p className="text-gray-600">Investment plans are currently being updated. Please check back soon.</p>
                </div>
              )}
            </div>
          </section>

          {/* Why Choose Our Plans Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Why Choose Our Investment Plans?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our investment plans are designed with your success in mind, offering competitive returns and maximum security.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Guaranteed Returns</h3>
                  <p className="text-gray-600">
                    All our investment plans come with guaranteed returns, ensuring your investment grows as promised.
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Competitive Rates</h3>
                  <p className="text-gray-600">
                    Our daily return rates are among the most competitive in the market, maximizing your profit potential.
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Flexible Investments</h3>
                  <p className="text-gray-600">
                    Choose from various investment ranges that suit your budget and financial goals.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
