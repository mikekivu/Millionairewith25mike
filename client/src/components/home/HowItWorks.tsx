import { LucideIcon, ArrowRightCircle, Wallet, LineChart, CircleDollarSign } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: LucideIcon;
  number: number;
  bgColor: string;
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      title: 'Create an Account',
      description: 'Register for a free account on our platform and complete your profile setup.',
      icon: ArrowRightCircle,
      number: 1,
      bgColor: 'from-orange-100 to-amber-50'
    },
    {
      title: 'Fund Your Wallet',
      description: 'Deposit funds via PayPal or Coinbase USDT TRC20 to your secure wallet.',
      icon: Wallet,
      number: 2,
      bgColor: 'from-yellow-100 to-amber-50'
    },
    {
      title: 'Choose a Plan & Earn',
      description: 'Select an investment plan, start earning, and grow your network for additional rewards.',
      icon: LineChart,
      number: 3,
      bgColor: 'from-amber-100 to-yellow-50'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              How It Works
            </span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 sm:mt-4">
            Get started with ProsperityGroups in just a few simple steps.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`relative rounded-xl overflow-hidden p-6 shadow-md transition-all duration-300 hover:shadow-lg bg-gradient-to-br ${step.bgColor}`}>
                  <div className="absolute top-0 right-0 opacity-20">
                    <CircleDollarSign className="h-20 w-20 text-orange-500" />
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-xl shadow-md">
                        {step.number}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <step.icon className="h-5 w-5 mr-2 text-orange-600" />
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      
                      <p className="text-gray-700">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute h-px w-full bg-gradient-to-r from-orange-300 to-yellow-300 -bottom-4 left-0 right-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Each step is simple, secure, and designed to provide you with the best investment experience.
          </p>
        </div>
      </div>
    </section>
  );
}
