import { NextRequest, NextResponse } from "next/server"
import { dashboardPath } from "@/lib/dashboard-url"

const FALLBACK_DASHBOARD_LOGIN = "https://dropiq-t62y.onrender.com/login"

function hasSameOrigin(target: string, origin: string) {
  try {
    return new URL(target).origin === origin
  } catch {
    return false
  }
}

export function GET(request: NextRequest) {
  const currentOrigin = request.nextUrl.origin
  const target = dashboardPath("/login")

  if (hasSameOrigin(target, currentOrigin)) {
    return NextResponse.redirect(hasSameOrigin(FALLBACK_DASHBOARD_LOGIN, currentOrigin) ? new URL("/", request.url) : FALLBACK_DASHBOARD_LOGIN)
  }

  return NextResponse.redirect(target)
}
