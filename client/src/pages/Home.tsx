import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import GenealogyTreeVisualization from '@/components/home/GenealogyTreeVisualization';
import RewardsSection from '@/components/home/RewardsSection';
import StatsSection from '@/components/home/StatsSection';
import HowItWorks from '@/components/home/HowItWorks';
import LiveChat from '@/components/chat/LiveChat';

// Import logo if available
import logoPng from '@assets/logoo.png';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-yellow-200 opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-orange-200 opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-10 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                Start Your Journey to Financial Freedom
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-xl">
                Join our community of successful investors and earn consistent returns through our proven investment platform. Start with as little as $25.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={logoPng} 
                  alt="MillionareWith$25 Logo" 
                  className="max-w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Investment Plans */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
              Select Your Plan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our range of investment plans designed to help you achieve your financial goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 pt-6 pb-8 px-6 text-white">
                <h3 className="text-xl font-bold mb-1">Basic Plan</h3>
                <p className="opacity-80 text-sm mb-4">Perfect for beginners</p>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$25</span>
                  <span className="ml-2 opacity-80">minimum</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>5% daily ROI</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>30-day investment period</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>3-level referral commission</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>24/7 support</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                  <Link to="/register">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Standard Plan */}
            <div className="border-2 border-yellow-500 rounded-xl overflow-hidden shadow-xl relative transform hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0">
                <div className="bg-yellow-500 text-white py-1 px-4 rounded-bl-lg text-sm font-medium">
                  Popular Choice
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 pt-6 pb-8 px-6 text-white">
                <h3 className="text-xl font-bold mb-1">Standard Plan</h3>
                <p className="opacity-80 text-sm mb-4">For serious investors</p>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$100</span>
                  <span className="ml-2 opacity-80">minimum</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>7% daily ROI</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>45-day investment period</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>4-level referral commission</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Weekly investment reports</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                  <Link to="/register">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 pt-6 pb-8 px-6 text-white">
                <h3 className="text-xl font-bold mb-1">Premium Plan</h3>
                <p className="opacity-80 text-sm mb-4">For professional investors</p>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$500</span>
                  <span className="ml-2 opacity-80">minimum</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>10% daily ROI</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>60-day investment period</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>5-level referral commission</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>VIP support with dedicated manager</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Exclusive investment opportunities</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black">
                  <Link to="/register">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Network Visualization */}
      <section className="py-16 bg-gradient-to-b from-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
              Build Your Network
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visualize the power of our 5-level referral system. As your network grows, so does your passive income.
            </p>
          </div>
          
          <div className="mt-8">
            <GenealogyTreeVisualization />
          </div>
        </div>
      </section>
      
      {/* Rewards Section */}
      <RewardsSection />
      
      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
              Success Stories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our community members who have transformed their financial futures with our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                    JD
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">John Doe</h4>
                  <p className="text-sm text-gray-500">Member since 2023</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "I started with just $100 six months ago, and today my network has grown to over 50 active members. The consistent weekly payouts have helped me quit my day job!"
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                    SM
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">Sarah Miller</h4>
                  <p className="text-sm text-gray-500">Member since 2023</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The referral system is incredible. I've built a team of over 200 people across 5 levels, and the commissions from their investments have allowed me to pay off my mortgage in just 8 months!"
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                    RJ
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">Robert Johnson</h4>
                  <p className="text-sm text-gray-500">Member since 2022</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "I was skeptical at first, but after my first successful withdrawal, I was convinced. The platform is transparent, the support team is responsive, and the returns are consistent. Highly recommended!"
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of successful investors who have already taken the first step toward financial freedom.
          </p>
          <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
            <Link to="/register">
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Live Chat Component */}
      <LiveChat userId={0} userName="Guest" />
    </div>
  );
};

export default Home;