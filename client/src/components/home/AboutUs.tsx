import { Shield, TrendingUp, Headphones } from 'lucide-react';

export default function AboutUs() {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Your investments are secured with advanced encryption and blockchain technology. All transactions are transparent and traceable.'
    },
    {
      icon: TrendingUp,
      title: 'Proven Track Record',
      description: 'With over 5 years in operation, we\'ve helped thousands of investors grow their wealth and build successful referral networks.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you with any questions or concerns.'
    }
  ];

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
              About MillionaireWith$25
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-dark-500">
              MillionaireWith$25 is a leading investment platform combining traditional investment strategies with innovative genealogy-based referral systems. Our mission is to empower individuals to achieve financial freedom through smart investing and network building.
            </p>
            <div className="mt-8 space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-700 text-white">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-dark-900 font-heading">{feature.title}</h3>
                    <p className="mt-2 text-dark-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 lg:mt-0">
            <img 
              className="mx-auto rounded-lg shadow-xl" 
              src="https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600" 
              alt="Cryptocurrency investment concept" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
