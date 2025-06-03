import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/home/Hero';
import AboutUs from '@/components/home/AboutUs';
import InvestmentPlans from '@/components/home/InvestmentPlans';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ReferralProgram from '@/components/home/ReferralProgram';
import HowItWorks from '@/components/home/HowItWorks';
import Stats from '@/components/home/Stats';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import ContactUs from '@/components/home/ContactUs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>ProsperityGroups - Simple Investment Platform</title>
        <meta name="description" content="Join ProsperityGroups and start your investment journey with our simple referral program. Earn $20 for every successful referral." />
        <meta property="og:title" content="ProsperityGroups - Investment & Genealogy Platform" />
        <meta property="og:description" content="Join our exclusive investment platform with multi-level referral rewards. Start your journey to financial freedom today." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://prosperitygroups.com" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <Hero />
          <Stats />
          <InvestmentPlans />
          <WhyChooseUs />
          <ReferralProgram />
          <HowItWorks />
          <Testimonials />
          <AboutUs />
          <ContactUs />
          <CallToAction />
        </main>
        
        <Footer />
      </div>
    </>
  );
}