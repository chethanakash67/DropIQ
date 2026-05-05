"use client"

import SectionReveal from "./section-reveal"
import { Card } from "@/components/ui/card"
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
    name: "Sai Videsh",
    role: "Co-Founder & Product Manager",
    img: "/images/founders/pic-6.png",
    about: "IIITDMK student, building micro solutions for problems and learning new stuff.",
    linkedin: "https://www.linkedin.com/in/sai-videsh-ssv",
  },
  {
    name: "Senoay Shaw",
    role: "Co-Founder & Marketing",
    img: "/images/founders/seonay_profile.png",
    about: "Handles distribution and growth strategy for tech innovators.",
    linkedin: "https://www.linkedin.com/in/senoay-shaw-3970922a0/",
  },
  {
    name: "Chethan Akash",
    role: "Co-Founder & Developer",
    img: "/images/founders/chethanakash.jpeg",
    about: "Building intelligent web experiences at the intersection of development and AI.",
    linkedin: "https://www.linkedin.com/in/chethan-akash/",
  },
]

function MemberCard({ m }: { m: Member }) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-emerald-300/60 dark:bg-slate-900 dark:border-slate-800">
      {/* subtle hover glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <div className="absolute inset-0 blur-2xl bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)]" />
      </div>

      <div className="flex items-start gap-4">
        <img
          src={m.img || "/placeholder.svg"}
          alt={`${m.name} headshot`}
          className="h-16 w-16 rounded-xl object-cover ring-2 ring-emerald-100 dark:ring-cyan-900/50 shrink-0"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{m.name}</h3>
          <span className="mt-1 inline-block text-xs font-semibold text-emerald-600 dark:text-cyan-400">
            {m.role}
          </span>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300 leading-snug">{m.about}</p>
          
          <div className="mt-3 flex items-center gap-3">
            {m.linkedin && (
              <a
                href={m.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-600 dark:hover:text-cyan-400 transition-colors"
                aria-label={`${m.name} on LinkedIn`}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {m.twitter && (
              <a
                href={m.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-600 dark:hover:text-cyan-400 transition-colors"
                aria-label={`${m.name} on Twitter`}
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
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
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {members.map((m) => (
          <MemberCard key={m.name} m={m} />
        ))}
      </div>
    </SectionReveal>
  )
}
