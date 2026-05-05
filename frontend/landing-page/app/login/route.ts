import { NextRequest, NextResponse } from "next/server"
import { dashboardPath } from "@/lib/dashboard-url"

const LOCAL_DASHBOARD_LOGIN = "http://localhost:3000/login"

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
    return NextResponse.redirect(hasSameOrigin(LOCAL_DASHBOARD_LOGIN, currentOrigin) ? new URL("/", request.url) : LOCAL_DASHBOARD_LOGIN)
  }

  return NextResponse.redirect(target)
}
