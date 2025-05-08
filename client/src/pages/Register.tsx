import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Register() {
  return (
    <>
      <Helmet>
        <title>Register - MillionaireWith$25</title>
        <meta name="description" content="Create a new account on MillionaireWith$25 and start your investment journey today. Enjoy our multi-level referral system and passive income opportunities." />
        <meta property="og:title" content="Register - MillionaireWith$25" />
        <meta property="og:description" content="Create a new account on MillionaireWith$25 and start your investment journey today." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://millionairewith25.com/register" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link href="/">
                <a className="text-primary-800 font-heading font-bold text-3xl">MillionaireWith$25</a>
              </Link>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-900">
                Join MillionaireWith$25
              </h2>
              <p className="mt-2 text-center text-sm text-dark-500">
                Create your account to start your investment journey
              </p>
            </div>
            
            <RegisterForm />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
