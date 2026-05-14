"use client"

import React, { useState, useEffect } from "react"

import GlowButton from "./glow-button"
import { Badge } from "@/components/ui/badge"
import SmoothScrollLink from "./smooth-scroll-link"
import { PlayCircle, Star, LogIn, UserPlus } from "lucide-react"
import Logo from "./logo"
import Link from "next/link"
import dynamic from "next/dynamic"
import { dashboardPath } from "@/lib/dashboard-url"

// Lazy load the heavy AnimatedCounter component
const AnimatedCounter = dynamic(() => import("./animated-counter"), {
  ssr: false,
  loading: () => <span className="text-3xl font-extrabold">200+</span>
})

export default function Hero() {
  const slideshowProducts = [
    { name: "Premium Earbuds", url: "https://m.media-amazon.com/images/I/31qGR9hxtsL._SX300_SY300_QL70_FMwebp_.jpg" },
    { name: "Wired Headphones", url: "https://rukminim1.flixcart.com/image/400/400/xif0q/headphone/s/k/s/best-performing-with-low-latency-wired-cbt-cabtronics-original-imahjhcfykzejntc.jpeg?q=70" },
    { name: "Samsung Galaxy Buds", url: "https://images.samsung.com/is/image/samsung/p6pim/in/sm-r400nzaains/gallery/in-galaxy-buds-fe-480225-sm-r400nzaains-thumb-538531516?$Q90_330_330_F_PNG$" },
    { name: "TWS Earbuds", url: "https://img.tatacliq.com/images/i23//437Wx649H/MP000000025388609_437Wx649H_202503292347271.jpeg" }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowProducts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const fullLine = "Discover the 'most reasonable price' for every 'particular product'"

  const HIGHLIGHT_CLASS =
    "bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-600 dark:from-cyan-400 dark:via-sky-400 dark:to-cyan-400"

  function highlightQuoted(text: string) {
    const parts: React.ReactNode[] = []
    const regex = /'most reasonable price'|'particular product'/g
    let lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      const idx = m.index
      if (idx > lastIndex) parts.push(text.slice(lastIndex, idx))
      const phrase = m[0]
      const inner = phrase.slice(1, -1) // remove surrounding quotes
      parts.push(
        <span key={`hl-${idx}`} className={HIGHLIGHT_CLASS}>
          {inner}
        </span>,
      )
      lastIndex = idx + phrase.length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
  }

  return (
    <header className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />

      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-cyan-900/30 dark:text-cyan-300">
                {"E-Commerce"}
              </Badge>
              <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-cyan-900/30 dark:text-cyan-300">
                {"Technology"}
              </Badge>
              <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-cyan-900/30 dark:text-cyan-300">
                {"Online shopping"}
              </Badge>
            </div>

            {/* Logo and brand name */}
            <div className="flex items-center gap-4 mb-2">
              <Logo size="xl" className="text-emerald-600 dark:text-cyan-400" />
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-600 dark:from-cyan-400 dark:via-sky-400 dark:to-cyan-400 bg-[length:200%_200%] animate-[gradientMove_8s_ease_infinite]">
                  {"DropiQ"}
                </span>
              </h1>
            </div>

            {/* Large solution statement with theme-aware pulsing glow background */}
            <div className="relative mt-3 inline-block">
              {/* Glow behind text */}
              <div className="absolute inset-0 -z-10 rounded-xl blur-2xl opacity-70 glow-bg lightGlow darkGlow" />
              <p className="relative text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white px-3 py-2">
                {highlightQuoted(fullLine)}
              </p>
            </div>

            {/* Tagline line with subtle highlight */}
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {"We compare online and offline stores (coming soon) tailored to your location. Every product has a true value, pay exactly that, nothing more, nothing less."}
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href={dashboardPath("/signup")} target="_blank" rel="noopener noreferrer">
                <GlowButton size="lg" className="w-full sm:w-auto whitespace-nowrap">
                  <UserPlus className="mr-2 h-5 w-5 shrink-0" aria-hidden="true" />
                  {"Sign Up"}
                </GlowButton>
              </Link>
              <Link href={dashboardPath("/login")} target="_blank" rel="noopener noreferrer">
                <GlowButton variant="outline" size="lg" className="w-full sm:w-auto rounded-full whitespace-nowrap">
                  <LogIn className="mr-2 h-5 w-5 shrink-0" aria-hidden="true" />
                  {"Log In"}
                </GlowButton>
              </Link>
              <SmoothScrollLink href="#demo-video">
                <GlowButton variant="outline" size="lg" className="w-full sm:w-auto rounded-full whitespace-nowrap">
                  <PlayCircle className="mr-2 h-5 w-5 shrink-0" aria-hidden="true" />
                  {"See DropiQ in Action"}
                </GlowButton>
              </SmoothScrollLink>
            </div>
          </div>

          {/* Right: Phone mockup matching reference + floating "Best Deal" card */}
          <div className="relative animate-[float_6s_ease-in-out_infinite]">
            <div className="mx-auto w-full max-w-[260px] sm:max-w-[320px]">
              {/* Device frame */}
              <div className="relative rounded-[2.2rem] border border-gray-200 bg-white shadow-xl p-3 dark:bg-slate-900 dark:border-slate-700 dark:shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                <div className="rounded-[1.8rem] overflow-hidden bg-white border border-gray-100 dark:bg-slate-950 dark:border-slate-800">
                  {/* Screen */}
                  <div className="aspect-[9/19.5]">
                    <div className="h-full w-full p-4">
                      {/* Top header */}
                      <div className="group rounded-xl py-3 text-center font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 hover:border-white/30 dark:border-slate-700/30 dark:hover:border-slate-600/40 bg-gradient-to-r from-emerald-700/40 via-lime-600/50 to-emerald-700/40 hover:from-emerald-700/55 hover:via-lime-600/65 hover:to-emerald-700/55 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] dark:from-cyan-500/20 dark:via-sky-500/25 dark:to-cyan-500/20 dark:hover:from-cyan-500/30 dark:hover:via-sky-500/35 dark:hover:to-cyan-500/30 dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                        <span className="relative z-10 drop-shadow-sm">{"DropIQ"}</span>
                      </div>

                      {/* Title and Image Slideshow */}
                      <div className="mt-4 flex flex-col items-center min-h-[140px] justify-center transition-all duration-300">
                        <img 
                          key={slideshowProducts[currentSlide].url}
                          src={slideshowProducts[currentSlide].url} 
                          alt={slideshowProducts[currentSlide].name}
                          className="h-28 object-contain mb-2 mix-blend-multiply dark:mix-blend-normal rounded-md animate-in fade-in zoom-in duration-500"
                        />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                          {slideshowProducts[currentSlide].name}
                        </h3>
                      </div>

                      {/* Rows */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-xs dark:bg-slate-900 dark:text-gray-200">
                          <span>{"Amazon"}</span>
                          <span className="font-bold text-slate-900 dark:text-gray-100">{"₹82,917"}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 ring-1 ring-emerald-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:ring-cyan-700">
                          <span>{"Best Buy"}</span>
                          <span className="font-extrabold">{"₹78,767"}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-xs dark:bg-slate-900 dark:text-gray-200">
                          <span>{"Apple"}</span>
                          <span className="font-bold text-slate-900 dark:text-gray-100">{"₹82,917"}</span>
                        </div>

                        <div className="flex flex-col rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{"Digital Plaza (Offline)"}</span>
                            <span className="font-bold">{"₹77,500"}</span>
                          </div>
                          <span className="text-[10px] opacity-70">{"MG Road, Bangalore"}</span>
                        </div>

                        <div className="flex flex-col rounded-lg bg-lime-50 px-3 py-2 text-xs text-lime-800 ring-1 ring-lime-200 dark:bg-lime-900/20 dark:text-lime-300 dark:ring-lime-700">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{"Smart Electronics"}</span>
                            <span className="font-bold">{"₹77,900"}</span>
                          </div>
                          <span className="text-[10px] opacity-70">{"Indiranagar, Bangalore"}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white shadow-md transform scale-105">
                          <span className="font-bold">{"Least Price Ever!"}</span>
                          <span className="font-extrabold">{"₹77,500"}</span>
                        </div>

                        <div className="rounded-lg bg-emerald-100 px-3 py-1 text-center text-[11px] font-semibold text-emerald-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                          {"Save up to ₹5,417"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Speaker notch */}
                <div className="absolute left-1/2 top-2 -translate-x-1/2">
                  <div className="h-1 w-16 rounded-full bg-gray-300 dark:bg-slate-700" />
                </div>
              </div>
            </div>

            {/* Floating best deal card */}
            <div className="hidden sm:block absolute -right-6 bottom-10">
              <div className="w-64 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-[0_0_30px_rgba(34,211,238,0.18)]">
                <div className="text-base font-semibold text-slate-900 dark:text-white">{"Best Deal"}</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-gray-300">{"Price"}</span>
                    <span className="font-extrabold text-emerald-600 dark:text-cyan-400">{"₹78,767"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-gray-300">{"Rating"}</span>
                    <div className="flex">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 stroke-yellow-400" aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                      {"Best Value Score: 95"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  /* Soft pulsing for the glow behind the paragraph */
  @keyframes glowPulse {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
      filter: blur(24px);
    }
    50% {
      opacity: 1;
      transform: scale(1.06);
      filter: blur(28px);
    }
  }

  .glow-bg {
    animation: glowPulse 4s ease-in-out infinite;
  }

  /* Light theme: soft green glow */
  .lightGlow {
    background: radial-gradient(
      80% 70% at 50% 50%,
      rgba(16,185,129,0.32),
      rgba(16,185,129,0.18) 40%,
      transparent 70%
    );
  }

  /* Dark theme: cyan gradient glow (overrides in dark mode) */
  :global(.dark) .darkGlow {
    background: radial-gradient(
      80% 70% at 50% 50%,
      rgba(34,211,238,0.34),
      rgba(14,165,233,0.22) 40%,
      transparent 70%
    );
  }
`}</style>
    </header>
  )
}
