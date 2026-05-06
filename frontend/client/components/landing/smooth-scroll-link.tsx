"use client"

import type React from "react"

import Link from "next/link"

type SmoothScrollLinkProps = {
  href: `#${string}`
  children: React.ReactNode
  className?: string
}

export default function SmoothScrollLink({ href, children, className }: SmoothScrollLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        const id = href.replace("#", "")
        const el = document.getElementById(id)
        if (el) {
          e.preventDefault()
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }}
    >
      {children}
    </Link>
  )
}
