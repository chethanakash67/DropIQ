"use client"

import { useEffect, useRef, useState } from "react"

export default function CursorTail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const [enabled, setEnabled] = useState(false)

  const TRAIL = 20
  const pointsRef = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL }, () => ({ x: 0, y: 0 }))
  )
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 })

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  useEffect(() => {
    if (typeof window === "undefined") return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarse = window.matchMedia("(pointer: coarse)").matches
    if (prefersReduced || coarse) { setEnabled(false); return }
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    pointsRef.current.forEach((p) => { p.x = cx; p.y = cy })
    mouseRef.current = { x: cx, y: cy, vx: 0, vy: 0 }

    let lastX = cx, lastY = cy, lastT = performance.now()
    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      const dt = Math.max(0.001, (now - lastT) / 1000)
      mouseRef.current.vx = (e.clientX - lastX) / dt
      mouseRef.current.vy = (e.clientY - lastY) / dt
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      lastX = e.clientX; lastY = e.clientY; lastT = now
    }
    window.addEventListener("mousemove", onMove)

    const render = () => {
      const { x: mx, y: my } = mouseRef.current
      const pts = pointsRef.current

      pts[0].x = lerp(pts[0].x, mx, 0.5)
      pts[0].y = lerp(pts[0].y, my, 0.5)
      for (let i = 1; i < pts.length; i++) {
        pts[i].x = lerp(pts[i].x, pts[i - 1].x, 0.6)
        pts[i].y = lerp(pts[i].y, pts[i - 1].y, 0.6)
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // emerald trail — matches landing page light-mode colour
      const base   = "16,185,129"
      const shadow = "rgba(16,185,129,0.35)"
      const headSize = 6
      const tailSize = 2

      for (let i = 0; i < pts.length; i++) {
        const t = i / (pts.length - 1)
        const falloff = Math.pow(1 - t, 2.2)
        const r = tailSize + falloff * (headSize - tailSize)
        const a = 0.28 * falloff + 0.05

        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = `rgba(${base},${a})`
        ctx.shadowColor = shadow
        ctx.shadowBlur = 10 * falloff
        ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  )
}
