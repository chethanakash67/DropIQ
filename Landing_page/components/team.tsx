"use client"

import SectionReveal from "./section-reveal"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Linkedin, Twitter } from "lucide-react"

type Member = {
  name: string
  role: string
  img: string
  about: string
  linkedin?: string
  twitter?: string
}

const members: Member[] = [
  {
    name: "Senoay Shaw",
    role: "Founder and AI Engineer",
    img: "/images/founders/seonay_profile.png",
    about:
    "18-year-old tech innovator with a sharp business mindset, turning emerging trends into impactful solutions. Passionate about startups, problem-solving, and building the future through innovation.",
    linkedin: "https://www.linkedin.com/in/senoay-shaw-3970922a0/",
    // twitter: "#",
  },
    {
      name: "Sai Videsh",
      role: "Founder and Developer",
      img: "/images/founders/pic-6.png",
      about:
        "Student building real-world solutions using Tech and AI. Experienced in multiple internships, hackathons and open-source contributions. Skilled across design, technology, communication, and soft skills. Exploring Startups and Hustles",
      linkedin: "https://www.linkedin.com/in/sai-videsh-ssv",
      // twitter: "#",
    },
]

function MemberCard({ m }: { m: Member }) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl border bg-white/10 p-6 backdrop-blur-md shadow-lg ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-xl hover:border-emerald-300/40 dark:bg-slate-900/30 dark:ring-white/5 dark:hover:shadow-[0_0_36px_rgba(34,211,238,0.28)] dark:hover:border-cyan-400/30">
      {/* full-card glowing overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <div className="absolute inset-0 blur-2xl bg-[radial-gradient(60%_60%_at_30%_20%,rgba(16,185,129,0.22),transparent_60%),radial-gradient(60%_60%_at_70%_80%,rgba(132,204,22,0.20),transparent_60%)] dark:bg-[radial-gradient(60%_60%_at_30%_20%,rgba(34,211,238,0.18),transparent_60%),radial-gradient(60%_60%_at_70%_80%,rgba(56,189,248,0.18),transparent_60%)]" />
      </div>

      {/* soft moving glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-[floatGlow_10s_ease_infinite] dark:bg-cyan-400/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-lime-400/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-[floatGlow_12s_ease_infinite] dark:bg-sky-400/20"
      />

      <div className="flex items-start gap-4">
        <img
          src={m.img || "/placeholder.svg"}
          alt={`${m.name} headshot`}
          className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-emerald-200/60 dark:ring-cyan-300/40"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{m.name}</h3>
            <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-cyan-900/30 dark:text-cyan-300">
              {m.role}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-700 dark:text-gray-200">{m.about}</p>
          <div className="mt-3 flex items-center gap-3">
            {m.linkedin && (
              <a
                href={m.linkedin}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-cyan-300 transition-colors"
                aria-label={`${m.name} on LinkedIn`}
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {m.twitter && (
              <a
                href={m.twitter}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-cyan-300 transition-colors"
                aria-label={`${m.name} on Twitter`}
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* hover shine */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <span className="absolute -inset-y-4 -left-1/3 w-1/3 rotate-12 bg-white/25 blur-lg dark:bg-cyan-100/10 animate-[shine_2.4s_linear_infinite]" />
      </span>

      <style jsx>{`
        @keyframes floatGlow {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-10px) translateX(8px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-140%) rotate(12deg);
          }
          100% {
            transform: translateX(240%) rotate(12deg);
          }
        }
      `}</style>
    </Card>
  )
}

export default function Team() {
  return (
    <SectionReveal id="team" as="section" className="container mx-auto px-4 py-14">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{"Meet the Team"}</h2>
        <p className="mt-2 text-slate-600 dark:text-gray-200">
          {"Building a fair, student‑friendly way to pick the right gadgets."}
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {members.map((m) => (
          <MemberCard key={m.name} m={m} />
        ))}
      </div>
    </SectionReveal>
  )
}
