import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function CallToAction() {
  return (
    <section className="bg-primary-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-heading">
          <span className="block">Ready to get started?</span>
          <span className="block text-primary-200">Join ProsperityGroups today and start growing your wealth.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#2B97CA] to-[#1E7BA8] hover:from-[#1E7BA8] hover:to-[#155F86] text-white shadow-lg shadow-[#2B97CA]/20"
              >
                Create Account
              </Button>
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link href="/login">
              <Button 
                variant="outline"
                size="lg" 
                className="border-[#2B97CA] text-[#2B97CA] bg-white hover:bg-gradient-to-r hover:from-[#2B97CA] hover:to-[#1E7BA8] hover:text-white hover:border-transparent"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
