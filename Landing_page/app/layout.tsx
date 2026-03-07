import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import CursorTail from "@/components/cursor-tail"
import ScrollToTop from "@/components/scroll-to-top"
import "./globals.css"

export const metadata: Metadata = {
  title: "DropiQ – Find the best gadget value",
  description: "Compare prices and features across stores with a smart value score.",
  generator: "v0.dev",
  icons: {
    icon: '/slate_grey_logo_1.png',
    shortcut: '/slate_grey_logo_1.png',
    apple: '/slate_grey_logo_1.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10b981',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="preload" href="/slate_grey_logo_1.png" as="image" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${GeistSans.className} bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300`}
      >
        <ThemeProvider>
          {children}
          <CursorTail />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}

