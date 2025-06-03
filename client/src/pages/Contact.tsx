import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactUs from '@/components/home/ContactUs';

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us - ProsperityGroups</title>
        <meta name="description" content="Get in touch with the ProsperityGroups team. We're here to help you with any questions about our investment platform and genealogy-based referral system." />
        <meta property="og:title" content="Contact Us - ProsperityGroups" />
        <meta property="og:description" content="Get in touch with the ProsperityGroups team. We're here to help with any questions about our platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://prosperitygroups.com/contact" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <div className="bg-primary-800 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-heading">
                Contact Us
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl">
                Have questions or need assistance? Our team is here to help!
              </p>
            </div>
          </div>
          
          <ContactUs />
          
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
                  Frequently Asked Questions
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-xl text-dark-500 sm:mt-4">
                  Find answers to common questions about ProsperityGroups
                </p>
              </div>
              
              <div className="mt-12 max-w-3xl mx-auto space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-dark-900">How do I start investing?</h3>
                  <p className="mt-2 text-gray-600">
                    Getting started is simple! Create an account, deposit funds into your wallet, and then choose from our range of investment plans. Your earnings will begin accumulating immediately.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-dark-900">How does the referral system work?</h3>
                  <p className="mt-2 text-gray-600">
                    Our multi-level referral system allows you to earn commissions from up to 5 levels of referrals. Share your unique referral link with others, and when they join and invest, you'll earn commissions based on their investments.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-dark-900">How can I withdraw my earnings?</h3>
                  <p className="mt-2 text-gray-600">
                    You can withdraw your earnings at any time through your dashboard. We support multiple withdrawal methods including cryptocurrency (USDT TRC20) and PayPal.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-dark-900">Is my investment secure?</h3>
                  <p className="mt-2 text-gray-600">
                    Absolutely! We employ industry-leading security measures to protect your investments and personal information. Our platform uses advanced encryption and secure payment processing methods.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
