// app/neoflo-workspace/spend-analytics/audit/[actionId]/page.tsx
//
// Spend-analytics audit log — SOX-defensibility surface for every Neo action
// taken in spend-analytics (working-capital analyzed, DPO stretch, maverick
// procurement notification, deferral batch, concentration ack, override). Per
// docs/handoff/spend-analytics/03-screen-specs.md § "Surface 5: Audit".
//
// TODO Phase 2: extract a shared <AuditTimeline> + summary/hash cards and
// refactor cash-app's, invoice-processing's, collections', and
// spend-analytics' audit pages to consume them. For Phase 1 we mirror the
// collections JSX inline (same approach the prior workflows took), so the
// existing surfaces carry zero regression risk.
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
  getApplication,
  getMaverick,
  getVendor,
  getConcentrationRanking,
  getDeferralBatch,
} from "@/lib/neoflo-os/spend-analytics/derive"
import { SEED_APPLICATIONS } from "@/lib/neoflo-os/spend-analytics/seed-applications"
import type {
  Application,
  AuditEvent,
  AuditEventType,
} from "@/lib/neoflo-os/spend-analytics/types"

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

function formatPostedAt(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
  return `${date} · ${formatTimestamp(iso)}`
}

function fmtUsdK(amount: number): string {
  return `$${Math.round(amount / 1000).toLocaleString("en-US")}K`
}

// Map Application.type → short human label used in the picker and summary.
const APPLICATION_TYPE_LABEL: Record<Application["type"], string> = {
  "working-capital-analyzed": "Working capital analyzed",
  "dpo-stretch-approved": "DPO stretch approved",
  "maverick-procurement-notified": "Maverick procurement notified",
  "maverick-override-accepted": "Maverick override accepted",
  "deferral-batch-approved": "Deferral batch approved",
  "concentration-acknowledged": "Concentration acknowledged",
}

function applicationTone(type: Application["type"]): {
  tone: "success" | "warning" | "neutral" | "danger" | "info"
  label: string
} {
  switch (type) {
    case "working-capital-analyzed":
      return { tone: "info", label: APPLICATION_TYPE_LABEL[type] }
    case "dpo-stretch-approved":
      return { tone: "success", label: APPLICATION_TYPE_LABEL[type] }
    case "maverick-procurement-notified":
      return { tone: "warning", label: APPLICATION_TYPE_LABEL[type] }
    case "maverick-override-accepted":
      return { tone: "neutral", label: APPLICATION_TYPE_LABEL[type] }
    case "deferral-batch-approved":
      return { tone: "success", label: APPLICATION_TYPE_LABEL[type] }
    case "concentration-acknowledged":
      return { tone: "warning", label: APPLICATION_TYPE_LABEL[type] }
  }
}

// Map AuditEventType → human-readable label for the event pill.
const EVENT_TYPE_LABELS: Record<AuditEventType, string> = {
  "working-capital-analyzed": "Working capital analyzed",
  "dpo-opportunity-identified": "DPO opportunity identified",
  "maverick-detected": "Maverick detected",
  "vendor-switch-recommended": "Vendor switch recommended",
  "procurement-notified": "Procurement notified",
  "concentration-flagged": "Concentration flagged",
  "cashflow-projected": "Cash flow projected",
  "deferral-batch-proposed": "Deferral batch proposed",
  "deferral-batch-approved": "Deferral batch approved",
  "human-approved": "Human approved",
  "human-rejected": "Human rejected",
  "human-edited": "Human edited",
  signed: "Hash signed",
}

// Events whose `reasoning` deserves the highlighted block (per spec — the
// "thinking-heavy" events that document Neo's judgement).
const HIGHLIGHTED_EVENT_TYPES = new Set<AuditEventType>([
  "dpo-opportunity-identified",
  "vendor-switch-recommended",
  "deferral-batch-proposed",
  "cashflow-projected",
  "working-capital-analyzed",
])

// Pre-sort applications for the picker — hero application first (richest
// audit trail), then the rest by postedAt descending for stability.
const PICKER_APPLICATIONS = [...SEED_APPLICATIONS].sort((a, b) => {
  const heroOrder = (id: string) =>
    id === "app-deferral-may16-batch-1" ? 0 : 1
  const oa = heroOrder(a.id)
  const ob = heroOrder(b.id)
  if (oa !== ob) return oa - ob
  return b.postedAt.localeCompare(a.postedAt)
})

// Synthesize a deterministic ERP txn id from the application id. The hash
// changes per application so the displayed txn id is unique per record.
function synthErpTxnId(application: Application): string {
  const suffix = application.hash.slice(0, 6).toUpperCase()
  return `NS-${suffix}`
}

function describeLinkedEntity(application: Application): {
  title: string
  detail: string
} {
  switch (application.type) {
    case "deferral-batch-approved": {
      const batch = getDeferralBatch()
      return {
        title: "Deferral batch",
        detail: `${batch.itemCount} invoices · ${fmtUsdK(batch.totalDollars)} (${batch.id})`,
      }
    }
    case "maverick-procurement-notified": {
      const maverick = application.maverickId
        ? getMaverick(application.maverickId)
        : undefined
      if (maverick) {
        const vendor = getVendor(maverick.vendorId)
        return {
          title: "Maverick",
          detail: `${vendor?.name ?? maverick.vendorId} · ${fmtUsdK(maverick.totalSpend)} · ${maverick.category}`,
        }
      }
      return { title: "Maverick", detail: "maverick not found" }
    }
    case "dpo-stretch-approved": {
      const vendor = application.vendorId
        ? getVendor(application.vendorId)
        : undefined
      // Estimate stretched days + freed dollars from the audit-trail description.
      // For the demo we surface a deterministic-but-narrative line — the
      // payload-level numbers live in the audit-trail descriptions themselves.
      const dpoEvent = application.auditTrail.find(
        (e) => e.type === "dpo-opportunity-identified",
      )
      const dpoDesc = dpoEvent?.description ?? ""
      const daysMatch = dpoDesc.match(/(\d+)-day stretch/)
      const dollarsMatch = dpoDesc.match(/\$(\d+)K freed/)
      const days = daysMatch ? `+${daysMatch[1]} days` : "stretch applied"
      const dollars = dollarsMatch ? `$${dollarsMatch[1]}K freed` : ""
      return {
        title: "DPO stretch",
        detail: `${vendor?.name ?? application.vendorId} · ${days}${dollars ? ` · ${dollars}` : ""}`,
      }
    }
    case "concentration-acknowledged": {
      const vendor = application.vendorId
        ? getVendor(application.vendorId)
        : undefined
      const ranking = getConcentrationRanking()
      const entry = ranking.find((r) => r.vendorId === application.vendorId)
      const sharePct = entry ? Math.round(entry.share * 100) : null
      return {
        title: "Concentration",
        detail: sharePct
          ? `${vendor?.name ?? application.vendorId} · ${sharePct}% of total`
          : `${vendor?.name ?? application.vendorId}`,
      }
    }
    case "maverick-override-accepted": {
      const maverick = application.maverickId
        ? getMaverick(application.maverickId)
        : undefined
      const vendor = application.vendorId
        ? getVendor(application.vendorId)
        : undefined
      return {
        title: "Maverick override",
        detail: maverick
          ? `${vendor?.name ?? application.vendorId} · ${maverick.category}`
          : `${vendor?.name ?? application.vendorId}`,
      }
    }
    case "working-capital-analyzed": {
      return {
        title: "Working capital analysis",
        detail: "DPO + AP outflows + concentration review",
      }
    }
  }
}

export default function SpendAnalyticsAuditPage() {
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
                  router.push(`/neoflo-workspace/spend-analytics/audit/${next}`)
                }
              >
                <SelectTrigger className="h-9 w-[520px] max-w-[60vw]">
                  <SelectValue placeholder="Pick an action..." />
                </SelectTrigger>
                <SelectContent>
                  {PICKER_APPLICATIONS.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      <span className="text-muted-foreground mr-2 font-mono text-xs">
                        {app.id}
                      </span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        · {APPLICATION_TYPE_LABEL[app.type]} ·{" "}
                        {app.postedAt.slice(0, 10)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link
                href="/neoflo-workspace/spend-analytics"
                className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const tone = applicationTone(application.type)
  const linked = describeLinkedEntity(application)
  const events = application.auditTrail
  const firstEvent = events[0]
  const lastEvent = events[events.length - 1]
  const postedAtLabel = application.postedAt
    ? formatPostedAt(application.postedAt)
    : lastEvent
      ? formatTimestamp(lastEvent.timestamp)
      : "—"

  const signedActor = application.appliedBy ?? "Neo"

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
            href="/neoflo-workspace/spend-analytics"
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
                    router.push(`/neoflo-workspace/spend-analytics/audit/${next}`)
                  }
                }}
              >
                <SelectTrigger className="h-9 w-[520px] max-w-[60vw]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PICKER_APPLICATIONS.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      <span className="text-muted-foreground mr-2 font-mono text-xs">
                        {app.id}
                      </span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        · {APPLICATION_TYPE_LABEL[app.type]} ·{" "}
                        {app.postedAt.slice(0, 10)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Action type
                </dt>
                <dd>
                  <StatusBadge tone={tone.tone}>{tone.label}</StatusBadge>
                </dd>
              </div>
              <div className="flex flex-col gap-1 md:col-span-3">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  {linked.title}
                </dt>
                <dd className="text-foreground text-sm">
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
                          {EVENT_TYPE_LABELS[e.type] ?? e.type}
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
            href="/neoflo-workspace/spend-analytics"
            className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
          >
            <PaperPlaneTilt size={12} />
            Back to dashboard
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
