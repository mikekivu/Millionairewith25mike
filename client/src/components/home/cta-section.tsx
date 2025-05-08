import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-6">Ready to Start Your Investment Journey?</h2>
        <p className="text-white text-opacity-90 text-lg max-w-3xl mx-auto mb-8">
          Join thousands of investors who are already growing their wealth with our platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/register">
            <Button size="lg" variant="accent" className="px-8 py-3 text-center font-bold rounded-md shadow-lg hover:shadow-xl transition duration-300">
              Create Your Account
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="px-8 py-3 text-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold rounded-md shadow-lg hover:shadow-xl transition duration-300 border-white">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
