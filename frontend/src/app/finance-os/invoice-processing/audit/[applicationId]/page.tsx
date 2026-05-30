// app/neoflo-workspace/invoice-processing/audit/[applicationId]/page.tsx
//
// Invoice-processing audit log — the SOX-defensibility surface. Per
// docs/handoff/invoice-processing/03-screen-specs.md § "Surface 5: Audit log".
//
// TODO Phase 2: extract a shared <AuditTimeline> + summary/hash cards and
// refactor cash-app's audit page + this page to consume them. For Phase 1 we
// mirror the cash-app JSX inline (same approach cash-app took with helpdesk),
// so the cash-app surface carries zero regression risk.
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Clock,
  Copy,
  Database,
  Hash,
  PaperPlaneTilt,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
} from "@phosphor-icons/react"

import { InvoiceNumberLink } from "@/components/neoflo-os/invoice-processing/invoice-number-link"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/neoflo-os/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/neoflo-os/ui/select"
import { Separator } from "@/components/neoflo-os/ui/separator"
import { Skeleton } from "@/components/neoflo-os/ui/skeleton"
import {
  SEED_APPLICATIONS,
  getApplication,
} from "@/lib/neoflo-os/invoice-processing/seed-applications"
import { getInvoice } from "@/lib/neoflo-os/invoice-processing/seed-invoices"
import { getVendor } from "@/lib/neoflo-os/invoice-processing/seed-vendors"
import type {
  Application,
  AuditEvent,
  AuditEventType,
} from "@/lib/neoflo-os/invoice-processing/types"

function pad3(n: number): string {
  return n.toString().padStart(3, "0")
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const time = d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  })
  return `${time}.${pad3(d.getUTCMilliseconds())} UTC`
}

function fmtAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount).toLocaleString("en-US")
  if (currency === "USD") return `$${rounded}`
  return `${currency} ${rounded}`
}

function statusTone(status: Application["status"]): {
  tone: "success" | "warning" | "neutral" | "danger" | "info"
  label: string
} {
  switch (status) {
    case "auto-posted":
      return { tone: "success", label: "Auto-posted" }
    case "human-approved":
      return { tone: "success", label: "Human-approved" }
    case "held-in-exceptions":
      return { tone: "warning", label: "Held in exceptions" }
    case "duplicate-confirmed":
      return { tone: "danger", label: "Duplicate confirmed" }
  }
}

// Map AuditEventType → human-readable label for the event pill.
const EVENT_LABEL: Record<AuditEventType, string> = {
  ingested: "Ingest",
  "ocr-extracted": "OCR + field extraction",
  "vendor-lookup": "Vendor lookup",
  "po-matched": "PO match",
  "grn-matched": "GRN match",
  "duplicate-checked": "Duplicate check",
  "gl-coded": "GL coding proposal",
  "tax-checked": "Tax check",
  "threshold-checked": "Threshold check",
  "auto-posted": "Auto-posted",
  "human-approved": "Human approved",
  "human-rejected": "Human rejected",
  "human-edited": "Human edited",
  "duplicate-confirmed": "Duplicate confirmed",
  "vendor-emailed": "Vendor emailed",
  "erp-write-back": "ERP post",
  signed: "Hash + lock",
}

// Events whose `reasoning` deserves the highlighted block (per spec).
const HIGHLIGHTED_EVENT_TYPES = new Set<AuditEventType>([
  "gl-coded",
  "tax-checked",
  "threshold-checked",
  "erp-write-back",
])

// Pre-sort applications for the picker — hero applications first (richer audit
// trails), then the rest by id for stability.
const PICKER_APPLICATIONS = [...SEED_APPLICATIONS].sort((a, b) => {
  const heroOrder = (id: string) =>
    id === "app-acme-may-2026" ? 0 : id === "app-998123-a" ? 1 : 2
  const oa = heroOrder(a.id)
  const ob = heroOrder(b.id)
  if (oa !== ob) return oa - ob
  return a.id.localeCompare(b.id)
})

export default function InvoiceProcessingAuditPage() {
  const params = useParams<{ applicationId: string }>()
  const router = useRouter()
  const applicationId = params?.applicationId ?? ""

  const application = React.useMemo(
    () => getApplication(applicationId),
    [applicationId]
  )

  const [copied, setCopied] = React.useState(false)
  const [showFullHash, setShowFullHash] = React.useState(false)

  if (!application) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldWarning size={18} className="text-muted-foreground" />
                Application not found
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">
                No audit record matches the application id{" "}
                <span className="font-mono">{applicationId || "(empty)"}</span>.
                Pick a different application from the dropdown below or return
                to the dashboard.
              </p>
              <Select
                value=""
                onValueChange={(next) =>
                  router.push(`/neoflo-workspace/invoice-processing/audit/${next}`)
                }
              >
                <SelectTrigger className="h-9 w-[460px] max-w-[60vw]">
                  <SelectValue placeholder="Pick an application..." />
                </SelectTrigger>
                <SelectContent>
                  {PICKER_APPLICATIONS.map((app) => {
                    const invoice = getInvoice(app.invoiceId)
                    const vendor = getVendor(app.vendorId)
                    return (
                      <SelectItem key={app.id} value={app.id}>
                        <span className="text-muted-foreground mr-2 font-mono text-xs">
                          {app.id}
                        </span>
                        <span className="text-foreground">
                          {vendor?.name ?? "Unknown vendor"}
                        </span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          ·{" "}
                          {invoice
                            ? `${invoice.invoiceNumber} ${fmtAmount(invoice.amount, invoice.currency)}`
                            : "—"}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Link
                href="/neoflo-workspace/invoice-processing"
                className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                <ArrowLeft size={14} />
                Back to dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const invoice = getInvoice(application.invoiceId)
  const vendor = getVendor(application.vendorId)
  const status = statusTone(application.status)
  const events = application.auditTrail
  const firstEvent = events[0]
  const lastEvent = events[events.length - 1]
  const postedAtLabel = application.postedToErpAt
    ? formatTimestamp(application.postedToErpAt)
    : lastEvent
      ? formatTimestamp(lastEvent.timestamp)
      : "—"

  const hash = application.hash
  const hashShort = hash.slice(0, 14)

  function handleCopyHash() {
    if (typeof navigator === "undefined" || !hash) return
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Back link */}
        <div className="flex items-center justify-between">
          <Link
            href="/neoflo-workspace/invoice-processing"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
          <StatusBadge tone="success">
            <ShieldCheck size={12} weight="fill" />
            SOX-defensible trail
          </StatusBadge>
        </div>

        {/* Header card — application id + posted by + switch-application picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={18} className="text-primary" weight="fill" />
              Application{" "}
              <span className="font-mono text-sm font-normal">
                {application.id}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <p
                className="text-muted-foreground text-sm"
                suppressHydrationWarning
              >
                Posted by Neo · {postedAtLabel}
              </p>
              <Select
                value={application.id}
                onValueChange={(next) => {
                  if (next !== application.id) {
                    router.push(
                      `/neoflo-workspace/invoice-processing/audit/${next}`
                    )
                  }
                }}
              >
                <SelectTrigger className="h-9 w-[460px] max-w-[60vw]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PICKER_APPLICATIONS.map((app) => {
                    const inv = getInvoice(app.invoiceId)
                    const ven = getVendor(app.vendorId)
                    return (
                      <SelectItem key={app.id} value={app.id}>
                        <span className="text-muted-foreground mr-2 font-mono text-xs">
                          {app.id}
                        </span>
                        <span className="text-foreground">
                          {ven?.name ?? "Unknown vendor"}
                        </span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          ·{" "}
                          {inv
                            ? `${inv.invoiceNumber} ${fmtAmount(inv.amount, inv.currency)}`
                            : "—"}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Vendor
                </dt>
                <dd className="text-foreground text-sm">
                  {vendor?.name ?? "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Invoice
                </dt>
                <dd className="text-foreground text-sm">
                  {invoice ? (
                    <InvoiceNumberLink
                      invoiceId={invoice.id}
                      label={invoice.invoiceNumber}
                      className="text-foreground hover:text-primary"
                    />
                  ) : (
                    <span className="font-mono">{application.invoiceId}</span>
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Amount
                </dt>
                <dd className="text-foreground text-sm tabular-nums">
                  {invoice ? fmtAmount(invoice.amount, invoice.currency) : "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Status
                </dt>
                <dd>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </dd>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Posted to NetSuite
                </dt>
                <dd className="text-foreground text-sm">
                  {application.erpTransactionId
                    ? `txn id: ${application.erpTransactionId}`
                    : "Pending"}
                </dd>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Final GL coding
                </dt>
                <dd className="text-foreground text-sm">
                  <span className="font-mono">{application.finalGL.account}</span>{" "}
                  · {application.finalGL.costCenter} · {application.finalGL.entity}
                </dd>
              </div>
            </dl>

            {/* Hash row */}
            <div className="border-border bg-muted/40 flex flex-wrap items-center gap-3 rounded-md border px-4 py-3">
              <Hash size={16} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground text-xs font-medium">
                Hash (SHA-256):
              </span>
              <span className="text-foreground/90 font-mono text-xs">
                {hashShort}…
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullHash(true)}
              >
                Show full
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopyHash}>
                {copied ? (
                  <>
                    <CheckCircle size={14} weight="fill" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Timeline
              <span className="text-muted-foreground text-xs font-normal">
                · {events.length} events · millisecond precision
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col">
              {events.map((e: AuditEvent, idx: number) => {
                const offsetMs = firstEvent
                  ? new Date(e.timestamp).getTime() -
                    new Date(firstEvent.timestamp).getTime()
                  : 0
                const isHighlighted =
                  e.reasoning && HIGHLIGHTED_EVENT_TYPES.has(e.type)
                return (
                  <li key={e.id ?? idx} className="hover:bg-muted/40 flex gap-4 py-3.5 transition-colors">
                    {/* Left: timestamp */}
                    <div className="flex w-44 shrink-0 flex-col">
                      <span
                        className="text-foreground text-xs font-mono font-semibold tabular-nums"
                        suppressHydrationWarning
                      >
                        {formatTimestamp(e.timestamp)}
                      </span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        +{offsetMs} ms
                      </span>
                    </div>
                    {/* Middle: vertical dot/line + pill */}
                    <div className="bg-border relative w-px shrink-0">
                      <span className="bg-primary absolute left-1/2 top-1.5 size-2 -translate-x-1/2 rounded-full" />
                    </div>
                    {/* Right: event type pill + description + reasoning */}
                    <div className="flex flex-1 flex-col gap-1.5 pb-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge tone="info" showDot={false}>
                          {EVENT_LABEL[e.type] ?? e.type}
                        </StatusBadge>
                        {e.actor === "human" && e.humanName ? (
                          <span className="text-muted-foreground text-xs">
                            · {e.humanName}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-foreground/80 text-sm leading-relaxed">
                        {e.description}
                      </div>
                      {e.source ? (
                        <div className="text-muted-foreground inline-flex w-fit items-center gap-1.5 text-xs">
                          <Database size={12} />
                          {e.source}
                        </div>
                      ) : null}
                      {e.reasoning ? (
                        <div
                          className={
                            isHighlighted
                              ? "border-border bg-primary/5 mt-1 flex items-start gap-1.5 rounded-md border-l-2 px-3 py-2 text-sm"
                              : "text-foreground/75 flex items-start gap-1.5 text-sm"
                          }
                        >
                          <Brain
                            size={14}
                            className="text-muted-foreground mt-0.5 shrink-0"
                          />
                          <span>{e.reasoning}</span>
                        </div>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Every action above is logged with full reasoning and a cryptographic
            signature. Auditors receive this trail without additional assembly.
          </span>
          <Link
            href={`/neoflo-workspace/invoice-processing/match/${application.invoiceId}`}
            className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
          >
            <PaperPlaneTilt size={12} />
            View match detail
          </Link>
        </div>

        {/* Full hash dialog */}
        {showFullHash ? (
          <div
            className="bg-foreground/50 fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setShowFullHash(false)}
          >
            <Card
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash size={18} className="text-primary" />
                  Full SHA-256 hash
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {hash ? (
                  <div className="bg-muted/40 text-foreground/90 rounded-md border px-4 py-3 font-mono text-xs leading-relaxed break-all">
                    {hash}
                  </div>
                ) : (
                  <Skeleton className="h-4 w-full" />
                )}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullHash(false)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCopyHash}
                    disabled={!hash}
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={14} weight="fill" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy hash
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
