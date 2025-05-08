import { LucideIcon, ArrowRightCircle, Wallet, LineChart } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: LucideIcon;
  number: number;
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      title: 'Create an Account',
      description: 'Register for a free account on our platform and complete your profile setup.',
      icon: ArrowRightCircle,
      number: 1
    },
    {
      title: 'Fund Your Wallet',
      description: 'Deposit funds via PayPal or Coinbase USDT TRC20 to your secure wallet.',
      icon: Wallet,
      number: 2
    },
    {
      title: 'Choose a Plan & Earn',
      description: 'Select an investment plan, start earning, and grow your network for additional rewards.',
      icon: LineChart,
      number: 3
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
            How It Works
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-dark-500 sm:mt-4">
            Get started with RichLance in just a few simple steps.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute h-full w-px bg-primary-100 left-6 top-8 hidden md:block"></div>
                )}
                <div className="relative flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-700 text-white">
                      {step.number}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-dark-900 font-heading">{step.title}</h3>
                    <p className="mt-2 text-dark-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
