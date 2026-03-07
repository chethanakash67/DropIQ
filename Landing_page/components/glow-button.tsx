"use client"

import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, PropsWithChildren } from "react"

type GlowButtonProps = PropsWithChildren<
  {
    variant?: "solid" | "outline"
    size?: "sm" | "md" | "lg"
    className?: string
  } & ButtonHTMLAttributes<HTMLButtonElement>
>

export default function GlowButton({ children, variant = "solid", size = "md", className, ...props }: GlowButtonProps) {
  const sizes = {
    sm: "text-sm px-4 h-10",
    md: "text-base px-6 h-12",
    lg: "text-lg px-8 h-14",
  }

  if (variant === "outline") {
    return (
      <button
        {...props}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:focus-visible:ring-cyan-400/60",
          className,
        )}
      >
        {/* Orbiting glow border (professional single-dot) */}
        <span className="pointer-events-none absolute inset-0 rounded-full">
          {/* Base soft ring for depth */}
          <span className="absolute inset-0 rounded-full ring-1 ring-emerald-500/30 dark:ring-cyan-400/30" />
          {/* Masked orbit layer with a single glowing dot */}
          <svg
            className="absolute inset-0 h-full w-full animate-[orbit_3s_linear_infinite]"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            {/* Track (invisible, keeps layout) */}
            <circle cx="50" cy="50" r="48" stroke="transparent" strokeWidth="2" />
            {/* Single-dot stroke (rounded caps + dash array to make a dot) */}
            <circle
              cx="50"
              cy="50"
              r="48"
              stroke="url(#glowStroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2 298"
              strokeDashoffset="0"
              style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))" }}
              className="dark:[filter:drop-shadow(0_0_10px_rgba(34,211,238,0.6))]"
            />
            <defs>
              <linearGradient id="glowStroke" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                {/* Light theme: emerald to lime; Dark: overridden with CSS variable */}
                <stop offset="0%" stopColor="rgb(16,185,129)" />
                <stop offset="100%" stopColor="rgb(163,230,53)" />
              </linearGradient>
            </defs>
          </svg>
        </span>

        {/* Inner padding to create the "border" ring */}
        <span className="relative rounded-full p-[2px]">
          {/* Inner surface (professional subtle shine) */}
          <span
            className={cn(
              "relative inline-flex items-center justify-center rounded-full",
              sizes[size],
              "bg-white/85 text-emerald-700 shadow-sm backdrop-blur",
              "transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.28)] group-hover:brightness-[1.03] group-active:brightness-100",
              "dark:bg-slate-950/70 dark:text-cyan-200 dark:group-hover:bg-slate-950/80 dark:group-hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]",
            )}
          >
            {/* Very subtle moving shine, toned down */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute top-0 -left-1/2 h-full w-1/3 rotate-12 bg-white/40 blur-md dark:bg-cyan-100/20 animate-[shine_2.2s_linear_infinite]" />
            </span>
            {children}
          </span>
        </span>

        <style jsx>{`
        @keyframes orbit {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-120%) rotate(12deg);
          }
          60% {
            transform: translateX(220%) rotate(12deg);
          }
          100% {
            transform: translateX(220%) rotate(12deg);
          }
        }
      `}</style>
      </button>
    )
  }

  // variant: solid
  return (
    <button
      {...props}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-xl text-white shadow cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:focus-visible:ring-cyan-400/60",
        sizes[size],
        // Light theme green gradient; Dark theme cyan gradient
        "bg-gradient-to-r from-emerald-500 via-lime-500 to-emerald-500 dark:from-cyan-500 dark:via-sky-500 dark:to-cyan-500",
        "bg-[length:200%_200%] animate-[gradientMove_6s_ease_infinite]",
        "hover:shadow-emerald-500/30 dark:hover:shadow-cyan-500/40",
        className,
      )}
    >
      {/* moving glossy sweep */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute -inset-y-2 -left-1/3 w-1/3 rotate-12 bg-white/40 blur-md dark:bg-cyan-100/20 animate-[shine_2.2s_linear_infinite]" />
      </span>
      {children}
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
      @keyframes shine {
        0% {
          transform: translateX(-120%) rotate(12deg);
        }
        60% {
          transform: translateX(220%) rotate(12deg);
        }
        100% {
          transform: translateX(220%) rotate(12deg);
        }
      }
    `}</style>
    </button>
  )
}
