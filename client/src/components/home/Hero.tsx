import React from 'react';
import { Link } from 'wouter';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, TrendingUp, DollarSign, Users, ChevronRight } from 'lucide-react';

// Sample data for visualizations
const profitData = [
  { month: 'Jan', profit: 1000 },
  { month: 'Feb', profit: 1800 },
  { month: 'Mar', profit: 2600 },
  { month: 'Apr', profit: 3900 },
  { month: 'May', profit: 5400 },
  { month: 'Jun', profit: 6800 },
  { month: 'Jul', profit: 8500 },
];

const networkData = [
  { name: 'Level 1', value: 30, fill: '#FF9500' },
  { name: 'Level 2', value: 25, fill: '#FFB800' },
  { name: 'Level 3', value: 20, fill: '#FFC933' },
  { name: 'Level 4', value: 15, fill: '#FFD966' },
  { name: 'Level 5', value: 10, fill: '#FFE599' },
];

const investmentData = [
  { plan: 'Basic', amount: 25, users: 370 },
  { plan: 'Standard', amount: 1000, users: 210 },
  { plan: 'Premium', amount: 10000, users: 90 },
];

export default function Hero() {
  return (
    <section id="home" className="pt-10 pb-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 mb-6">
                <TrendingUp className="h-4 w-4 mr-2" />
                Start with just $25 and grow your wealth
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading leading-tight">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">Grow your wealth</span>
                <span className="block text-gray-900">with intelligent investing</span>
              </h1>

              <p className="mt-5 text-lg text-gray-600 max-w-2xl">
                Join our exclusive platform combining strategic investments with multi-level network marketing. Build your team, earn referral commissions, and achieve financial freedom.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <div className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/20 cursor-pointer">
                  Get started now <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </Link>

              <Link href="#plans">
                <div className="inline-flex items-center justify-center px-6 py-3 border border-orange-300 text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 cursor-pointer">
                  View investment plans
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex gap-2 items-center text-orange-600 font-semibold mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-lg">$25</span>
                </div>
                <p className="text-sm text-gray-600">Minimum deposit to start</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                <div className="flex gap-2 items-center text-orange-600 font-semibold mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-lg">12%</span>
                </div>
                <p className="text-sm text-gray-600">Monthly ROI</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
                <div className="flex gap-2 items-center text-orange-600 font-semibold mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-lg">5 Levels</span>
                </div>
                <p className="text-sm text-gray-600">Referral commissions</p>
              </div>
            </div>
          </div>

          {/* Visualizations */}
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>

            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 py-4 px-6">
                <h3 className="text-white font-semibold text-lg">Platform Analytics</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
                  <h4 className="text-gray-600 font-medium mb-2">Profit Growth</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={profitData}>
                        <defs>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF9500" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#FF9500" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{fontSize: 10}} />
                        <YAxis tick={{fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="profit" stroke="#FF9500" fill="url(#colorProfit)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-gray-600 font-medium mb-2">Network Distribution</h4>
                  <div className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={networkData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={({name}) => name}
                        >
                          {networkData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 col-span-1 md:col-span-2 border-t border-gray-100">
                  <h4 className="text-gray-600 font-medium mb-2">Investment Plans</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={investmentData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="plan" />
                        <YAxis yAxisId="left" orientation="left" stroke="#FF9500" tick={{fontSize: 10}} />
                        <YAxis yAxisId="right" orientation="right" stroke="#FFCB33" tick={{fontSize: 10}} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="users" name="Active Users" fill="#FF9500" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="amount" name="Min. Amount ($)" fill="#FFCB33" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                <Link href="#plans">
                  <div className="text-orange-600 flex items-center text-sm font-medium hover:text-orange-700 cursor-pointer">
                    View detailed investment analytics <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}