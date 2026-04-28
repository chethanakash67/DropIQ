import Logo from "./logo"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"

export default function FinalCta() {
  return (
    <section id="final-cta" className="relative overflow-hidden">
      {/* Subtle background glows (light and dark) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-lime-500/20 dark:from-cyan-500/15 dark:via-transparent dark:to-sky-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(65%_45%_at_50%_-10%,rgba(16,185,129,0.14),transparent_60%)] dark:bg-[radial-gradient(65%_45%_at_50%_-10%,rgba(34,211,238,0.12),transparent_60%)]" />
      </div>

      {/* Foreground glass card */}
      <div className="container mx-auto px-4 py-16">
        <div className="relative mx-auto max-w-3xl rounded-3xl border border-emerald-600/20 bg-white/10 p-10 text-center shadow-lg backdrop-blur-xl ring-1 ring-white/10 dark:border-cyan-400/20 dark:bg-slate-900/25 dark:shadow-[0_0_60px_rgba(34,211,238,0.18)] dark:ring-white/5">
          {/* Decorative glow orbs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 left-1/2 h-48 w-[38rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400/25 to-lime-400/25 blur-3xl dark:from-cyan-400/25 dark:to-sky-400/25"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/15 blur-2xl dark:bg-cyan-400/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-lime-400/15 blur-2xl dark:bg-sky-400/15"
          />

          <div className="flex justify-center mb-4">
            <Logo size="2xl" className="text-emerald-600 dark:text-cyan-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {"Be the First to Get the "}
            <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-sky-400">
              {"Best Deals"}
            </span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-700/90 dark:text-slate-200/90">
            {"Create your account and start discovering the best deals instantly."}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`${DASHBOARD_URL}/signup`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 shadow-lg">
                <UserPlus className="mr-2 h-5 w-5" />
                {"Sign Up, It's Free"}
              </Button>
            </Link>
            <Link href={`${DASHBOARD_URL}/login`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 border-emerald-600/50 text-emerald-700 hover:bg-emerald-50 dark:border-cyan-400/50 dark:text-cyan-300 dark:hover:bg-cyan-900/20">
                <LogIn className="mr-2 h-5 w-5" />
                {"Already have an account? Log In"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
