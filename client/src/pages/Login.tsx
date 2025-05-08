import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginForm from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Login - RichLance</title>
        <meta name="description" content="Log in to your RichLance account to manage your investments and track your referral earnings." />
        <meta property="og:title" content="Login - RichLance" />
        <meta property="og:description" content="Log in to your RichLance account to manage your investments and track your referral earnings." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://richlance.com/login" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link href="/">
                <a className="text-primary-800 font-heading font-bold text-3xl">RichLance</a>
              </Link>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-900">
                Welcome back
              </h2>
              <p className="mt-2 text-center text-sm text-dark-500">
                Log in to your account to manage your investments
              </p>
            </div>
            
            <LoginForm />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
