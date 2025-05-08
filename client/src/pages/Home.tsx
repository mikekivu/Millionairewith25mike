import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import InvestmentPlans from '@/components/home/InvestmentPlans';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ReferralProgram from '@/components/home/ReferralProgram';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import AboutUs from '@/components/home/AboutUs';
import ContactUs from '@/components/home/ContactUs';
import CallToAction from '@/components/home/CallToAction';
import GenealogyVisualization from '@/components/home/GenealogyVisualization';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>MillionaireWith$25 - Investment & Genealogy Platform</title>
        <meta name="description" content="Join our exclusive investment platform with multi-level referral rewards. Start your journey to financial freedom today with MillionaireWith$25." />
        <meta property="og:title" content="MillionaireWith$25 - Investment & Genealogy Platform" />
        <meta property="og:description" content="Join our exclusive investment platform with multi-level referral rewards. Start your journey to financial freedom today." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://millionairewith25.com" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <Hero />
          <Stats />
          <InvestmentPlans />
          <WhyChooseUs />
          <ReferralProgram />
          <GenealogyVisualization />
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
