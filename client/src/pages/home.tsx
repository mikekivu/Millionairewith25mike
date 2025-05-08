import { useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import StatsSection from "@/components/home/stats-section";
import FeaturesSection from "@/components/home/features-section";
import PlansSection from "@/components/home/plans-section";
import GenealogySection from "@/components/home/genealogy-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import CtaSection from "@/components/home/cta-section";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Set the document title
  useEffect(() => {
    document.title = "RichLance - Smart Investment Platform with Genealogy Tree Tracking";
  }, []);

  // Fetch investment plans for the plans section
  const { data: plans } = useQuery({
    queryKey: ["/api/plans"],
    queryFn: ({ queryKey }) => fetch(queryKey[0]).then(res => res.json()),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <PlansSection plans={plans || []} />
        <GenealogySection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
