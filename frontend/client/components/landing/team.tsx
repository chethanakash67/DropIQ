"use client"

import SectionReveal from "./section-reveal"
import { Card } from "@/components/landing/ui/card"
import { Linkedin } from "lucide-react"

const founder = {
  name: "Senoay Shaw",
  role: "Founder & CEO",
  img: "/images/founders/seonay_profile.png",
  // about: "Bridging the gap between robust engineering and high-impact growth marketing, Alex has spent years building scalable tech products that resonate with users. Driven by a passion for solving real-world computing challenges through intuitive design and data-driven strategies, they lead the technical vision and market positioning at DropIQ. Prior to this, Alex spearheaded product growth at multiple startups, mastering the art of turning complex algorithms into seamless, user-friendly experiences.",
  expertise: "Full-Stack Engineering, Growth Marketing, Product Strategy, Data Analytics",
  linkedin: "https://www.linkedin.com/in/senoay-shaw-3970922a0/",
}

export default function Team() {
  return (
    <SectionReveal id="team" as="section" className="container mx-auto px-4 py-14">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{"Meet the Founder"}</h2>
        <p className="mt-2 text-slate-600 dark:text-gray-200">
          {"Building a fair, student‑friendly way to pick the right gadgets."}
        </p>
      </div>

      <Card className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
          {/* Text Content (Left side) */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{founder.name}</h3>
              <span className="mt-1 inline-block text-sm font-semibold text-emerald-600 dark:text-cyan-400">
                {founder.role}
              </span>
            </div>
            
            {/* <p className="text-base text-slate-600 dark:text-gray-300 leading-relaxed">
              {founder.about}
            </p> */}

            <div className="pt-2">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Expertise:</h4>
              <p className="text-sm text-slate-600 dark:text-gray-300">{founder.expertise}</p>
            </div>
            
            <div className="pt-4 flex items-center gap-4">
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-600 dark:hover:text-cyan-400 transition-colors"
                aria-label={`${founder.name} on LinkedIn`}
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Photo (Right side) */}
          <div className="shrink-0">
            <img
              src={founder.img}
              alt={`${founder.name} headshot`}
              className="h-48 w-48 md:h-64 md:w-64 rounded-xl object-cover ring-4 ring-emerald-100 dark:ring-cyan-900/50 shadow-lg"
            />
          </div>
        </div>
      </Card>
    </SectionReveal>
  )
}

