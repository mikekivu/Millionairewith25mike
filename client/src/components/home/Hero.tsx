import { Link } from 'wouter';

export default function Hero() {
  return (
    <section id="home" className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-dark-900 sm:text-5xl md:text-6xl font-heading">
                <span className="block xl:inline">Grow your wealth with</span>{' '}
                <span className="block text-primary-700 xl:inline">intelligent investing</span>
              </h1>
              <p className="mt-3 text-base text-dark-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Join our exclusive investment platform with multi-level referral rewards. Start your journey to financial freedom today.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href="/register">
                    <a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800 md:py-4 md:text-lg md:px-10">
                      Get started
                    </a>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="#plans">
                    <a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10">
                      View plans
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1573497491765-dccce02b29df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1050&h=1050"
          alt="Investment team discussing strategy"
        />
      </div>
    </section>
  );
}
