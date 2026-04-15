import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "../_sections/HeroSection";
import FeaturesSection from "../_sections/FeaturesSection";
import HowItWorksSection from "../_sections/HowItWorksSection";
import PricingSection from "../_sections/PricingSection";

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Features */}
      <FeaturesSection />
      {/* How it works */}
      <HowItWorksSection />

      {/* Pricing */}
      <PricingSection />
      {/* Contacts */}
      <section id="contacts" className="bg-muted/40 py-24 px-6 text-center">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-3xl font-bold">Contacts</h2>
          <p className="text-muted-foreground">Any questions? Contact us.</p>
          <p className="font-medium">support@grainflow.ua</p>
        </div>
      </section>
    </>
  );
}
