"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { MoonStar, SunMedium } from "lucide-react"

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = resolvedTheme === "dark"
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/80 backdrop-blur transition-all hover:scale-105 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-cyan-500 dark:hover:shadow-[0_0_18px_rgba(34,211,238,0.6)]"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? <SunMedium className="h-5 w-5 text-cyan-400" /> : <MoonStar className="h-5 w-5 text-gray-700" />}
    </button>
  )
}
