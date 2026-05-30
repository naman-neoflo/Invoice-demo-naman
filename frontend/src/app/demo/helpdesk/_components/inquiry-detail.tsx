"use client"

import * as React from "react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import {
  Sparkle,
  Lightning,
  Brain,
  PaperPlaneTilt,
  PencilSimple,
  Eye,
  Pause,
  CheckCircle,
  Warning,
  ShieldWarning,
  ShieldCheck,
  ClockCounterClockwise,
  Phone,
  Database,
  ArrowRight,
} from "@phosphor-icons/react"
import { formatDistanceToNowStrict } from "date-fns"

import { Button } from "@/components/neoflo-os/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/neoflo-os/ui/card"
import { Textarea } from "@/components/neoflo-os/ui/textarea"
import { Skeleton } from "@/components/neoflo-os/ui/skeleton"
import { Separator } from "@/components/neoflo-os/ui/separator"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Avatar, AvatarFallback } from "@/components/neoflo-os/ui/avatar"
import {
  getInquiry,
  getReceivedDate,
  type InquirySeed,
  type DataSource,
} from "@/lib/neoflo-os/demo-data"
import { useHydratedDemoStore, useDemoStore } from "@/lib/neoflo-os/demo-store"
import { ClassifierLabelPicker } from "./classifier-label-picker"
import { cn } from "@/lib/neoflo-os/utils"
import {
  helpdeskAuditUrl,
  type HelpdeskPrefix,
} from "@/lib/neoflo-os/workspace/helpdesk-routes"

const REVEAL_INTERVAL_MS = 800
// Total reveal cycle (data sources + reasoning + draft) ≈ 4 s, matching the script's "4–5 seconds".

type RevealStep = number // 0 = idle, 1..N = data source N revealed, N+1 = reasoning, N+2 = draft/actions

function DataSourceCard({
  source,
  revealed,
}: {
  source: DataSource
  revealed: boolean
}) {
  if (!revealed) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </Card>
    )
  }
  return (
    <Card className="border-emerald-200/60 bg-emerald-50/30 p-4 transition-colors duration-300">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white shadow-sm",
            source.tone ?? "bg-primary"
          )}
        >
          {source.system.split(" ")[0].slice(0, 3)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-semibold">
              {source.system}
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">
              {source.query}
            </span>
          </div>
          <span className="text-foreground/80 mt-1 text-sm">
            {source.result}
          </span>
        </div>
        <CheckCircle
          size={16}
          weight="fill"
          className="text-emerald-600 shrink-0"
        />
      </div>
    </Card>
  )
}

function ReasoningTrace({
  lines,
  visibleCount,
}: {
  lines: string[]
  visibleCount: number
}) {
  return (
    <ol className="flex flex-col gap-2.5">
      {lines.map((line, idx) => (
        <li
          key={idx}
          className={cn(
            "flex items-start gap-2.5 text-sm leading-relaxed transition-opacity duration-300",
            idx < visibleCount
              ? "text-foreground opacity-100"
              : "text-muted-foreground opacity-30"
          )}
        >
          <span className="bg-primary/15 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums">
            {idx + 1}
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  )
}

function FraudSignalCard({ signals }: { signals: string[] }) {
  return (
    <Card className="border-rose-200 bg-rose-50/40 p-4">
      <div className="flex items-center gap-2">
        <ShieldWarning
          size={16}
          weight="fill"
          className="text-rose-600 shrink-0"
        />
        <span className="text-rose-800 text-sm font-semibold">
          Fraud signals detected
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {signals.map((s) => (
          <li
            key={s}
            className="text-rose-900/90 flex items-start gap-2 text-sm"
          >
            <Warning
              size={14}
              weight="fill"
              className="text-rose-500 mt-0.5 shrink-0"
            />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function VerificationProtocolCard({
  steps,
  onInitiate,
  initiated,
}: {
  steps: string[]
  onInitiate: () => void
  initiated: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          Pre-built verification protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ol className="flex flex-col gap-2.5">
          {steps.map((s, idx) => (
            <li
              key={idx}
              className="text-foreground/90 flex items-start gap-2.5 text-sm leading-relaxed"
            >
              <span className="bg-primary/15 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums">
                {idx + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <Separator />
        <div className="flex items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Phone size={14} />
            Vendor contact on file: 415-555-0148 · Diana Park
          </div>
          <Button onClick={onInitiate} disabled={initiated}>
            {initiated ? (
              <>
                <CheckCircle size={16} weight="fill" />
                Verification initiated
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Initiate verification workflow
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function HistoricalCorrespondenceCard({
  entries,
}: {
  entries: { date: string; summary: string }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockCounterClockwise size={18} className="text-muted-foreground" />
          Historical correspondence
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entries.map((e) => (
          <div key={e.date} className="flex items-start gap-3 text-sm">
            <span className="text-muted-foreground w-24 shrink-0 tabular-nums">
              {e.date}
            </span>
            <span className="text-foreground/80">{e.summary}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function EmailCard({ inquiry }: { inquiry: InquirySeed }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="size-10">
            <AvatarFallback
              className={cn(
                "text-sm font-semibold",
                inquiry.supplierTone
              )}
            >
              {inquiry.supplierInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm font-semibold">
                {inquiry.contactName}
              </span>
              <span className="text-muted-foreground text-xs">
                &lt;{inquiry.contactEmail}&gt;
              </span>
            </div>
            <span
              className="text-muted-foreground text-xs"
              suppressHydrationWarning
            >
              {inquiry.supplier} · received{" "}
              {formatDistanceToNowStrict(getReceivedDate(inquiry), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ClassifierLabelPicker
              inquiryId={inquiry.id}
              seedLabel={inquiry.classifierLabel}
              seedTone={
                inquiry.classifierTone === "danger" ? "danger" : "info"
              }
              size="md"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Subject
          </div>
          <div className="text-foreground mt-1 text-base font-semibold">
            {inquiry.subject}
          </div>
        </div>
        <Separator />
        <div className="text-foreground/85 whitespace-pre-line text-sm leading-relaxed">
          {inquiry.body}
        </div>
        {inquiry.riskLabel && (
          <div className="border-rose-300 bg-rose-50 text-rose-800 mt-2 flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium">
            <Warning size={14} weight="fill" />
            Sender domain ({inquiry.contactDomain}) does not match the
            vendor&apos;s historical communications.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProcessingPanel({
  inquiry,
  onProcess,
}: {
  inquiry: InquirySeed
  onProcess: () => void
}) {
  const isHighRisk = inquiry.classifierTone === "danger"
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightning size={18} className="text-primary" />
          Process inquiry
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Neoflo will pull data from the systems of record, reason about the{" "}
          {isHighRisk ? "request and risk profile" : "discrepancy"}, and{" "}
          {isHighRisk
            ? "queue this inquiry for the AP Director with a pre-built verification protocol."
            : "draft a reply for review."}{" "}
          Average wall-clock time: 4 seconds.
        </p>
        <div className="flex items-center gap-2">
          <Button onClick={onProcess}>
            <Lightning size={16} weight="fill" />
            Process inquiry
          </Button>
          <span className="text-muted-foreground text-xs">
            No supplier-facing action is taken yet.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function InquiryDetail({
  prefix = "/demo",
}: {
  prefix?: HelpdeskPrefix
} = {}) {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ""
  const inquiry = React.useMemo(() => getInquiry(id), [id])

  const status = useHydratedDemoStore(
    (s) => s.inquiries[id]?.status ?? "unread"
  )
  const beginProcessing = useDemoStore((s) => s.beginProcessing)
  const completeProcessing = useDemoStore((s) => s.completeProcessing)
  const markSent = useDemoStore((s) => s.markSent)
  const markVerifying = useDemoStore((s) => s.markVerifying)

  const dataSources = inquiry?.dataSources ?? []
  const reasoning = inquiry?.reasoningTrace ?? []
  const totalDataSteps = dataSources.length

  const [step, setStep] = React.useState<RevealStep>(0)
  const [draft, setDraft] = React.useState<string>(
    inquiry?.draftedResponse ?? ""
  )

  // Sync draft when inquiry changes (e.g., navigating between the two demo inquiries).
  React.useEffect(() => {
    if (inquiry?.draftedResponse) setDraft(inquiry.draftedResponse)
  }, [inquiry?.id, inquiry?.draftedResponse])

  // If status indicates we've already processed (e.g., page refresh after completion),
  // jump the reveal to the final step so the UI stays consistent.
  React.useEffect(() => {
    if (
      status === "auto-resolved" ||
      status === "sent" ||
      status === "queued" ||
      status === "verifying"
    ) {
      setStep(totalDataSteps + 2)
    } else if (status === "unread") {
      setStep(0)
    }
  }, [status, totalDataSteps])

  // Progressive reveal driver — only runs while status === "processing".
  React.useEffect(() => {
    if (status !== "processing") return
    if (step >= totalDataSteps + 2) {
      const outcome =
        inquiry?.classifierTone === "danger" ? "queued" : "auto-resolved"
      completeProcessing(id, outcome)
      return
    }
    const timer = setTimeout(() => setStep((s) => s + 1), REVEAL_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [status, step, totalDataSteps, completeProcessing, id, inquiry?.classifierTone])

  if (!inquiry) {
    notFound()
  }

  const isHighRisk = inquiry.classifierTone === "danger"
  const isProcessing = status === "processing"
  const isSent = status === "sent" || status === "verifying"
  const reasoningVisibleCount =
    step >= totalDataSteps + 1 ? reasoning.length : 0
  const showActions = step >= totalDataSteps + 2

  function handleProcess() {
    setStep(0)
    beginProcessing(id)
    // Reveal first card immediately so the panel doesn't sit on an empty state for 800ms.
    setTimeout(() => setStep(1), 80)
  }

  return (
    <>
      {isHighRisk && (
        <div className="bg-rose-50 border-rose-200 text-rose-900 flex items-center gap-3 border-b px-6 py-2.5">
          <ShieldWarning size={16} weight="fill" className="text-rose-600" />
          <span className="text-sm font-medium">
            HIGH RISK · Banking change request
          </span>
          <span className="text-rose-700/80 text-xs">
            Auto-response is disabled by policy. This inquiry must be verified by
            an AP Director before any payment-instruction change.
          </span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* LEFT: Original email + (for inquiry 2) historical correspondence */}
          <div className="flex flex-col gap-6">
            <EmailCard inquiry={inquiry} />
            {isHighRisk && inquiry.historicalCorrespondence && (
              <HistoricalCorrespondenceCard
                entries={inquiry.historicalCorrespondence}
              />
            )}
          </div>

          {/* RIGHT: Process panel OR data sources + reasoning + draft/protocol */}
          <div className="flex flex-col gap-6">
            {status === "unread" ? (
              <ProcessingPanel
                inquiry={inquiry}
                onProcess={handleProcess}
              />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database size={18} className="text-primary" />
                      Data retrieval
                      {isProcessing && (
                        <span className="text-muted-foreground text-xs font-normal">
                          · pulling from systems of record
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {dataSources.map((src, idx) => (
                      <DataSourceCard
                        key={src.system}
                        source={src}
                        revealed={step >= idx + 1}
                      />
                    ))}
                    {!isHighRisk && (
                      <div className="text-muted-foreground inline-flex items-center gap-2 text-xs">
                        {step >= totalDataSteps ? (
                          <>
                            <CheckCircle
                              size={14}
                              weight="fill"
                              className="text-emerald-600"
                            />
                            All data sources resolved
                          </>
                        ) : (
                          "Awaiting more sources…"
                        )}
                      </div>
                    )}
                    {isHighRisk && step >= totalDataSteps && inquiry.fraudSignals && (
                      <FraudSignalCard signals={inquiry.fraudSignals} />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain size={18} className="text-primary" />
                      Reasoning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reasoning.length > 0 ? (
                      <ReasoningTrace
                        lines={reasoning}
                        visibleCount={reasoningVisibleCount}
                      />
                    ) : (
                      <Skeleton className="h-12 w-full" />
                    )}
                  </CardContent>
                </Card>

                {!isHighRisk && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PencilSimple size={18} className="text-primary" />
                        Drafted response
                        <span className="text-muted-foreground text-xs font-normal">
                          · to {inquiry.responseRecipient}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {showActions ? (
                        <Textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={9}
                          className="font-sans text-sm leading-relaxed"
                          disabled={isSent}
                        />
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      )}
                      {showActions && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            disabled={isSent}
                          >
                            <Pause size={16} />
                            Hold for human
                          </Button>
                          <Button
                            variant="outline"
                            disabled={isSent}
                          >
                            <PencilSimple size={16} />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            disabled={isSent}
                          >
                            <Eye size={16} />
                            Review
                          </Button>
                          <Button
                            onClick={() => markSent(id)}
                            disabled={isSent}
                          >
                            {isSent ? (
                              <>
                                <CheckCircle size={16} weight="fill" />
                                Sent
                              </>
                            ) : (
                              <>
                                <PaperPlaneTilt size={16} />
                                Send
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      {isSent && inquiry.responseRecipient && (
                        <div className="border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                          <CheckCircle size={14} weight="fill" />
                          Response sent to {inquiry.responseRecipient}.{" "}
                          <Link
                            href={helpdeskAuditUrl(prefix, inquiry.id)}
                            className="underline underline-offset-2 hover:text-emerald-900"
                          >
                            View audit log
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {isHighRisk && showActions && inquiry.verificationProtocol && (
                  <VerificationProtocolCard
                    steps={inquiry.verificationProtocol}
                    onInitiate={() => markVerifying(id)}
                    initiated={status === "verifying"}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
