"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { HelpdeskInbox } from "@/app/demo/helpdesk/_components/inbox"
import { useCanSeeAny } from "@/lib/neoflo-os/users/permissions"
import type { SurfaceId } from "@/lib/neoflo-os/users/types"

export default function Page() {
  // Helpdesk's page.tsx IS the inbox — there's no separate inbox route.
  // Allow access if the active role can see EITHER the dashboard or the
  // inbox surface; otherwise fall back to workspace home.
  const allowed = useCanSeeAny([
    "helpdesk:dashboard",
    "helpdesk:inbox",
  ] satisfies SurfaceId[])
  const router = useRouter()
  React.useEffect(() => {
    if (!allowed) router.replace("/neoflo-workspace")
  }, [allowed, router])
  if (!allowed) return null

  return <HelpdeskInbox prefix="/neoflo-workspace" />
}
