import WaitlistForm from "./waitlist-form"
import Logo from "./logo"

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
            {"Join the waitlist and get early access with exclusive perks."}
          </p>

          <div className="mt-6 max-w-xl mx-auto">
            <WaitlistForm size="lg" placeholder="you@university.edu" buttonText="Join Early Access" />
          </div>
        </div>
      </div>
    </section>
  )
}
