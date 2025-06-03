import { Link } from 'wouter';
import Logo from '@/components/Logo';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Send, CreditCard, Bitcoin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 border-t border-orange-900/20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <Logo size="md" className="mr-3" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500 font-heading font-bold text-xl">PG</span>
            </div>
            <p className="mt-2 text-base text-gray-300">
              A leading investment platform combining strategic investments with innovative multi-level network marketing.
            </p>
            <div className="mt-6 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-400 mb-2">Payment Methods</h4>
              <div className="flex items-center space-x-3">
                <div className="flex items-center p-2 bg-white/10 rounded">
                  <CreditCard className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-sm text-gray-300">PayPal</span>
                </div>
                <div className="flex items-center p-2 bg-white/10 rounded">
                  <Bitcoin className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-300">USDT (TRC20)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-orange-500 tracking-wider uppercase">
              Investment
            </h3>
            <ul role="list" className="mt-4 space-y-4">
              <li>
                <Link href="/#plans">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Investment Plans
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    How it Works
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/#referral">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Referral System
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/#testimonials">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Success Stories
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-orange-500 tracking-wider uppercase">
              Support
            </h3>
            <ul role="list" className="mt-4 space-y-4">
              <li>
                <Link href="/contact">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Help Center
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Contact Us
                  </div>
                </Link>
              </li>
              <li>
                <a href="mailto:info@prosperitygroups.com" className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  info@prosperitygroups.com
                </a>
              </li>
              <li>
                <Link href="/terms">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Privacy Policy
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Terms of Service
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-orange-500 tracking-wider uppercase">
              Account
            </h3>
            <ul role="list" className="mt-4 space-y-4">
              <li>
                <Link href="/register">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Register
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/login">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Login
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/dashboard">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    Dashboard
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="text-base text-gray-300 hover:text-orange-300 transition-colors duration-200 cursor-pointer">
                    FAQ
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-orange-900/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 w-full md:w-auto">
              <form className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 sm:max-w-xs border-gray-700 rounded-md bg-gray-800 text-gray-300 text-base"
                  placeholder="Enter your email"
                />
                <div className="rounded-md sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 min-h-[48px]"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Subscribe
                  </button>
                </div>
              </form>
              <p className="mt-3 text-sm text-gray-400">
                Get updates on investment opportunities and platform news.
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6">
              <Link href="/terms">
                <div className="text-sm text-gray-400 hover:text-orange-300 transition-colors duration-200 cursor-pointer py-2">
                  Privacy Policy
                </div>
              </Link>
              <Link href="/terms">
                <div className="text-sm text-gray-400 hover:text-orange-300 transition-colors duration-200 cursor-pointer py-2">
                  Terms of Service
                </div>
              </Link>
              <Link href="/terms">
                <div className="text-sm text-gray-400 hover:text-orange-300 transition-colors duration-200 cursor-pointer py-2">
                  Cookie Policy
                </div>
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-base text-gray-400 mb-2">
              &copy; {new Date().getFullYear()} ProsperityGroups. All rights reserved.
            </p>
            <div className="border-t border-gray-800 pt-4">
              <p className="text-sm text-gray-500">
                Developed & Designed By <span className="text-orange-400 font-semibold">Web Expert Solutions</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}