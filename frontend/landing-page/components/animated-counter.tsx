"use client"

import { useEffect, useRef, useState } from "react"

type AnimatedCounterProps = {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export default function AnimatedCounter({
  to,
  duration = 1500,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            setStarted(true)
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.floor(progress * to))
      if (progress < 1) requestAnimationFrame(step)
    }
    const r = requestAnimationFrame(step)
    return () => cancelAnimationFrame(r)
  }, [started, duration, to])

  const formatted = value.toLocaleString()

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
