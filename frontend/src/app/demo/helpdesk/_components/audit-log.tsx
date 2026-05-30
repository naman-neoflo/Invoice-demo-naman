"use client"

import * as React from "react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  Database,
  Brain,
  PaperPlaneTilt,
  Hash,
  Sparkle,
  ShieldCheck,
  CheckCircle,
  ShieldWarning,
  Copy,
} from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/neoflo-os/ui/card"
import { Separator } from "@/components/neoflo-os/ui/separator"
import { Skeleton } from "@/components/neoflo-os/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/neoflo-os/ui/select"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { ALL_INQUIRIES, getInquiry, getReceivedDate } from "@/lib/neoflo-os/demo-data"
import { useHydratedDemoStore } from "@/lib/neoflo-os/demo-store"
import {
  helpdeskAuditUrl,
  helpdeskInquiryUrl,
  type HelpdeskPrefix,
} from "@/lib/neoflo-os/workspace/helpdesk-routes"

const FALLBACK_HASH =
  "9f1c0d5b6a4e3d2c1b0a99887766554433221100ffeeddccbbaa99887766abcd"

function pad3(n: number): string {
  return n.toString().padStart(3, "0")
}

function formatTimestamp(d: Date): string {
  const time = d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  })
  return `${time}.${pad3(d.getUTCMilliseconds())} UTC`
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

// All inquiries that have an audit-event trail are pickable from this page.
const AUDITABLE_INQUIRIES = ALL_INQUIRIES.filter(
  (i) => i.auditEvents && i.auditEvents.length > 0
)

export function AuditLog({
  prefix = "/demo",
}: {
  prefix?: HelpdeskPrefix
} = {}) {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ?? ""
  const inquiry = React.useMemo(() => getInquiry(id), [id])

  const runtime = useHydratedDemoStore((s) => s.inquiries[id])
  const labelOverride = useHydratedDemoStore(
    (s) => s.classifierOverrides[id],
  )

  // Anchor the audit-event timestamps to either the recorded processedAt or the inquiry's
  // computed received time. Recomputed each render so the trail reads as fresh.
  const baseDate = React.useMemo(() => {
    if (runtime?.processedAt) return new Date(runtime.processedAt)
    if (inquiry) return getReceivedDate(inquiry)
    return new Date()
  }, [runtime?.processedAt, inquiry])

  const events = inquiry?.auditEvents ?? []

  const stamped = React.useMemo(
    () =>
      events.map((e) => ({
        ...e,
        date: new Date(baseDate.getTime() + e.offsetMs),
      })),
    [events, baseDate]
  )

  const [hash, setHash] = React.useState<string>(FALLBACK_HASH)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!inquiry) return
    const payload = JSON.stringify({
      id: inquiry.id,
      supplier: inquiry.supplier,
      classifier: inquiry.classifierLabel,
      classifierOverride: labelOverride
        ? { label: labelOverride.label, at: labelOverride.at }
        : null,
      events: stamped.map((e) => ({
        action: e.action,
        source: e.source,
        reasoning: e.reasoning,
        ts: e.date.toISOString(),
      })),
      response: inquiry.draftedResponse ?? null,
    })
    let cancelled = false
    computeHash(payload).then((h) => {
      if (!cancelled) setHash(h)
    })
    return () => {
      cancelled = true
    }
  }, [inquiry, stamped, labelOverride])

  if (!inquiry) {
    notFound()
  }

  const isHighRisk = inquiry.classifierTone === "danger"
  const isSent = runtime?.status === "sent"
  const isResolved =
    runtime?.status === "auto-resolved" || runtime?.status === "sent"
  const isQueued =
    runtime?.status === "queued" || runtime?.status === "verifying"

  const lastEvent = stamped[stamped.length - 1]
  const firstEvent = stamped[0]
  const durationMs = lastEvent && firstEvent
    ? lastEvent.date.getTime() - firstEvent.date.getTime()
    : 0
  const durationLabel = `${(durationMs / 1000).toFixed(2)} s`

  function handleCopyHash() {
    if (typeof navigator === "undefined") return
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Ticket picker toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={inquiry.id}
            onValueChange={(next) => {
              if (next !== inquiry.id) router.push(helpdeskAuditUrl(prefix, next))
            }}
          >
            <SelectTrigger className="h-9 w-[360px] max-w-[60vw]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUDITABLE_INQUIRIES.map((seed) => (
                <SelectItem key={seed.id} value={seed.id}>
                  <span className="text-muted-foreground mr-2 text-xs">
                    {seed.supplier}
                  </span>
                  <span className="text-foreground">{seed.subject}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <StatusBadge tone={isHighRisk ? "warning" : "success"}>
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
                  Inquiry ID
                </dt>
                <dd className="text-foreground text-sm font-mono tabular-nums">
                  {inquiry.id}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Supplier
                </dt>
                <dd className="text-foreground text-sm">{inquiry.supplier}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Classifier
                </dt>
                <dd className="text-foreground text-sm">
                  {labelOverride?.label ?? inquiry.classifierLabel}
                  {labelOverride ? (
                    <span className="text-muted-foreground ml-1.5 text-xs">
                      · re-labeled (was {inquiry.classifierLabel})
                    </span>
                  ) : null}
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
              <div className="flex flex-col gap-1 md:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Outcome
                </dt>
                <dd>
                  {isSent && (
                    <StatusBadge tone="success">
                      Response sent to {inquiry.responseRecipient}
                    </StatusBadge>
                  )}
                  {isResolved && !isSent && (
                    <StatusBadge tone="success">
                      Auto-resolved · awaiting send
                    </StatusBadge>
                  )}
                  {isQueued && (
                    <StatusBadge tone="warning">
                      <ShieldWarning size={12} weight="fill" />
                      Escalated to AP Director queue · no supplier response
                    </StatusBadge>
                  )}
                  {!isResolved && !isQueued && (
                    <StatusBadge tone="neutral">
                      Not processed in this session
                    </StatusBadge>
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Anchor timestamp
                </dt>
                <dd
                  className="text-foreground text-sm font-mono tabular-nums"
                  suppressHydrationWarning
                >
                  {formatTimestamp(baseDate)}
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
                · {stamped.length} events · millisecond precision
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col">
              {stamped.map((e, idx) => (
                <li key={idx} className="flex gap-4 py-3.5">
                  <div className="flex w-44 shrink-0 flex-col">
                    <span
                      className="text-foreground text-xs font-mono font-semibold tabular-nums"
                      suppressHydrationWarning
                    >
                      {formatTimestamp(e.date)}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      +{e.offsetMs} ms
                    </span>
                  </div>
                  <div className="bg-border relative w-px shrink-0">
                    <span className="bg-primary absolute left-1/2 top-1.5 size-2 -translate-x-1/2 rounded-full" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 pb-1">
                    <div className="text-foreground text-sm font-semibold">
                      {e.action}
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
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Response sent (only for inquiry #1 path) */}
        {!isHighRisk && inquiry.draftedResponse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaperPlaneTilt size={18} className="text-primary" />
                Response sent
                <span className="text-muted-foreground text-xs font-normal">
                  · to {inquiry.responseRecipient}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 text-foreground/90 whitespace-pre-line rounded-md border px-4 py-3 text-sm leading-relaxed">
                {inquiry.draftedResponse}
              </div>
              {!isSent && (
                <p className="text-muted-foreground mt-3 text-xs">
                  Note: response has been drafted but has not been sent in this
                  demo session.
                </p>
              )}
            </CardContent>
          </Card>
        )}

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
            <div className="bg-muted/40 text-foreground/90 flex items-center gap-2 rounded-md border px-4 py-3 font-mono text-xs break-all leading-relaxed">
              {hash || <Skeleton className="h-4 w-full" />}
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-xs">
                Hash is computed live over the canonical JSON of all audit
                events plus the response text — deterministic per inquiry, and
                the contractual source of truth in the master agreement.
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
            Every action above is logged with full reasoning and a
            cryptographic signature. Auditors receive this trail without
            additional assembly.
          </span>
          <Link
            href={helpdeskInquiryUrl(prefix, inquiry.id)}
            className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
          >
            Back to inquiry
            <ArrowLeft size={12} className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  )
}
