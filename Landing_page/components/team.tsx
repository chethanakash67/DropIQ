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
    name: "Senoay Shaw",
    role: "Founder & AI Engineer",
    img: "/images/founders/seonay_profile.png",
    about: "18-year-old tech innovator turning emerging trends into impactful solutions.",
    linkedin: "https://www.linkedin.com/in/senoay-shaw-3970922a0/",
  },
  {
    name: "Sai Videsh",
    role: "Founder & Developer",
    img: "/images/founders/pic-6.png",
    about: "Student building real-world solutions using Tech and AI.",
    linkedin: "https://www.linkedin.com/in/sai-videsh-ssv",
  },
  {
    name: "Chethan Akash",
    role: "Web Developer & AI Engineer",
    img: "/images/founders/pic-6.png",
    about: "Building intelligent web experiences at the intersection of development and AI.",
    linkedin: "https://www.linkedin.com/in/chethan-akash/",
  },
]

function MemberCard({ m }: { m: Member }) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-md transition-all duration-300 hover:shadow-xl hover:border-emerald-300/60 flex flex-col items-center text-center">
      {/* subtle hover glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <div className="absolute inset-0 blur-2xl bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent_70%)]" />
      </div>

      <img
        src={m.img || "/placeholder.svg"}
        alt={`${m.name} headshot`}
        className="h-20 w-20 rounded-2xl object-cover ring-2 ring-emerald-200/80 mb-4"
      />

      <h3 className="text-lg font-semibold text-slate-900 leading-tight">{m.name}</h3>
      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium text-emerald-700">
        {m.role}
      </span>
      <p className="mt-3 text-sm text-slate-600 leading-snug">{m.about}</p>

      <div className="mt-4 flex items-center gap-3">
        {m.linkedin && (
          <a
            href={m.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-emerald-600 transition-colors"
            aria-label={`${m.name} on LinkedIn`}
          >
            <Linkedin className="h-5 w-5" />
          </a>
        )}
        {m.twitter && (
          <a
            href={m.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-emerald-600 transition-colors"
            aria-label={`${m.name} on Twitter`}
          >
            <Twitter className="h-5 w-5" />
          </a>
        )}
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
