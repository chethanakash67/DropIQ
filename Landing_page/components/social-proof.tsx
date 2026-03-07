"use client"

import SectionReveal from "./section-reveal"
import AnimatedCounter from "./animated-counter"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const pressLogos = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vL5mvYcgNoknXAULUA3RcB7ePj0jja.png",
    alt: "Generic style text logos sample 1",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3QHOi2DwCWkAttnIRBdtBsOxwxP0fD.png",
    alt: "Script style text logos sample 2",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3lbks4GM2qJvqoEGZN6WebGibCaRQH.png",
    alt: "Industrial style text logos sample 3",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VLl9pAZ6nke4wAZbopyttRjTToYVji.png",
    alt: "Corporate style text logos sample 4",
  },
]

type Testimonial = {
  name: string
  college: string
  avatar: string
  rating: number
  text: string
}

const testimonials: Testimonial[] = [
  {
    name: "Aisha",
    college: "CS, BMSIT-Bangalore",
    avatar: "/avatars/student1.jpg",
    rating: 3.6,
    text: "The concept of Value-Score is very Unique, and hope this helps me get my new laptop",
  },
  {
    name: "Rahul",
    college: "Mech, Nitte Meenakshi",
    avatar: "/avatars/student2.jpg",
    rating: 4.0,
    text: "The Idea works, as many times I feel overwhelmed opening 10 tabs and searching for features, deals, etc.. The Alerts make things easier",
  },
  {
    name: "Sahithi",
    college: "BCom, Apolo university",
    avatar: "/avatars/student3.jpg",
    rating: 4.6,
    text: "The best part is adding a dashboard to local sellers, and bidding the products, just to give us reasonable one...",
  },
]

function Stars({ count }: { count: number }) {
  const fullStars = Math.floor(count);
  const hasHalfStar = count - fullStars >= 0.25 && count - fullStars < 0.75; // more realistic threshold

  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          // full star
          return <Star key={i} className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />;
        } else if (i === fullStars && hasHalfStar) {
          // real half star
          return (
            <div key={i} className="relative h-4 w-4">
              {/* Left half filled */}
              <Star className="absolute left-0 h-4 w-4 fill-yellow-400 stroke-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
              {/* Right half empty */}
              <Star className="absolute left-0 h-4 w-4 stroke-gray-300 dark:stroke-gray-600" style={{ clipPath: 'inset(0 0 0 50%)' }} />
            </div>
          );
        } else {
          // empty star
          return <Star key={i} className="h-4 w-4 stroke-gray-300 dark:stroke-gray-600" />;
        }
      })}
      <span className="sr-only">{`${count} out of 5 stars`}</span>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <Card className="min-w-[280px] max-w-xs p-5 mr-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={t.avatar || "/placeholder.svg"} alt={`${t.name} avatar`} />
          <AvatarFallback>{t.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold dark:text-white">{t.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-300">{t.college}</div>
        </div>
      </div>
      <div className="mt-3">
        <Stars count={t.rating} />
      </div>
      <p className="mt-3 text-gray-700 dark:text-gray-200 text-sm">{t.text}</p>
    </Card>
  )
}

export default function SocialProof() {
  return (
    <SectionReveal id="social-proof" as="section" className="container mx-auto px-4 py-14">
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-300">{"Trusted by students"}</p>
        <div className="mt-2 text-3xl font-extrabold dark:text-white">
          <AnimatedCounter
            to={200}
            suffix="+"
            className="bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-sky-400"
          />{" "}
          {"Students Already joined the waitlist"}
        </div>
      </div>

      {/* Marquee scroller */}
      <div className="mt-8">
        <div className="relative group">
          <div className="mask pointer-events-none absolute inset-0 z-10 [background:linear-gradient(90deg,white,transparent_15%,transparent_85%,white)] dark:[background:linear-gradient(90deg,#0b1220,transparent_15%,transparent_85%,#0b1220)]" />
          <div className="overflow-hidden">
            {/* Row 1 */}
            <div
              className="flex w-max will-change-transform motion-reduce:animate-none"
              style={{ animation: "marquee 28s linear infinite" }}
            >
              {testimonials.map((t, idx) => (
                <TestimonialCard key={`row1-${idx}`} t={t} />
              ))}
              {/* Duplicate for seamless loop */}
              {testimonials.map((t, idx) => (
                <TestimonialCard key={`row1b-${idx}`} t={t} />
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-hidden"></div>

          <style jsx>{`
          .group:hover div[style*='marquee'] {
            animation-play-state: paused;
          }
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          @keyframes marquee-reverse {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .group div[style*='marquee'],
            .group div[style*='marquee-reverse'] {
              animation: none !important;
              transform: none !important;
            }
          }
        `}</style>
        </div>
      </div>

      <div className="mt-10"></div>
    </SectionReveal>
  )
}
