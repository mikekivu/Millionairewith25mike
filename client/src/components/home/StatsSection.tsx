import React from 'react';
import { Users, DollarSign, LineChart, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, delay }) => {
  return (
    <motion.div 
      className="p-6 rounded-lg bg-gradient-to-br from-white to-yellow-50 shadow-md border border-yellow-100 flex items-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white mr-4 shadow-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600 font-medium">{label}</p>
      </div>
    </motion.div>
  );
};

const StatsSection: React.FC = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-yellow-200"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-orange-200"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-yellow-300"></div>
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
            Our Global Impact
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of successful investors from around the world who have already started their journey to financial freedom.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Users size={24} />} 
            value="8,500+" 
            label="Active Users" 
            delay={0.1} 
          />
          <StatCard 
            icon={<DollarSign size={24} />} 
            value="$16.8M+" 
            label="Total Invested" 
            delay={0.2} 
          />
          <StatCard 
            icon={<LineChart size={24} />} 
            value="$4.2M+" 
            label="Total Payouts" 
            delay={0.3} 
          />
          <StatCard 
            icon={<Globe size={24} />} 
            value="45+" 
            label="Countries" 
            delay={0.4} 
          />
        </div>
        
        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <div className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full shadow-lg">
              <p className="text-sm font-medium">
                New members joining daily — be part of our growing community!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;