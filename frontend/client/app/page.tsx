"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import WhyDifferent from "@/components/landing/why-different";
import SearchDemo from "@/components/landing/search-demo";
import SocialProof from "@/components/landing/social-proof";
import DemoVideo from "@/components/landing/demo-video";
import PricingTeaser from "@/components/landing/pricing-teaser";
import FinalCta from "@/components/landing/final-cta";

const DynamicFooter = dynamic(() => import("@/components/landing/footer"), {
  ssr: true,
  loading: () => <div className="h-32 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />,
});

const DynamicFaq = dynamic(() => import("@/components/landing/faq"), {
  ssr: true,
  loading: () => <div className="h-96 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />,
});

const DynamicTeam = dynamic(() => import("@/components/landing/team"), {
  ssr: true,
  loading: () => <div className="h-96 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />,
});

export default function Page() {
  return (
    <main className="dropiq-landing">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyDifferent />
      <SearchDemo />
      <SocialProof />
      <DynamicTeam />
      <DemoVideo />
      <PricingTeaser />
      <DynamicFaq />
      <FinalCta />
      <DynamicFooter />
    </main>
  );
}
