import { useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  // Set the document title
  useEffect(() => {
    document.title = "About Us | RichLance";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">About RichLance</h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-primary-100">
                Learn about our mission, values, and the team behind the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
          <div className="relative max-w-xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-4 text-lg leading-6 text-gray-500">
                At RichLance, we believe in the power of community-driven investments. Our mission is to create an accessible and transparent investment platform that leverages the strength of social connections to generate wealth for our users.
              </p>
            </div>
          </div>
          <div className="mt-12 max-w-7xl mx-auto">
            {/* A team of financial professionals in a modern office setting */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <div className="h-[400px] bg-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                <span className="sr-only">Team of financial professionals in a modern office setting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gray-50 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Our Values</h2>
              <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                What drives us
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
                <div className="text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Security</h3>
                <p className="mt-2 text-base text-gray-500">
                  We prioritize the security of your investments with robust encryption and secure payment gateways.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
                <div className="text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Transparency</h3>
                <p className="mt-2 text-base text-gray-500">
                  We believe in complete transparency in all our operations, with clear reporting and accessible support.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
                <div className="text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Community</h3>
                <p className="mt-2 text-base text-gray-500">
                  We foster a community-driven approach where success is shared through our genealogy-tree model.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
                <div className="text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Performance</h3>
                <p className="mt-2 text-base text-gray-500">
                  We are committed to delivering consistent returns through strategic investments and market analysis.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
                <div className="text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Privacy</h3>
                <p className="mt-2 text-base text-gray-500">
                  We respect your privacy and ensure that your personal information is protected at all times.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
                <div className="text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Innovation</h3>
                <p className="mt-2 text-base text-gray-500">
                  We continuously evolve our platform to provide cutting-edge investment opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Meet Our Team
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
                Our team of experts brings together decades of experience in finance, technology, and customer service.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="sr-only">CEO portrait</span>
                </div>
                <div className="p-6">
                  <div className="font-medium text-lg text-gray-900">James Wilson</div>
                  <div className="text-primary text-sm mb-2">CEO & Founder</div>
                  <div className="text-gray-500 text-sm">
                    Former investment banker with 15+ years of experience in financial markets and cryptocurrency investments.
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="sr-only">CFO portrait</span>
                </div>
                <div className="p-6">
                  <div className="font-medium text-lg text-gray-900">Elena Martinez</div>
                  <div className="text-primary text-sm mb-2">Chief Financial Officer</div>
                  <div className="text-gray-500 text-sm">
                    Certified financial analyst with extensive experience in risk management and sustainable investment strategies.
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="sr-only">CTO portrait</span>
                </div>
                <div className="p-6">
                  <div className="font-medium text-lg text-gray-900">David Kim</div>
                  <div className="text-primary text-sm mb-2">Chief Technology Officer</div>
                  <div className="text-gray-500 text-sm">
                    Blockchain specialist with a background in developing secure financial applications and payment systems.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-gray-500">
                Find answers to common questions about our platform and investment model.
              </p>
            </div>
            <div className="mt-12 space-y-6 max-w-3xl mx-auto">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    How does the genealogy-tree investment model work?
                  </h3>
                  <div className="mt-2 text-base text-gray-500">
                    Our genealogy-tree model is a multi-level referral system where you earn commissions from the investments made by people you refer to the platform. Depending on your investment plan, you can earn from up to 3 levels of referrals.
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Is my investment secure?
                  </h3>
                  <div className="mt-2 text-base text-gray-500">
                    Yes, we use industry-standard security measures to protect your investments. All transactions are processed through secure payment gateways, and we employ multiple layers of encryption to safeguard your account information.
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    How can I withdraw my earnings?
                  </h3>
                  <div className="mt-2 text-base text-gray-500">
                    You can withdraw your earnings through your dashboard using our supported payment methods: PayPal or Coinbase (USDT TRC20). Withdrawals are processed within 24-48 hours after request approval.
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    What is the minimum investment amount?
                  </h3>
                  <div className="mt-2 text-base text-gray-500">
                    The minimum investment amount varies by plan, starting at 50 USDT for our Basic plan. Each plan offers different returns and referral commission structures.
                  </div>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    How do I get started?
                  </h3>
                  <div className="mt-2 text-base text-gray-500">
                    Simply create an account, verify your email, deposit funds into your wallet, and select an investment plan that matches your goals. You can then start building your referral network to maximize your earnings.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to start investing?</span>
              <span className="block text-primary-light">Join our platform today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link href="/register">
                  <Button className="py-4 px-6 bg-white text-primary hover:bg-gray-50 text-base font-medium" size="lg">
                    Get started
                  </Button>
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link href="/contact">
                  <Button className="py-4 px-6 bg-primary-dark text-white hover:bg-primary-dark/90 text-base font-medium" size="lg">
                    Contact us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
