import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, LineChart, DollarSign, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const steps = [
  {
    id: 1,
    title: "Create Your Account",
    description: "Sign up and complete your profile in less than 5 minutes. No complicated paperwork needed.",
    icon: <UserPlus size={28} />,
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    title: "Select Your Plan",
    description: "Choose from our range of investment plans based on your goals and investment capacity.",
    icon: <LineChart size={28} />,
    color: "from-green-400 to-green-600",
  },
  {
    id: 3,
    title: "Grow Your Network",
    description: "Invite others to join your network and earn commissions from their investments.",
    icon: <DollarSign size={28} />,
    color: "from-purple-400 to-purple-600",
  },
  {
    id: 4,
    title: "Earn Rewards",
    description: "Get paid weekly while also qualifying for special rewards and bonuses.",
    icon: <Award size={28} />,
    color: "from-orange-400 to-orange-600",
  }
];

const HowItWorks: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-orange-400"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-yellow-300"></div>
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-yellow-200 opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-orange-200 opacity-40"></div>
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Our platform makes building wealth through network marketing simpler than ever before. Follow these four simple steps to get started.
          </motion.p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={step.id} 
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 h-full border border-gray-100 relative z-10 transition-transform hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-full mb-6 flex items-center justify-center text-white bg-gradient-to-r ${step.color} shadow-lg`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 mr-3 text-sm font-bold">
                    {step.id}
                  </span>
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-8 h-1 bg-gradient-to-r from-yellow-300 to-orange-400 z-0 transform -translate-x-4">
                  <div className="absolute right-0 top-1/2 w-2 h-2 rounded-full bg-orange-500 transform -translate-y-1/2"></div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="p-8 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 inline-block shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Journey?</h3>
            <p className="text-white/90 mb-6 max-w-lg mx-auto">
              Join thousands of successful investors who have already taken the first step toward financial freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                <Link to="/register">
                  Create Account
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;