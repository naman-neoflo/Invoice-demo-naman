// finance-os/layout.tsx
// Persistent shell for all Finance OS pages — sidebar + content area.
// The existing NavSidebar lives in _app.tsx (Pages Router) and doesn't carry
// over to App Router routes, so we provide our own here.
import * as React from "react"
import { FinanceOSShell } from "./_components/sidebar"

export default function FinanceOSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <FinanceOSShell>{children}</FinanceOSShell>
}
