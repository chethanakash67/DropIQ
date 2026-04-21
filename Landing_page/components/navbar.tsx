"use client"

import SmoothScrollLink from "./smooth-scroll-link"
import GlowButton from "./glow-button"
import Logo from "./logo"
import { Button } from "./ui/button"
import Link from "next/link"

const links = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#why-different", label: "Why Different" },
  { href: "#social-proof", label: "Testimonials" },
  { href: "#team", label: "Team" },
  { href: "#demo-video", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
]

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/70">
      {/* Desktop: 3 columns: left brand, center links, right actions */}
      <div className="container mx-auto px-6 h-16 hidden md:grid md:grid-cols-[1fr_2fr_1fr] md:items-center md:gap-8">
        {/* Left: Brand - professionally aligned */}
        <div className="flex items-center gap-4 justify-self-start">
          <Logo size="xl" className="text-emerald-600 dark:text-cyan-400" />
          <span className="font-extrabold tracking-tight text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600 dark:from-cyan-400 dark:to-sky-400 animate-[gradientMove_8s_ease_infinite] bg-[length:200%_200%]">
            {"DropiQ"}
          </span>
        </div>

        {/* Middle: Perfectly centered navigation links */}
        <div className="flex items-center justify-center gap-1">
          {links.map((l) => (
            <SmoothScrollLink
              key={l.href}
              href={l.href as `#${string}`}
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-cyan-300 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              {l.label}
            </SmoothScrollLink>
          ))}
        </div>

        {/* Right: Actions - professionally aligned */}
        <div className="flex items-center justify-end gap-4">
          <Link href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000"}/login`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="rounded-full">
              Log In
            </Button>
          </Link>
          <Link href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000"}/signup`} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile: brand + actions */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-3">
          <Logo size="lg" className="text-emerald-600 dark:text-cyan-400" />
          <span className="font-extrabold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600 dark:from-cyan-400 dark:to-sky-400 animate-[gradientMove_8s_ease_infinite] bg-[length:200%_200%]">
            {"DropiQ"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"}/login`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="rounded-full">
              Log In
            </Button>
          </Link>
          <Link href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"}/signup`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile links scroller */}
      <div className="md:hidden border-t border-gray-100 dark:border-slate-800">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2">
          {links.map((l) => (
            <SmoothScrollLink
              key={l.href}
              href={l.href as `#${string}`}
              className="whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 text-gray-700 dark:text-gray-200 dark:border-slate-700 dark:hover:text-cyan-300 dark:hover:border-cyan-700 dark:hover:bg-slate-900/50 transition-colors"
            >
              {l.label}
            </SmoothScrollLink>
          ))}
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
      `}</style>
    </nav>
  )
}
