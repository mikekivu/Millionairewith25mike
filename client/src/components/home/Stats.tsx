import { Users, CreditCard, LineChart, Globe } from 'lucide-react';

export default function Stats() {
  const stats = [
    { 
      label: 'Active Users', 
      value: '18,500+', 
      icon: Users,
      description: 'Investors worldwide'
    },
    { 
      label: 'Total Invested', 
      value: '$16.8M+', 
      icon: CreditCard,
      description: 'In active investments'
    },
    { 
      label: 'Total Payouts', 
      value: '$4.2M+', 
      icon: LineChart,
      description: 'Profits distributed'
    },
    { 
      label: 'Countries', 
      value: '45+', 
      icon: Globe,
      description: 'Global community'
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="relative overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl border border-amber-100"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 opacity-20"></div>
                
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 p-3 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
                    {stat.value}
                  </h3>
                  
                  <p className="mt-2 text-lg font-semibold text-gray-800">
                    {stat.label}
                  </p>
                  
                  <p className="mt-1 text-sm text-gray-600">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
