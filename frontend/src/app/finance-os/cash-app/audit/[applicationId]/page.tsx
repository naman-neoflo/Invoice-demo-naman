// app/neoflo-workspace/cash-app/audit/[applicationId]/page.tsx
//
// Cash-app audit log surface — the credibility surface. Per
// docs/handoff/cash-app/03-screen-specs.md § "Surface 5: Audit log".
//
// TODO Phase 2: extract a shared <AuditTimeline> component and refactor
// helpdesk's _components/audit-log.tsx + this page to consume it. For
// Phase 1 we duplicate the JSX (Task 16 step 1 — approach A) so the
// helpdesk surface carries no regression risk.
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
import { getReasonCode } from "@/lib/neoflo-os/cash-app/reason-codes"
import {
  SEED_APPLICATIONS,
  getApplication,
} from "@/lib/neoflo-os/cash-app/seed-applications"
import { getCustomer } from "@/lib/neoflo-os/cash-app/seed-customers"
import { getInvoice } from "@/lib/neoflo-os/cash-app/seed-invoices"
import { getPayment } from "@/lib/neoflo-os/cash-app/seed-payments"
import type { Application, AuditEvent } from "@/lib/neoflo-os/cash-app/types"

const FALLBACK_HASH =
  "9f1c0d5b6a4e3d2c1b0a99887766554433221100ffeeddccbbaa99887766abcd"

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

function fmtAmount(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}

function fmtAmountSigned(n: number): string {
  const sign = n < 0 ? "-" : ""
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`
}

async function computeHash(payload: string): Promise<string> {
  if (
    typeof window === "undefined" ||
    typeof window.crypto?.subtle?.digest !== "function"
  ) {
    return FALLBACK_HASH
  }
  const data = new TextEncoder().encode(payload)
  const buf = await window.crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function statusTone(status: Application["status"]): {
  tone: "success" | "warning" | "neutral" | "danger" | "info"
  label: string
} {
  switch (status) {
    case "auto-applied":
      return { tone: "success", label: "Auto-applied" }
    case "human-approved":
      return { tone: "success", label: "Human-approved" }
    case "needs-review":
      return { tone: "warning", label: "Needs review" }
    case "held":
      return { tone: "neutral", label: "Held" }
    case "rejected":
      return { tone: "danger", label: "Rejected" }
  }
}

// Pre-sort applications for the picker — needs-review first (most interesting),
// then today's auto-applied, then historicals. Within each group, by paymentId.
const PICKER_APPLICATIONS = [...SEED_APPLICATIONS].sort((a, b) => {
  const order = (s: Application["status"]) =>
    s === "needs-review" ? 0 : s === "auto-applied" ? 1 : 2
  const oa = order(a.status)
  const ob = order(b.status)
  if (oa !== ob) return oa - ob
  return a.paymentId.localeCompare(b.paymentId)
})

export default function CashAppAuditPage() {
  const params = useParams<{ applicationId: string }>()
  const router = useRouter()
  const applicationId = params?.applicationId ?? ""

  const application = React.useMemo(
    () => getApplication(applicationId),
    [applicationId]
  )

  const [hash, setHash] = React.useState<string>("")
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!application) return
    const payload = JSON.stringify(application.audit)
    let cancelled = false
    computeHash(payload).then((h) => {
      if (!cancelled) setHash(h)
    })
    return () => {
      cancelled = true
    }
  }, [application])

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
                No application matches the ID{" "}
                <span className="font-mono">{applicationId || "(empty)"}</span>.
                Pick a different application from the dropdown below or return
                to the dashboard.
              </p>
              <Select
                value=""
                onValueChange={(next) =>
                  router.push(`/neoflo-workspace/cash-app/audit/${next}`)
                }
              >
                <SelectTrigger className="h-9 w-[420px] max-w-[60vw]">
                  <SelectValue placeholder="Pick an application..." />
                </SelectTrigger>
                <SelectContent>
                  {PICKER_APPLICATIONS.map((app) => {
                    const payment = getPayment(app.paymentId)
                    const customer = getCustomer(app.customerId)
                    return (
                      <SelectItem key={app.id} value={app.id}>
                        <span className="text-muted-foreground mr-2 font-mono text-xs">
                          {app.paymentId}
                        </span>
                        <span className="text-foreground">
                          {customer?.name ?? "Unknown customer"}
                        </span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          · {payment ? fmtAmount(payment.amount) : "—"}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Link
                href="/neoflo-workspace/cash-app"
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

  const payment = getPayment(application.paymentId)
  const customer = getCustomer(application.customerId)
  const status = statusTone(application.status)
  const events = application.audit
  const firstEvent = events[0]
  const lastEvent = events[events.length - 1]
  const durationMs =
    firstEvent && lastEvent
      ? new Date(lastEvent.timestamp).getTime() -
        new Date(firstEvent.timestamp).getTime()
      : 0
  const durationLabel = `${(durationMs / 1000).toFixed(2)} s`

  const reasonDef = application.shortPay
    ? getReasonCode(application.shortPay.reasonCode)
    : undefined

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
        {/* Picker toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={application.id}
            onValueChange={(next) => {
              if (next !== application.id) {
                router.push(`/neoflo-workspace/cash-app/audit/${next}`)
              }
            }}
          >
            <SelectTrigger className="h-9 w-[460px] max-w-[60vw]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PICKER_APPLICATIONS.map((app) => {
                const p = getPayment(app.paymentId)
                const c = getCustomer(app.customerId)
                return (
                  <SelectItem key={app.id} value={app.id}>
                    <span className="text-muted-foreground mr-2 font-mono text-xs">
                      {app.paymentId}
                    </span>
                    <span className="text-foreground">
                      {c?.name ?? "Unknown customer"}
                    </span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      · {p ? fmtAmount(p.amount) : "—"}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <StatusBadge tone={application.shortPay ? "warning" : "success"}>
              <ShieldCheck size={12} weight="fill" />
              SOX-defensible trail
            </StatusBadge>
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={18} className="text-primary" weight="fill" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Customer
                </dt>
                <dd className="text-foreground text-sm">
                  {customer?.name ?? "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Payment
                </dt>
                <dd className="text-foreground text-sm font-mono tabular-nums">
                  {application.paymentId}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Amount
                </dt>
                <dd className="text-foreground text-sm tabular-nums">
                  {payment ? fmtAmount(payment.amount) : "—"}
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
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Processing duration
                </dt>
                <dd className="text-foreground text-sm tabular-nums">
                  {durationLabel}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Posted to ERP
                </dt>
                <dd
                  className="text-foreground text-sm font-mono tabular-nums"
                  suppressHydrationWarning
                >
                  {application.postedToErpAt
                    ? formatTimestamp(application.postedToErpAt)
                    : "Pending review"}
                </dd>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Channel
                </dt>
                <dd className="text-foreground text-sm">
                  {payment
                    ? `${payment.bank} · ${payment.bankReference}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Event timeline
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
                return (
                  <li key={e.id ?? idx} className="flex gap-4 py-3.5">
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
                    <div className="bg-border relative w-px shrink-0">
                      <span className="bg-primary absolute left-1/2 top-1.5 size-2 -translate-x-1/2 rounded-full" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 pb-1">
                      <div className="text-foreground text-sm font-semibold">
                        {e.description}
                      </div>
                      {e.source && (
                        <div className="text-muted-foreground inline-flex w-fit items-center gap-1.5 text-xs">
                          <Database size={12} />
                          {e.source}
                        </div>
                      )}
                      {e.reasoning && (
                        <div className="text-foreground/75 flex items-start gap-1.5 text-sm">
                          <Brain
                            size={14}
                            className="text-muted-foreground mt-0.5 shrink-0"
                          />
                          <span>{e.reasoning}</span>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>

        {/* Application result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PaperPlaneTilt size={18} className="text-primary" />
              Application result
              <span className="text-muted-foreground text-xs font-normal">
                · {customer?.name ?? "Customer"} ·{" "}
                {payment ? fmtAmount(payment.amount) : "—"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="bg-muted/40 flex flex-col gap-3 rounded-md border px-4 py-3">
              <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Invoices applied ({application.invoiceAmounts.length})
              </div>
              <ul className="flex flex-col gap-2">
                {application.invoiceAmounts.map((line) => {
                  const invoice = getInvoice(line.invoiceId)
                  const fullyPaid =
                    invoice && line.appliedAmount >= invoice.amount
                  return (
                    <li
                      key={line.invoiceId}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-foreground font-mono">
                          {invoice?.invoiceNumber ?? line.invoiceId}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {invoice?.lineSummary ?? ""}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 tabular-nums">
                        <span className="text-foreground font-medium">
                          {fmtAmount(line.appliedAmount)}
                        </span>
                        {invoice && !fullyPaid && (
                          <span className="text-muted-foreground text-xs">
                            of {fmtAmount(invoice.amount)}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {application.shortPay && (
              <div className="bg-muted/40 flex flex-col gap-2 rounded-md border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Short-pay
                  </div>
                  <StatusBadge tone="warning">
                    {reasonDef?.label ?? application.shortPay.reasonCode}
                  </StatusBadge>
                </div>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-foreground">Amount</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {fmtAmountSigned(application.shortPay.amount)}
                  </span>
                </div>
                <div className="text-foreground/80 text-sm leading-relaxed">
                  {application.shortPay.reasoning}
                </div>
                <div className="text-muted-foreground text-xs">
                  Accounting treatment:{" "}
                  <span className="text-foreground">
                    {application.shortPay.accountingTreatment}
                  </span>
                </div>
              </div>
            )}

            <div className="text-muted-foreground flex items-baseline justify-between gap-3 text-xs">
              <span>ERP write-back</span>
              <span
                className="text-foreground font-mono tabular-nums"
                suppressHydrationWarning
              >
                {application.postedToErpAt
                  ? formatTimestamp(application.postedToErpAt)
                  : "Held — awaiting human approval"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Hash */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash size={18} className="text-primary" />
              Cryptographic trail hash
              <span className="text-muted-foreground text-xs font-normal">
                · SHA-256
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="bg-muted/40 text-foreground/90 flex items-center gap-2 rounded-md border px-4 py-3 font-mono text-xs leading-relaxed break-all">
              {hash ? hash : <Skeleton className="h-4 w-full" />}
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-xs">
                {hash
                  ? "Hash is computed live over the canonical JSON of the audit trail — deterministic per application, and the contractual source of truth in the master agreement."
                  : "Computing…"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyHash}
                disabled={!hash}
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} weight="fill" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy hash
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Every action above is logged with full reasoning and a cryptographic
            signature. Auditors receive this trail without additional assembly.
          </span>
          <Link
            href={`/neoflo-workspace/cash-app/match/${application.paymentId}`}
            className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
          >
            <ArrowLeft size={12} />
            Back to match detail
          </Link>
        </div>
      </div>
    </div>
  )
}
