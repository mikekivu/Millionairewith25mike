import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plan } from "@shared/schema";

interface PlansSectionProps {
  plans: Plan[];
}

export default function PlansSection({ plans }: PlansSectionProps) {
  // Use mock data if API plans haven't loaded yet
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: 1,
      name: "Starter Plan",
      description: "For new investors",
      monthlyReturn: 8,
      minimumInvestment: 100,
      minimumTerm: 6,
      referralCommission: { "1": 5 },
      withdrawalFee: 10,
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: "Growth Plan",
      description: "For serious investors",
      monthlyReturn: 12,
      minimumInvestment: 500,
      minimumTerm: 12,
      referralCommission: { "1": 8, "2": 3 },
      withdrawalFee: 8,
      isActive: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      name: "Premium Plan",
      description: "For power investors",
      monthlyReturn: 18,
      minimumInvestment: 2000,
      minimumTerm: 18,
      referralCommission: { "1": 12, "2": 5, "3": 2 },
      withdrawalFee: 5,
      isActive: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Sort plans by order if available
  const sortedPlans = [...displayPlans].sort((a, b) => a.order - b.order);
  
  // Determine which plan to highlight as popular (middle one by default)
  const popularPlanIndex = Math.floor(sortedPlans.length / 2);

  return (
    <section className="py-16 bg-white" id="plans">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">Our Investment Plans</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose the investment plan that matches your financial goals and risk tolerance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sortedPlans.map((plan, index) => {
            const isPopular = index === popularPlanIndex;
            const getBgColor = (idx: number) => {
              if (idx === 0) return "border-t-4 border-primary";
              if (idx === 1) return "border-t-4 border-secondary";
              return "border-t-4 border-accent";
            };
            const getButtonColor = (idx: number) => {
              if (idx === 0) return "bg-primary hover:bg-primary-dark text-white";
              if (idx === 1) return "bg-secondary hover:bg-secondary-dark text-white";
              return "bg-accent hover:bg-accent-dark text-gray-900";
            };
            
            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-xl ${isPopular ? 'transform scale-105 relative z-10' : 'hover:transform hover:scale-105'} ${getBgColor(index)}`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-accent text-gray-900 font-bold py-1 px-4 text-sm rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className={`py-4 px-6 ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-secondary' : 'bg-accent'} ${index === 2 ? 'text-gray-900' : 'text-white'}`}>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm opacity-80">{plan.description}</p>
                </div>
                <div className="p-6">
                  <div className="flex justify-center items-center mb-6">
                    <span className={`text-4xl font-bold ${index === 0 ? 'text-primary' : index === 1 ? 'text-secondary' : 'text-accent-dark'}`}>
                      {plan.monthlyReturn}%
                    </span>
                    <span className="text-gray-600 ml-2">Monthly Return</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Min. Investment: {plan.minimumInvestment} USDT</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Contract Period: {plan.minimumTerm} months</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>
                        {plan.minimumTerm <= 6 ? 'Monthly' : 
                         plan.minimumTerm <= 12 ? 'Bi-weekly' : 
                         'Weekly'} Withdrawals
                      </span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>
                        Referral Bonus: {Object.values(plan.referralCommission)[0]}%
                        {Object.keys(plan.referralCommission).length > 1 ? 
                          ` (${Object.keys(plan.referralCommission).length} levels)` : 
                          ''}
                      </span>
                    </li>
                  </ul>
                  <Link href="/register">
                    <Button className={`w-full ${getButtonColor(index)}`}>
                      Invest Now
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
