import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginForm from '@/components/auth/LoginForm';
import logoImage from '@/assets/logoo.png';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

// Sample data for visualization
const performanceData = [
  { name: 'Jan', value: 1000 },
  { name: 'Feb', value: 1500 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2400 },
  { name: 'May', value: 2600 },
  { name: 'Jun', value: 3000 },
  { name: 'Jul', value: 3500 },
];

const teamData = [
  { name: 'Team A', value: 30 },
  { name: 'Team B', value: 40 },
  { name: 'Team C', value: 30 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Login - MillionaireWith$25</title>
        <meta name="description" content="Log in to your MillionaireWith$25 account to manage your investments and track your referral earnings." />
        <meta property="og:title" content="Login - MillionaireWith$25" />
        <meta property="og:description" content="Log in to your MillionaireWith$25 account to manage your investments and track your referral earnings." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://millionairewith25.com/login" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Left side - Login form */}
            <div className="w-full lg:w-1/2 px-6 py-12 sm:px-12">
              <div className="text-center mb-8">
                <img src={logoImage} alt="MillionaireWith$25 Logo" className="h-16 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-dark-900 mb-2">
                  <span className="text-orange-500">Welcome Back to</span>
                  <span className="text-yellow-500 block">MillionaireWith$25</span>
                </h1>
                <p className="text-gray-600 mt-2">
                  Enter your credentials and login
                </p>
              </div>
              
              <LoginForm />
            </div>
            
            {/* Right side - Dashboard preview */}
            <div className="hidden lg:block w-1/2 bg-gray-50 p-6 border-l border-gray-200">
              <div className="h-full rounded-xl bg-white p-4 flex flex-col">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to</h2>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-transparent bg-clip-text">Dashboard</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-green-100 p-3 rounded-lg shadow-sm">
                    <div className="text-xs text-green-600 font-semibold">Profits</div>
                    <div className="text-lg font-bold">$1,532.28</div>
                    <div className="text-xs text-green-700">+15% ↑</div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg shadow-sm">
                    <div className="text-xs text-blue-600 font-semibold">Investments</div>
                    <div className="text-lg font-bold">$3,642.28</div>
                    <div className="text-xs text-red-700">-7% ↓</div>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg shadow-sm">
                    <div className="text-xs text-purple-600 font-semibold">Referrals</div>
                    <div className="text-lg font-bold">$1,942.28</div>
                    <div className="text-xs text-green-700">+10% ↑</div>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-700 mb-2">Performance Chart</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFB800" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#FF9500" fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">Team Members</p>
                  <div className="flex items-center">
                    <div className="w-1/3">
                      <ResponsiveContainer width="100%" height={80}>
                        <PieChart>
                          <Pie
                            data={teamData}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={35}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {teamData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-2/3 pl-4">
                      <div className="flex flex-col space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center text-xs">
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mr-2"></div>
                            <div className="text-gray-700 font-medium">Your First Name</div>
                          </div>
                        ))}
                      </div>
                    </div>
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
