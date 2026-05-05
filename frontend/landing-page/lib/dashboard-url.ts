export const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000"

export function dashboardPath(path: string) {
  return `${DASHBOARD_URL}${path.startsWith("/") ? path : `/${path}`}`
}
