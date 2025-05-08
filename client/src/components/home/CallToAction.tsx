import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function CallToAction() {
  return (
    <section className="bg-primary-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-heading">
          <span className="block">Ready to get started?</span>
          <span className="block text-primary-200">Join MillionaireWith$25 today and start growing your wealth.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link href="/register">
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-primary-800 bg-white hover:bg-gray-50"
              >
                Create Account
              </Button>
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link href="/login">
              <Button 
                variant="default" 
                size="lg" 
                className="bg-primary-700 hover:bg-primary-600"
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
