"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import WhyDifferent from "@/components/why-different"
import SearchDemo from "@/components/search-demo"
import SocialProof from "@/components/social-proof"
import Team from "@/components/team"
import DemoVideo from "@/components/demo-video"
import PricingTeaser from "@/components/pricing-teaser"
import Faq from "@/components/faq"
import FinalCta from "@/components/final-cta"
import Footer from "@/components/footer"

// Dynamic imports for heavy components to improve initial load time
const DynamicFooter = dynamic(() => import("@/components/footer"), {
  ssr: true,
  loading: () => <div className="h-32 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded" />
})

const DynamicFaq = dynamic(() => import("@/components/faq"), {
  ssr: true,
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded" />
})

const DynamicTeam = dynamic(() => import("@/components/team"), {
  ssr: true,
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded" />
})

export default function Page() {
  return (
    <main>
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
  )
}

