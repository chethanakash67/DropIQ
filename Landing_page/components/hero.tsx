"use client"

import type React from "react"

import GlowButton from "./glow-button"
import { Badge } from "@/components/ui/badge"
import WaitlistForm from "./waitlist-form"
import SmoothScrollLink from "./smooth-scroll-link"
import { PlayCircle, Star } from "lucide-react"
import Logo from "./logo"
import dynamic from "next/dynamic"

// Lazy load the heavy AnimatedCounter component
const AnimatedCounter = dynamic(() => import("./animated-counter"), {
  ssr: false,
  loading: () => <span className="text-3xl font-extrabold">200+</span>
})

export default function Hero() {
  const fullLine =
    "We provide 'The Best' products across online and offline markets, with high 'Price vs Features' score"

  const HIGHLIGHT_CLASS =
    "bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-600 dark:from-cyan-400 dark:via-sky-400 dark:to-cyan-400"

  function highlightQuoted(text: string) {
    const parts: React.ReactNode[] = []
    const regex = /'The Best'|'Price vs Features'/g
    let lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      const idx = m.index
      if (idx > lastIndex) parts.push(text.slice(lastIndex, idx))
      const phrase = m[0]
      const inner = phrase.slice(1, -1) // remove surrounding quotes
      const startQuote = phrase[0]
      const endQuote = phrase[phrase.length - 1]
      parts.push(startQuote)
      parts.push(
        <span key={`hl-${idx}`} className={HIGHLIGHT_CLASS}>
          {inner}
        </span>,
      )
      parts.push(endQuote)
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
              {"Compare "}
              <span className="inline-block rounded-md px-2 py-1 font-semibold bg-gradient-to-r from-emerald-500/15 to-lime-500/15 ring-1 ring-emerald-300/30 dark:from-cyan-500/15 dark:to-sky-500/15 dark:ring-cyan-400/30">
                {"Prices"}
              </span>
              {" across top stores — get the "}
              <span className="inline-block rounded-md px-2 py-1 bg-gradient-to-r from-emerald-500/15 to-lime-500/15 ring-1 ring-emerald-300/30 dark:from-cyan-500/15 dark:to-sky-500/15 dark:ring-cyan-400/30">
                {"best value"}
              </span>
              {" instantly."}
            </p>

            {/* Email form */}
            <div className="mt-6 space-y-4">
              <WaitlistForm size="md" className="w-full sm:max-w-xl" />
              <div className="text-xs text-gray-500 dark:text-gray-300">{"No spam. Unsubscribe anytime."}</div>

              {/* CTAs remain below */}
              <div className="flex flex-col sm:flex-row gap-3">
                <SmoothScrollLink href="#demo-video">
                  <GlowButton size="lg" className="w-full sm:w-auto">
                    <PlayCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                    {"See DropiQ in Action"}
                  </GlowButton>
                </SmoothScrollLink>
                <SmoothScrollLink href="#final-cta">
                  <GlowButton variant="outline" size="lg" className="w-full sm:w-auto rounded-full">
                    {"Waitlist"}
                  </GlowButton>
                </SmoothScrollLink>
              </div>
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

                      {/* Title */}
                      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{"iPhone 15 Pro"}</h3>

                      {/* Rows */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-slate-900 dark:text-gray-200">
                          <span>{"Amazon"}</span>
                          <span className="font-bold text-slate-900 dark:text-gray-100">{"₹82,917"}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:ring-cyan-700">
                          <span>{"Best Buy"}</span>
                          <span className="font-extrabold">{"₹78,767"}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-slate-900 dark:text-gray-200">
                          <span>{"Apple"}</span>
                          <span className="font-bold text-slate-900 dark:text-gray-100">{"₹82,917"}</span>
                        </div>

                        <div className="rounded-lg bg-emerald-100 px-3 py-2 text-center text-sm font-semibold text-emerald-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                          {"Save ₹4,150"}
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
