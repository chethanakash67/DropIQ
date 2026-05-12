const DEFAULT_DASHBOARD_URL = "https://dropiq-t62y.onrender.com"
const CONFIGURED_DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL
const IS_PROD = process.env.NODE_ENV === "production"

const configuredLooksLocal =
  !!CONFIGURED_DASHBOARD_URL &&
  /localhost|127\.0\.0\.1|::1/.test(CONFIGURED_DASHBOARD_URL)

export const DASHBOARD_URL =
  IS_PROD && configuredLooksLocal
    ? DEFAULT_DASHBOARD_URL
    : (CONFIGURED_DASHBOARD_URL || DEFAULT_DASHBOARD_URL)

export function dashboardPath(path: string) {
  return `${DASHBOARD_URL}${path.startsWith("/") ? path : `/${path}`}`
}
