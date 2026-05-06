"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type SectionRevealProps = {
  as?: keyof React.JSX.IntrinsicElements
  id?: string
  className?: string
  children: React.ReactNode
}

export default function SectionReveal({ as = "section", id, className, children }: SectionRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Comp = as as any
  return (
    <Comp
      id={id}
      ref={ref as any}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </Comp>
  )
}
