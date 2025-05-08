import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function GenealogySection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold mb-4">
              Unique Feature
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Grow Your Network, Multiply Your Earnings</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our revolutionary genealogy-tree model allows you to earn commissions from the people you refer, as well as from the people they refer. Build a powerful network that generates passive income for years to come.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="18" y1="8" x2="23" y2="13"></line>
                    <line x1="23" y1="8" x2="18" y2="13"></line>
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">Level 1 (Direct Referrals)</h4>
                  <p className="text-gray-600">Earn up to 12% commission on all investments made by your direct referrals.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">Level 2 (Indirect Referrals)</h4>
                  <p className="text-gray-600">Earn up to 5% commission on investments made by people your referrals bring in.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <path d="M20 8v6"></path>
                    <path d="M23 11h-6"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">Level 3 (Extended Network)</h4>
                  <p className="text-gray-600">Earn up to 2% commission from your extended network with our Premium plan.</p>
                </div>
              </div>
            </div>
            
            <Link href="/register">
              <Button size="lg" className="mt-4">
                Start Building Your Network
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Your Potential Genealogy Tree</h3>
            
            <div className="relative">
              {/* Root node (You) */}
              <div className="flex justify-center mb-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shadow-lg border-4 border-white">
                    YOU
                  </div>
                </div>
              </div>
              
              {/* Connecting lines */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-px h-8 border-l-2 border-dashed border-gray-300"></div>
              <div className="absolute top-24 left-0 right-0 h-px border-t-2 border-dashed border-gray-300"></div>
              
              {/* Level 1 Nodes */}
              <div className="flex justify-between mb-10">
                <div className="relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 border-l-2 border-dashed border-gray-300"></div>
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-medium shadow border-2 border-white text-sm">R1</div>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 border-l-2 border-dashed border-gray-300"></div>
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-medium shadow border-2 border-white text-sm">R2</div>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 border-l-2 border-dashed border-gray-300"></div>
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-medium shadow border-2 border-white text-sm">R3</div>
                </div>
              </div>
              
              {/* Level 2 Indicators */}
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-gray-900 text-xs font-medium shadow mx-auto">+4</div>
                  <p className="text-xs text-gray-500 mt-1">Referrals</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-gray-900 text-xs font-medium shadow mx-auto">+6</div>
                  <p className="text-xs text-gray-500 mt-1">Referrals</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-gray-900 text-xs font-medium shadow mx-auto">+5</div>
                  <p className="text-xs text-gray-500 mt-1">Referrals</p>
                </div>
              </div>
              
              <div className="mt-10 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600 font-medium">Potential Monthly Earnings</p>
                <p className="text-2xl font-bold text-primary mt-2">$1,240 USDT</p>
                <p className="text-sm text-gray-500 mt-1">Based on Premium Plan with full referral network</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
