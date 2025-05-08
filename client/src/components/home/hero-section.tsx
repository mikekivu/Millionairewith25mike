import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90"></div>
      
      <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-28 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight mb-6">
              Build Your Wealth Through Smart Investments
            </h1>
            <p className="text-xl text-white opacity-90 mb-8 max-w-lg">
              Join thousands of investors who are growing their wealth using our innovative genealogy-based investment platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button size="lg" variant="accent" className="w-full sm:w-auto">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/plans">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-white">
                  View Investment Plans
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            {/* Investment dashboard image */}
            <div className="rounded-lg shadow-2xl overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 w-full">
                <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                <span className="sr-only">Investment Platform Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
