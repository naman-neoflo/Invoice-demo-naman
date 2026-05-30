// app/neoflo-workspace/collections/audit/[actionId]/page.tsx
//
// Collections audit log — the SOX-defensibility surface for every Neo action
// taken in collections (dunning sent, dispute resolved, credit memo issued,
// escalation applied, account hold applied, promise follow-up sent). Per
// docs/handoff/collections/03-screen-specs.md § "Surface 5: Audit".
//
// TODO Phase 2: extract a shared <AuditTimeline> + summary/hash cards and
// refactor cash-app's, invoice-processing's, and collections' audit pages to
// consume them. For Phase 1 we mirror the invoice-processing JSX inline (same
// approach invoice-processing took with cash-app), so the prior surfaces
// carry zero regression risk.
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
import {
  SEED_APPLICATIONS,
  getApplication,
} from "@/lib/neoflo-os/collections/seed-applications"
import { getCustomer } from "@/lib/neoflo-os/collections/seed-customers"
import { getCase } from "@/lib/neoflo-os/collections/seed-cases"
import { getDispute } from "@/lib/neoflo-os/collections/seed-disputes"
import { getOpenInvoice } from "@/lib/neoflo-os/collections/seed-open-invoices"
import type {
  Application,
  AuditEvent,
  AuditEventType,
} from "@/lib/neoflo-os/collections/types"

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

function fmtUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`
}

// Map Application.type → short human label used in the picker and summary.
const APPLICATION_TYPE_LABEL: Record<Application["type"], string> = {
  "dunning-sent": "Dunning sent",
  "dispute-resolved": "Dispute resolved",
  "credit-memo-issued": "Credit memo issued",
  "escalation-applied": "Escalation applied",
  "account-hold-applied": "Account hold applied",
  "promise-followup-sent": "Promise follow-up sent",
}

function applicationTone(type: Application["type"]): {
  tone: "success" | "warning" | "neutral" | "danger" | "info"
  label: string
} {
  switch (type) {
    case "dunning-sent":
      return { tone: "info", label: APPLICATION_TYPE_LABEL[type] }
    case "dispute-resolved":
      return { tone: "success", label: APPLICATION_TYPE_LABEL[type] }
    case "credit-memo-issued":
      return { tone: "success", label: APPLICATION_TYPE_LABEL[type] }
    case "escalation-applied":
      return { tone: "warning", label: APPLICATION_TYPE_LABEL[type] }
    case "account-hold-applied":
      return { tone: "danger", label: APPLICATION_TYPE_LABEL[type] }
    case "promise-followup-sent":
      return { tone: "warning", label: APPLICATION_TYPE_LABEL[type] }
  }
}

// Map AuditEventType → human-readable label for the event pill.
const EVENT_LABEL: Record<AuditEventType, string> = {
  "case-prioritized": "Case prioritized",
  "email-drafted": "Email drafted",
  "tone-calibrated": "Tone calibrated",
  "evidence-pulled": "Evidence pulled",
  "dispute-investigated": "Dispute investigated",
  "credit-memo-issued": "Credit memo issued",
  "escalation-recommended": "Escalation recommended",
  "account-hold-flagged": "Account hold flagged",
  "promise-recorded": "Promise recorded",
  "promise-breached": "Promise breached",
  "email-sent": "Email sent",
  "human-approved": "Human approved",
  "human-edited": "Human edited",
  "human-rejected": "Human rejected",
  signed: "Hash signed",
}

// Events whose `reasoning` deserves the highlighted block (per spec — the
// "thinking-heavy" events that document Neo's judgement).
const HIGHLIGHTED_EVENT_TYPES = new Set<AuditEventType>([
  "case-prioritized",
  "tone-calibrated",
  "evidence-pulled",
  "dispute-investigated",
  "escalation-recommended",
])

// Pre-sort applications for the picker — hero application first (richest
// audit trail), then the rest by id for stability.
const PICKER_APPLICATIONS = [...SEED_APPLICATIONS].sort((a, b) => {
  const heroOrder = (id: string) =>
    id === "app-westpoint-2206-may-tier1-sent" ? 0 : 1
  const oa = heroOrder(a.id)
  const ob = heroOrder(b.id)
  if (oa !== ob) return oa - ob
  return a.id.localeCompare(b.id)
})

// Synthesize a deterministic ERP txn id from the application id. The hash
// changes per application so the displayed txn id is unique per record.
function synthErpTxnId(application: Application): string {
  // Use the first 6 chars of the hash as a stable numeric-ish suffix.
  const suffix = application.hash.slice(0, 6).toUpperCase()
  return `NS-${suffix}`
}

function describeLinkedEntity(application: Application): {
  customerName: string
  detail: string
} {
  const customer = getCustomer(application.customerId)
  const customerName = customer?.name ?? application.customerId

  switch (application.type) {
    case "dunning-sent": {
      const caseRecord = application.caseId
        ? getCase(application.caseId)
        : undefined
      if (caseRecord) {
        const firstInvoice = caseRecord.invoiceIds[0]
          ? getOpenInvoice(caseRecord.invoiceIds[0])
          : undefined
        const detail = firstInvoice
          ? `case ${caseRecord.id} · ${firstInvoice.invoiceNumber} · ${fmtUsd(caseRecord.totalOverdue)} overdue`
          : `case ${caseRecord.id} · ${fmtUsd(caseRecord.totalOverdue)} overdue`
        return { customerName, detail }
      }
      return { customerName, detail: "case not found" }
    }
    case "dispute-resolved": {
      const dispute = application.disputeId
        ? getDispute(application.disputeId)
        : undefined
      if (dispute) {
        return {
          customerName,
          detail: `dispute ${dispute.id} · ${dispute.invoiceNumber} · ${dispute.reasonLabel} · ${fmtUsd(dispute.disputeAmount)}`,
        }
      }
      return { customerName, detail: "dispute not found" }
    }
    case "credit-memo-issued": {
      return {
        customerName,
        detail: application.creditMemoId
          ? `credit memo ${application.creditMemoId}`
          : "credit memo",
      }
    }
    case "escalation-applied": {
      const caseRecord = application.caseId
        ? getCase(application.caseId)
        : undefined
      return {
        customerName,
        detail: caseRecord
          ? `case ${caseRecord.id} · ${fmtUsd(caseRecord.totalOverdue)} overdue · escalation ${application.escalationId ?? "—"}`
          : `escalation ${application.escalationId ?? "—"}`,
      }
    }
    case "account-hold-applied": {
      const caseRecord = application.caseId
        ? getCase(application.caseId)
        : undefined
      return {
        customerName,
        detail: caseRecord
          ? `case ${caseRecord.id} · ${fmtUsd(caseRecord.totalOverdue)} overdue · account hold`
          : "account hold",
      }
    }
    case "promise-followup-sent": {
      const caseRecord = application.caseId
        ? getCase(application.caseId)
        : undefined
      return {
        customerName,
        detail: caseRecord
          ? `case ${caseRecord.id} · promise breached · follow-up sent`
          : "promise follow-up",
      }
    }
  }
}

export default function CollectionsAuditPage() {
  const params = useParams<{ actionId: string }>()
  const router = useRouter()
  const actionId = params?.actionId ?? ""

  const application = React.useMemo(() => getApplication(actionId), [actionId])

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
                Action not found
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">
                No audit record matches the action id{" "}
                <span className="font-mono">{actionId || "(empty)"}</span>. Pick
                a different action from the dropdown below or return to the
                dashboard.
              </p>
              <Select
                value=""
                onValueChange={(next) =>
                  router.push(`/neoflo-workspace/collections/audit/${next}`)
                }
              >
                <SelectTrigger className="h-9 w-[460px] max-w-[60vw]">
                  <SelectValue placeholder="Pick an action..." />
                </SelectTrigger>
                <SelectContent>
                  {PICKER_APPLICATIONS.map((app) => {
                    const customer = getCustomer(app.customerId)
                    return (
                      <SelectItem key={app.id} value={app.id}>
                        <span className="text-muted-foreground mr-2 font-mono text-xs">
                          {app.id}
                        </span>
                        <span className="text-foreground">
                          {customer?.name ?? "Unknown customer"}
                        </span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          · {APPLICATION_TYPE_LABEL[app.type]}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Link
                href="/neoflo-workspace/collections"
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

  const customer = getCustomer(application.customerId)
  const tone = applicationTone(application.type)
  const linked = describeLinkedEntity(application)
  const events = application.auditTrail
  const firstEvent = events[0]
  const lastEvent = events[events.length - 1]
  const postedAtLabel = application.postedAt
    ? formatTimestamp(application.postedAt)
    : lastEvent
      ? formatTimestamp(lastEvent.timestamp)
      : "—"

  const signedEvent = [...events]
    .reverse()
    .find((e) => e.type === "signed")
  const signedActor =
    signedEvent?.actor === "human" && signedEvent.humanName
      ? signedEvent.humanName
      : "Neo"

  const erpTxnId = synthErpTxnId(application)

  const hash = application.hash
  const hashShort = hash.slice(0, 14)

  function handleCopyHash() {
    if (typeof navigator === "undefined" || !hash) return
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Back link */}
        <div className="flex items-center justify-between">
          <Link
            href="/neoflo-workspace/collections"
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
                Posted by {signedActor} · {postedAtLabel}
              </p>
              <Select
                value={application.id}
                onValueChange={(next) => {
                  if (next !== application.id) {
                    router.push(`/neoflo-workspace/collections/audit/${next}`)
                  }
                }}
              >
                <SelectTrigger className="h-9 w-[460px] max-w-[60vw]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PICKER_APPLICATIONS.map((app) => {
                    const c = getCustomer(app.customerId)
                    return (
                      <SelectItem key={app.id} value={app.id}>
                        <span className="text-muted-foreground mr-2 font-mono text-xs">
                          {app.id}
                        </span>
                        <span className="text-foreground">
                          {c?.name ?? "Unknown customer"}
                        </span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          · {APPLICATION_TYPE_LABEL[app.type]}
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
                  Customer
                </dt>
                <dd className="text-foreground text-sm">
                  {customer?.name ?? application.customerId}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Action type
                </dt>
                <dd>
                  <StatusBadge tone={tone.tone}>{tone.label}</StatusBadge>
                </dd>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Linked entity
                </dt>
                <dd className="text-foreground text-sm">
                  <span className="font-medium">{linked.customerName}</span>{" "}
                  <span className="text-muted-foreground">·</span>{" "}
                  <span className="font-mono text-xs">{linked.detail}</span>
                </dd>
              </div>
              <div className="flex flex-col gap-1 md:col-span-4">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  ERP / NetSuite
                </dt>
                <dd className="text-foreground text-sm">
                  Action recorded ·{" "}
                  <span className="font-mono text-xs">txn id: {erpTxnId}</span>{" "}
                  · status: success
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
                  <li
                    key={e.id ?? idx}
                    className="hover:bg-muted/40 flex gap-4 py-3.5 transition-colors"
                  >
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
                    {/* Middle: vertical dot/line */}
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
            href={`/neoflo-workspace/collections/customer/${application.customerId}`}
            className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
          >
            <PaperPlaneTilt size={12} />
            View customer detail
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
                  <Button size="sm" onClick={handleCopyHash} disabled={!hash}>
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
