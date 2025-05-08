import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions - MillionaireWith$25</title>
        <meta name="description" content="Read and understand the terms and conditions that govern the use of the MillionaireWith$25 investment platform." />
        <meta property="og:title" content="Terms and Conditions - MillionaireWith$25" />
        <meta property="og:description" content="Read and understand the terms and conditions that govern the use of the MillionaireWith$25 investment platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://richlance.com/terms" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <div className="bg-primary-800 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-heading">
                Terms and Conditions
              </h1>
              <p className="mt-4 max-w-3xl mx-auto text-xl">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="py-16 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose prose-blue max-w-none">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the MillionaireWith$25 platform ("Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use the Platform.
                </p>
                
                <h2>2. Eligibility</h2>
                <p>
                  You must be at least 18 years old to use our Platform. By using the Platform, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
                </p>
                
                <h2>3. Account Registration</h2>
                <p>
                  To use certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                
                <h2>4. Investment Risks</h2>
                <p>
                  All investments involve risk, and the past performance of a security, industry, sector, market, or financial product does not guarantee future results or returns. You are solely responsible for evaluating the risks associated with investments.
                </p>
                
                <h2>5. Referral Program</h2>
                <p>
                  Our Platform offers a referral program that allows users to earn commissions for referring new users. The terms of the referral program, including commission rates and eligibility requirements, are subject to change at our discretion.
                </p>
                
                <h2>6. Payment and Withdrawals</h2>
                <p>
                  All payments and withdrawals are processed in USDT TRC20. The minimum withdrawal amount and processing times may vary based on your account status and the payment method chosen.
                </p>
                
                <h2>7. Privacy Policy</h2>
                <p>
                  Your use of the Platform is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information.
                </p>
                
                <h2>8. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, MillionaireWith$25 shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
                </p>
                
                <h2>9. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion, without notice, for any reason, including but not limited to a breach of these Terms.
                </p>
                
                <h2>10. Changes to Terms</h2>
                <p>
                  We may modify these Terms at any time. We will provide notice of modifications by updating the date at the top of these Terms. Your continued use of the Platform following the posting of revised Terms means that you accept and agree to the changes.
                </p>
                
                <h2>11. Contact Information</h2>
                <p>
                  If you have any questions or concerns about these Terms, please contact us at support@richlance.com.
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
