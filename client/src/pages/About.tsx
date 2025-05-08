import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutUs from '@/components/home/AboutUs';
import Stats from '@/components/home/Stats';
import HowItWorks from '@/components/home/HowItWorks';
import CallToAction from '@/components/home/CallToAction';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us - RichLance</title>
        <meta name="description" content="Learn more about RichLance, a leading investment platform combining traditional investment strategies with innovative genealogy-based referral systems." />
        <meta property="og:title" content="About Us - RichLance" />
        <meta property="og:description" content="Learn more about RichLance, a leading investment platform with innovative genealogy-based referral systems." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://richlance.com/about" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <div className="bg-primary-800 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-heading">
                About RichLance
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl">
                Learn more about our innovative investment platform and how we're helping thousands achieve financial freedom.
              </p>
            </div>
          </div>
          
          <AboutUs />
          <Stats />
          
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
                  Our Mission
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-xl text-dark-500 sm:mt-4">
                  Empowering individuals to achieve financial independence through smart investments.
                </p>
              </div>
              
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-bold text-dark-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600">
                    We envision a world where financial independence is accessible to everyone, regardless of background or prior investment experience. Through our innovative platform, we're democratizing access to lucrative investment opportunities and creating a global community of financially empowered individuals.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-900 mb-4">Our Values</h3>
                  <p className="text-gray-600">
                    At RichLance, we operate with unwavering integrity, transparency, and a commitment to our users' success. We believe in building long-term relationships based on trust, providing exceptional support, and continuously innovating to deliver the best possible investment experience.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <HowItWorks />
          <CallToAction />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
