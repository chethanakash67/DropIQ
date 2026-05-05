import { NextRequest, NextResponse } from "next/server"
import { dashboardPath } from "@/lib/dashboard-url"

function dashboardCallbackUrl(request: NextRequest) {
  const queryString = request.nextUrl.searchParams.toString()
  return dashboardPath(`/auth/callback${queryString ? `?${queryString}` : ""}`)
}

export function GET(request: NextRequest) {
  return NextResponse.redirect(dashboardCallbackUrl(request))
}

export function HEAD(request: NextRequest) {
  return NextResponse.redirect(dashboardCallbackUrl(request))
}
