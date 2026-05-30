// components/neoflo-workspace/promote-to-sop-dialog.tsx
//
// "Promote rule to SOP" — the final step in the cognitive-ledger loop.
// An active rule that's been running reliably gets folded into the
// formal SOP document (AP playbook / Collections playbook / etc.).
//
// Design (from the design dialog):
//   - Human-initiated (Neo proposes; user clicks)
//   - SOP sections are snapshots — frozen at promotion time, never
//     auto-mutated by future rule changes
//   - Multi-SOP allowed: one primary, optional cross-references
"use client"

import * as React from "react"
import {
  ArrowRight,
  Books,
  BookOpen,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/neoflo-os/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Separator } from "@/components/neoflo-os/ui/separator"
import {
  WORKFLOW_DEFAULT_SOP_ID,
  type Rule,
} from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger"
import { useCognitiveLedgerStore } from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger-store"
import {
  getInternalSources,
  type KnowledgeSource,
} from "@/lib/neoflo-os/neoflo-workspace/knowledge"
import { cn } from "@/lib/neoflo-os/utils"

interface PromoteToSOPDialogProps {
  rule: Rule | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Only internal SOP-like sources are promotion targets. We curate by
// id so we don't accidentally offer "Vendor master" as an SOP target.
const SOP_CANDIDATE_IDS = new Set([
  "src-ap-playbook",
  "src-ar-playbook",
  "src-approval-matrix",
])

export function PromoteToSOPDialog({
  rule,
  open,
  onOpenChange,
}: PromoteToSOPDialogProps) {
  const promoteAction = useCognitiveLedgerStore((s) => s.promoteRuleToSOP)
  const sopPromotionCounts = useCognitiveLedgerStore(
    (s) => s.sopPromotionCounts,
  )

  const sopCandidates = React.useMemo(
    () => getInternalSources().filter((s) => SOP_CANDIDATE_IDS.has(s.id)),
    [],
  )

  const defaultPrimary =
    (rule && WORKFLOW_DEFAULT_SOP_ID[rule.workflow]) ?? sopCandidates[0]?.id

  const [primaryId, setPrimaryId] = React.useState<string>(defaultPrimary ?? "")
  const [secondaryIds, setSecondaryIds] = React.useState<string[]>([])

  // Reset selection when the dialog (re)opens with a different rule
  React.useEffect(() => {
    if (!open || !rule) return
    setPrimaryId(WORKFLOW_DEFAULT_SOP_ID[rule.workflow] ?? sopCandidates[0]?.id)
    setSecondaryIds([])
  }, [open, rule, sopCandidates])

  if (!rule) return null

  function handlePrimaryChange(id: string) {
    setPrimaryId(id)
    // Remove from cross-refs if user re-picks as primary
    setSecondaryIds((prev) => prev.filter((s) => s !== id))
  }

  function toggleSecondary(id: string) {
    setSecondaryIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  function handlePromote() {
    if (!rule || !primaryId) return
    const primarySop = sopCandidates.find((s) => s.id === primaryId)
    const nextVersion = projectedNextVersion(
      primaryId,
      sopPromotionCounts[primaryId] ?? 0,
    )
    promoteAction({
      ruleId: rule.id,
      primarySopId: primaryId,
      secondarySopIds: secondaryIds,
      snapshotStatement: rule.statement,
      snapshotConditions: rule.synthesis?.conditions ?? [],
      snapshotExceptions: rule.synthesis?.exceptions ?? [],
    })
    toast.success(`Promoted to ${primarySop?.name} ${nextVersion}`, {
      description: `Section added. The rule keeps running; the SOP section is frozen at this version so future rule changes don't silently mutate the policy.`,
      icon: <CheckCircle size={16} weight="fill" className="text-emerald-500" />,
    })
    onOpenChange(false)
  }

  const primarySop = sopCandidates.find((s) => s.id === primaryId)
  const nextVersion = primaryId
    ? projectedNextVersion(primaryId, sopPromotionCounts[primaryId] ?? 0)
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen size={18} weight="regular" className="text-primary" />
            Promote rule to SOP
          </DialogTitle>
          <DialogDescription>
            Fold this rule into your formal policy document. The SOP
            section is a snapshot — future rule changes will not silently
            update the policy. You stay in control of when the SOP
            evolves.
          </DialogDescription>
        </DialogHeader>

        {/* Rule preview */}
        <div className="bg-muted/40 border-border/60 rounded-lg border p-3">
          <div className="text-muted-foreground mb-1 text-[10px] font-semibold uppercase tracking-wider">
            <Sparkle size={10} weight="fill" className="text-primary mr-1 inline align-text-bottom" />
            Rule being promoted
          </div>
          <div className="text-foreground text-sm font-medium leading-snug">
            {rule.statement}
          </div>
          {rule.synthesis ? (
            <div className="text-muted-foreground mt-2 text-[11px]">
              {rule.synthesis.conditions.length} condition
              {rule.synthesis.conditions.length === 1 ? "" : "s"} ·{" "}
              {rule.synthesis.exceptions.length} exception
              {rule.synthesis.exceptions.length === 1 ? "" : "s"} ·{" "}
              applied {rule.appliedCount ?? 0}× in the last 30d
            </div>
          ) : null}
        </div>

        {/* Primary SOP picker */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-xs font-semibold">
            Primary SOP
          </div>
          <p className="text-muted-foreground -mt-1 text-[11px]">
            Where the rule will live as a numbered section. Default
            chosen from the rule&apos;s workflow.
          </p>
          <div className="flex flex-col gap-1.5">
            {sopCandidates.map((sop) => (
              <SOPRow
                key={sop.id}
                sop={sop}
                selected={sop.id === primaryId}
                onClick={() => handlePrimaryChange(sop.id)}
                role="radio"
                badge={
                  sop.id === primaryId && nextVersion
                    ? `Will become ${nextVersion}`
                    : undefined
                }
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Cross-reference SOPs (optional) */}
        <div className="flex flex-col gap-2">
          <div className="text-foreground text-xs font-semibold">
            Also reference in <span className="text-muted-foreground font-normal">· optional</span>
          </div>
          <p className="text-muted-foreground -mt-1 text-[11px]">
            Cross-reference into other SOPs that should point at this
            rule. Each will get a one-line &ldquo;see also&rdquo; entry,
            not a full section.
          </p>
          <div className="flex flex-col gap-1.5">
            {sopCandidates
              .filter((s) => s.id !== primaryId)
              .map((sop) => (
                <SOPRow
                  key={sop.id}
                  sop={sop}
                  selected={secondaryIds.includes(sop.id)}
                  onClick={() => toggleSecondary(sop.id)}
                  role="checkbox"
                />
              ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePromote} disabled={!primaryId}>
            <BookOpen size={14} weight="regular" />
            Promote to {primarySop?.name ?? "SOP"}
            {nextVersion ? ` ${nextVersion}` : ""}
            <ArrowRight size={12} weight="bold" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function projectedNextVersion(sopId: string, currentCount: number): string {
  // Mirror the deriveSopVersion in the store (kept private there) so
  // the dialog can preview the next version label.
  const base: Record<string, [number, number]> = {
    "src-ap-playbook": [3, 2],
    "src-ar-playbook": [2, 4],
    "src-approval-matrix": [1, 0],
  }
  const [major, baseMinor] = base[sopId] ?? [1, 0]
  return `v${major}.${baseMinor + currentCount + 1}`
}

function SOPRow({
  sop,
  selected,
  onClick,
  role,
  badge,
}: {
  sop: KnowledgeSource
  selected: boolean
  onClick: () => void
  role: "radio" | "checkbox"
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={role}
      aria-checked={selected}
      className={cn(
        "border-border/60 bg-card hover:border-primary/30 flex items-center gap-3 rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        selected && "border-primary/40 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md text-white text-[11px] font-semibold shadow-sm",
          sop.logoBg,
        )}
      >
        {sop.initials}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-foreground text-sm font-medium">
            {sop.name}
          </span>
          {badge ? (
            <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
              {badge}
            </span>
          ) : null}
        </div>
        <span className="text-muted-foreground text-[11px]">
          {sop.coverage}
        </span>
      </div>
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background",
        )}
      >
        {selected ? <CheckCircle size={10} weight="fill" /> : null}
      </div>
    </button>
  )
}
