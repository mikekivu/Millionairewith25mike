import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RegisterForm from '@/components/auth/RegisterForm';
import logoImage from '@/assets/logoo.png';
import { PieChart, Pie, LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

// Sample data for visualization
const referralEarningsData = [
  { name: 'Level 1 (10%)', value: 500, fill: '#FF9500' },
  { name: 'Level 2 (5%)', value: 250, fill: '#FFB800' },
  { name: 'Level 3 (3%)', value: 150, fill: '#FFC933' },
  { name: 'Level 4 (2%)', value: 100, fill: '#FFD966' },
  { name: 'Level 5 (1%)', value: 50, fill: '#FFE599' },
];

const investmentGrowthData = [
  { month: 'Month 1', basic: 125, standard: 250, premium: 500 },
  { month: 'Month 2', basic: 150, standard: 300, premium: 650 },
  { month: 'Month 3', basic: 175, standard: 350, premium: 800 },
  { month: 'Month 4', basic: 200, standard: 400, premium: 950 },
  { month: 'Month 5', basic: 225, standard: 450, premium: 1100 },
  { month: 'Month 6', basic: 250, standard: 500, premium: 1250 },
];

export default function Register() {
  return (
    <>
      <Helmet>
        <title>Register - MillionaireWith$25</title>
        <meta name="description" content="Create a new account on MillionaireWith$25 and start your investment journey today. Enjoy our multi-level referral system and passive income opportunities." />
        <meta property="og:title" content="Register - MillionaireWith$25" />
        <meta property="og:description" content="Create a new account on MillionaireWith$25 and start your investment journey today." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://millionairewith25.com/register" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Left side - Registration form */}
            <div className="w-full lg:w-1/2 px-6 py-12 sm:px-12">
              <div className="text-center mb-8">
                <img src={logoImage} alt="MillionaireWith$25 Logo" className="h-16 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-dark-900 mb-2">
                  <span className="text-orange-500">Start Your Journey with</span>
                  <span className="text-yellow-500 block">MillionaireWith$25</span>
                </h1>
                <p className="text-gray-600 mt-2">
                  Create your account and start earning today
                </p>
              </div>
              
              <RegisterForm />
            </div>
            
            {/* Right side - Profit visualization */}
            <div className="hidden lg:block w-1/2 bg-gray-50 p-6 border-l border-gray-200">
              <div className="h-full rounded-xl bg-white p-4 flex flex-col">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Profit</h2>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-transparent bg-clip-text">Earning Visualizations</h3>
                
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Referral Commission Structure</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={referralEarningsData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="value" nameKey="name">
                          {referralEarningsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Investment Growth Projection</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={investmentGrowthData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="basic" stroke="#FFD966" activeDot={{ r: 8 }} name="Basic" />
                        <Line type="monotone" dataKey="standard" stroke="#FFB800" name="Standard" />
                        <Line type="monotone" dataKey="premium" stroke="#FF9500" strokeWidth={2} name="Premium" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="bg-orange-500 w-3 h-3 rounded-full"></div>
                    <p>Starting with just $25, watch your investments grow</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                    <div className="bg-yellow-500 w-3 h-3 rounded-full"></div>
                    <p>Multi-level referral system to boost your earnings</p>
                  </div>
                  <div className="mt-2 py-2 px-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">
                      Join now and start your journey towards financial freedom!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
