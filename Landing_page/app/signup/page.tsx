import { redirect } from "next/navigation"
import { dashboardPath } from "@/lib/dashboard-url"

export default function SignupRedirectPage() {
  redirect(dashboardPath("/signup"))
}

