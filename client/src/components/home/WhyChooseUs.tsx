import React from 'react';
import { 
  Shield, 
  TrendingUp, 
  Gift, 
  Users, 
  Globe, 
  Clock,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react';

const features = [
  {
    icon: <Shield className="h-10 w-10 text-orange-500" />,
    title: 'Secure Platform',
    description: 'Your investments are protected with enterprise-grade security and encryption.'
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-yellow-500" />,
    title: 'High ROI',
    description: 'Our investment plans offer competitive returns compared to traditional banking products.'
  },
  {
    icon: <Users className="h-10 w-10 text-orange-500" />,
    title: 'Multi-Level Referrals',
    description: 'Earn commissions from your referrals up to 5 levels deep in our network structure.'
  },
  {
    icon: <Clock className="h-10 w-10 text-yellow-500" />,
    title: 'Quick Payments',
    description: 'Fast withdrawal processing with most payments approved within 24 hours.'
  },
  {
    icon: <Globe className="h-10 w-10 text-orange-500" />,
    title: 'Global Community',
    description: 'Join thousands of investors from over 100 countries around the world.'
  },
  {
    icon: <Gift className="h-10 w-10 text-yellow-500" />,
    title: 'Exclusive Rewards',
    description: 'Earn exciting gifts like iPhones, iPads, and laptops based on your investment level.'
  },
];

const gifts = [
  {
    icon: <Smartphone className="h-12 w-12 text-blue-500" />,
    name: 'iPhone 15',
    qualification: 'Qualify with Premium plan and 10+ active referrals'
  },
  {
    icon: <Tablet className="h-12 w-12 text-purple-500" />,
    name: 'iPad Pro',
    qualification: 'Qualify with Standard plan and 15+ active referrals'
  },
  {
    icon: <Laptop className="h-12 w-12 text-teal-500" />,
    name: 'MacBook Pro',
    qualification: 'Qualify with Premium plan and 20+ active referrals'
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              Why Choose MillionaireWith$25?
            </span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover the benefits that make our platform the preferred choice for smart investors.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <div className="inline-flex items-center justify-center p-3 bg-gray-50 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Gifts Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              Exclusive Gifts for Our Members
            </span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {gifts.map((gift, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-md text-center border border-gray-200"
              >
                <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-4 shadow-sm">
                  {gift.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{gift.name}</h4>
                <p className="text-gray-600 text-sm">{gift.qualification}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-gray-600 italic">
              * Gifts are awarded based on plan participation and referral activity. 
              Contact support for complete details on our rewards program.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}