// components/neoflo-workspace/rule-card.tsx
//
// Renders a single rule on the Cognitive Ledger page. Variant by status:
//   - active: green, shows applied-count + impact + completed approval chain
//   - drafted: amber, shows multi-step approval chain with current step
//     highlighted + expandable synthesis trace + Approve/Refine/Refuse
//   - refused: muted, shows when + by whom
//
// The synthesis trace is the new "show your working" panel — surfaces
// conditions, exceptions, and rejection criteria so an approver sees
// exactly what the rule does before signing off.
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import {
  ArrowRight,
  BookOpen,
  CaretDown,
  CaretRight,
  CheckCircle,
  Lightning,
  PencilSimple,
  Sparkle,
  X,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { PromoteToSOPDialog } from "@/components/neoflo-os/neoflo-workspace/promote-to-sop-dialog"
import { getPersona } from "@/lib/neoflo-os/neoflo-workspace/personas"
import { useActivePersona } from "@/lib/neoflo-os/neoflo-workspace/persona-store"
import {
  isReadyForSOP,
  type Rule,
} from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger"
import {
  useCognitiveLedgerStore,
  useSOPPromotion,
} from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger-store"
import { getSourceById } from "@/lib/neoflo-os/neoflo-workspace/knowledge"
import { cn } from "@/lib/neoflo-os/utils"

const WORKFLOW_LABEL: Record<string, string> = {
  helpdesk: "Helpdesk",
  "cash-app": "Cash app",
  "invoice-processing": "Invoice processing",
  collections: "Collections",
  "spend-analytics": "Spend analytics",
  close: "Close",
  ar: "AR",
  ap: "AP",
}

function fmtDate(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d")
  } catch {
    return iso
  }
}

function STATUS_TONE(status: Rule["status"]) {
  if (status === "active") return "success" as const
  if (status === "drafted") return "warning" as const
  return "neutral" as const
}

interface RuleCardProps {
  rule: Rule
}

export function RuleCard({ rule }: RuleCardProps) {
  const isDrafted = rule.status === "drafted"
  const isActive = rule.status === "active"
  const isRefused = rule.status === "refused"
  const [traceOpen, setTraceOpen] = React.useState(false)
  const [promoteOpen, setPromoteOpen] = React.useState(false)

  const activePersonaId = useActivePersona()
  const approveRuleAction = useCognitiveLedgerStore((s) => s.approveRule)
  const refuseRuleAction = useCognitiveLedgerStore((s) => s.refuseRule)

  // SOP promotion state
  const promotion = useSOPPromotion(rule.id)
  const isPromoted = Boolean(promotion)
  const isReady = isActive && isReadyForSOP(rule) && !isPromoted

  function handleApprove() {
    const chain = rule.approvalChain
    const currentApprover = chain.approvers[chain.currentStep]
    if (!currentApprover) return
    const isFinalStep = chain.currentStep === chain.approvers.length - 1
    const approverLabel = getPersona(currentApprover).title
    approveRuleAction(rule.id)
    if (isFinalStep) {
      toast.success(`Rule activated by ${approverLabel}`, {
        description:
          "Approval chain complete. Moved to the Active rules section. Neo applies it from the next matching event.",
      })
    } else {
      const nextApprover = chain.approvers[chain.currentStep + 1]
      toast.success(
        `Approved by ${approverLabel} → routed to ${getPersona(nextApprover).title}`,
        {
          description:
            "Stays in Drafted until the chain completes. Approval chain updated on the card.",
        },
      )
    }
  }

  function handleRefuse() {
    refuseRuleAction(rule.id)
    toast(`Rule refused`, {
      description:
        "Moved to the Refused candidates section. Neo will not re-propose unless new signals emerge.",
    })
  }

  function handleRefine() {
    toast(`Refine rule`, {
      description:
        "Opens the rule editor — adjust conditions, scope, exceptions, and rejection criteria before re-routing for approval.",
    })
  }

  const synthesis = rule.synthesis
  const chain = rule.approvalChain
  const currentApprover = isDrafted ? chain.approvers[chain.currentStep] : null
  const canActAsCurrentApprover =
    isDrafted &&
    currentApprover != null &&
    (activePersonaId === "all" || activePersonaId === currentApprover)

  return (
    <Card
      className={cn(
        "bg-card border-border/60 p-5",
        isRefused && "opacity-70",
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Header — status + workflow + meta */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <StatusBadge tone={STATUS_TONE(rule.status)}>
            {isActive ? (
              <>
                <CheckCircle size={11} weight="fill" /> Active
              </>
            ) : isDrafted ? (
              <>
                <Lightning size={11} weight="fill" /> Drafted
              </>
            ) : (
              <>
                <X size={11} weight="bold" /> Refused
              </>
            )}
          </StatusBadge>
          <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5">
            {WORKFLOW_LABEL[rule.workflow]}
          </span>
          <span className="text-muted-foreground">
            From {rule.observationCount} observation
            {rule.observationCount === 1 ? "" : "s"}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {isActive ? "activated" : isDrafted ? "drafted" : "refused"}{" "}
            {fmtDate(rule.statusChangedAt)}
          </span>
        </div>

        {/* Statement */}
        <h3 className="text-foreground text-sm font-semibold leading-snug">
          {rule.statement}
        </h3>

        {/* Reasoning */}
        <p className="text-muted-foreground text-xs leading-relaxed">
          {rule.reasoning}
        </p>

        {/* Approval chain */}
        <ApprovalChainStrip chain={chain} isRefused={isRefused} />

        {/* Synthesis trace — show-your-working */}
        {synthesis ? (
          <div className="border-border/60 mt-1 rounded-md border">
            <button
              type="button"
              onClick={() => setTraceOpen((v) => !v)}
              className="text-muted-foreground hover:bg-muted/40 flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors"
              aria-expanded={traceOpen}
            >
              {traceOpen ? (
                <CaretDown size={12} weight="bold" />
              ) : (
                <CaretRight size={12} weight="bold" />
              )}
              <span className="text-foreground">Synthesis trace</span>
              <span className="text-muted-foreground/80">
                · {synthesis.conditions.length} condition
                {synthesis.conditions.length === 1 ? "" : "s"} ·{" "}
                {synthesis.exceptions.length} exception
                {synthesis.exceptions.length === 1 ? "" : "s"} ·{" "}
                {synthesis.rejectionCriteria.length} rejection rule
                {synthesis.rejectionCriteria.length === 1 ? "" : "s"}
              </span>
            </button>
            {traceOpen ? (
              <div className="border-border/60 flex flex-col gap-3 border-t px-4 py-3 text-xs">
                <TraceBlock
                  label="Conditions"
                  items={synthesis.conditions}
                  emptyText="No conditions captured."
                />
                <TraceBlock
                  label="Exceptions"
                  items={synthesis.exceptions}
                  emptyText="No exceptions."
                />
                <TraceBlock
                  label="Would NOT trigger"
                  items={synthesis.rejectionCriteria}
                  emptyText="No rejection criteria captured."
                />
                <div className="text-muted-foreground border-border/40 border-t pt-2 text-[11px]">
                  Built from {synthesis.contributingObservationIds.length}{" "}
                  observation
                  {synthesis.contributingObservationIds.length === 1 ? "" : "s"}{" "}
                  in the feed below.
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Footer — impact + applied count + actions */}
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {rule.impact ? (
              <span className="bg-emerald-100 text-emerald-700 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold dark:bg-emerald-500/20 dark:text-emerald-300">
                {rule.impact.value}
              </span>
            ) : null}
            {rule.impact ? (
              <span className="text-muted-foreground">{rule.impact.label}</span>
            ) : null}
            {isActive && typeof rule.appliedCount === "number" ? (
              <span className="text-muted-foreground">
                · applied {rule.appliedCount}× in the last 30d
              </span>
            ) : null}
            {isDrafted && currentApprover ? (
              <span className="text-muted-foreground">
                · waiting on{" "}
                <span className="text-foreground font-medium">
                  {getPersona(currentApprover).title}
                </span>
              </span>
            ) : null}
            {/* SOP promotion chips — shown only on active rules */}
            {isPromoted && promotion ? (
              <SOPChipStrip
                primarySopId={promotion.primarySopId}
                secondarySopIds={promotion.secondarySopIds}
                version={promotion.sopVersion}
              />
            ) : null}
          </div>

          {/* Action cluster — varies by status */}
          {isReady ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPromoteOpen(true)}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkle size={12} weight="fill" />
              Promote to SOP
              <ArrowRight size={12} weight="bold" />
            </Button>
          ) : null}

          {isDrafted ? (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={handleRefuse}>
                <X size={12} weight="bold" />
                Refuse
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefine}>
                <PencilSimple size={12} weight="regular" />
                Refine
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                title={
                  canActAsCurrentApprover
                    ? undefined
                    : currentApprover
                      ? `In your real environment, ${getPersona(currentApprover).title} would sign off on this step`
                      : undefined
                }
              >
                <CheckCircle size={12} weight="fill" />
                {chain.currentStep === chain.approvers.length - 1
                  ? "Activate"
                  : "Approve & route"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <PromoteToSOPDialog
        rule={rule}
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
      />
    </Card>
  )
}

/**
 * Renders the SOP attribution chips for a promoted rule — the primary
 * "In [SOP] vN.M" + any "see also" cross-references. Each chip links
 * to the Knowledge page filtered to that source so the policy doc is
 * one click away.
 */
function SOPChipStrip({
  primarySopId,
  secondarySopIds,
  version,
}: {
  primarySopId: string
  secondarySopIds: string[]
  version: string
}) {
  const primary = getSourceById(primarySopId)
  if (!primary) return null
  return (
    <span className="flex flex-wrap items-center gap-1">
      <span className="text-muted-foreground">·</span>
      <a
        href={`/neoflo-workspace/knowledge?source=${primarySopId}`}
        className="bg-primary/10 text-primary hover:bg-primary/15 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors"
        title={`Open ${primary.name} in Knowledge`}
      >
        <BookOpen size={10} weight="regular" />
        In {primary.name} {version}
      </a>
      {secondarySopIds.map((id) => {
        const sop = getSourceById(id)
        if (!sop) return null
        return (
          <a
            key={id}
            href={`/neoflo-workspace/knowledge?source=${id}`}
            className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] transition-colors"
            title={`Cross-referenced in ${sop.name}`}
          >
            see also · {sop.name}
          </a>
        )
      })}
    </span>
  )
}

/**
 * Renders the approval chain as a horizontal strip of persona pills
 * with arrows between them. Completed steps show green; the current
 * step pulses amber; future steps are muted.
 */
function ApprovalChainStrip({
  chain,
  isRefused,
}: {
  chain: Rule["approvalChain"]
  isRefused: boolean
}) {
  const historyMap = new Map(
    (chain.history ?? []).map((h) => [h.approver, h.at]),
  )
  return (
    <div className="border-border/60 bg-muted/30 flex flex-wrap items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px]">
      <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
        Approval
      </span>
      {chain.approvers.map((approverId, idx) => {
        const persona = getPersona(approverId)
        const approvedAt = historyMap.get(approverId)
        const isApproved = idx < chain.currentStep
        const isCurrent = idx === chain.currentStep && !isRefused
        const isFuture = idx > chain.currentStep
        return (
          <React.Fragment key={`${approverId}-${idx}`}>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5",
                isApproved &&
                  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-500/15 dark:text-emerald-300",
                isCurrent &&
                  "border-amber-300 bg-amber-50 text-amber-700 ring-2 ring-amber-200/50 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300",
                isFuture && "border-border bg-card text-muted-foreground",
              )}
              title={
                approvedAt
                  ? `Approved ${fmtDate(approvedAt)}`
                  : isCurrent
                    ? "Waiting on this approver"
                    : "Pending"
              }
            >
              {isApproved ? <CheckCircle size={10} weight="fill" /> : null}
              {isCurrent ? <Lightning size={10} weight="fill" /> : null}
              {persona.title}
            </span>
            {idx < chain.approvers.length - 1 ? (
              <ArrowRight
                size={10}
                className="text-muted-foreground/60"
                weight="bold"
              />
            ) : null}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function TraceBlock({
  label,
  items,
  emptyText,
}: {
  label: string
  items: string[]
  emptyText: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
        {label}
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground italic">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-foreground/85 flex items-start gap-2 leading-relaxed"
            >
              <span className="text-muted-foreground/60 mt-1.5 size-1 shrink-0 rounded-full bg-current" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
