// components/neoflo-workspace/knowledge-source-dialog.tsx
//
// Modal that opens on KnowledgeSourceCard click. Renders full description,
// contents list, sample signals Neoflo extracts, and which workflows consume
// it. For "available" library packs, the primary CTA becomes "Upgrade to
// access" (mock — toast on click).
"use client"

import * as React from "react"
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Lightning,
  Quotes,
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
import { StatusPill } from "@/components/neoflo-os/neoflo-workspace/knowledge-source-card"
import {
  PACK_META,
  TIER_LABEL,
  WORKFLOW_LABEL,
  type KnowledgeSource,
} from "@/lib/neoflo-os/neoflo-workspace/knowledge"
import {
  useRulesPromotedToSOP,
  useSOPVersion,
} from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger-store"
import { cn } from "@/lib/neoflo-os/utils"

interface KnowledgeSourceDialogProps {
  source: KnowledgeSource | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Page-owned callback that opens the ConnectSourceDialog. */
  onConnectMore?: () => void
}

export function KnowledgeSourceDialog({
  source,
  open,
  onOpenChange,
  onConnectMore,
}: KnowledgeSourceDialogProps) {
  // SAFETY: hooks must run unconditionally — call with safe fallbacks
  // when source is null and bail out after.
  const safeSourceId = source?.id ?? ""
  const sopVersion = useSOPVersion(safeSourceId)
  const promotedRules = useRulesPromotedToSOP(safeSourceId)

  if (!source) return null
  const isLibrary = source.kind === "library"
  const packMeta = isLibrary && source.pack ? PACK_META[source.pack] : undefined
  const isLocked = source.status === "available"
  const isPromotionTarget =
    source.id === "src-ap-playbook" ||
    source.id === "src-ar-playbook" ||
    source.id === "src-approval-matrix"

  function handleUpgrade() {
    if (!source) return
    toast.success(`Upgrade request sent for ${source.name}`, {
      description:
        "Your CSM will follow up about the Pro / Premium plan within 1 business day.",
    })
    onOpenChange(false)
  }

  function handleConnectMore() {
    onOpenChange(false)
    onConnectMore?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <DialogTitle className="flex items-center gap-2 text-base">
                {source.name}
                <StatusPill source={source} />
              </DialogTitle>
              {packMeta ? (
                <DialogDescription className="text-xs">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      packMeta.pillBg,
                      packMeta.pillText,
                    )}
                  >
                    {source.pack}
                  </span>{" "}
                  · {TIER_LABEL[packMeta.tier]}
                </DialogDescription>
              ) : (
                <DialogDescription className="text-xs">
                  Internal source · {source.coverage}
                  {isPromotionTarget && promotedRules.length > 0 ? (
                    <>
                      {" "}·{" "}
                      <span className="text-primary font-medium">
                        {sopVersion} · {promotedRules.length} section
                        {promotedRules.length === 1 ? "" : "s"} from the
                        Cognitive Ledger
                      </span>
                    </>
                  ) : null}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Long-form description */}
          <p className="text-foreground/85 text-sm leading-relaxed">
            {source.detailBody}
          </p>

          <Separator />

          {/* Contents */}
          <section className="flex flex-col gap-2">
            <h4 className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              What&apos;s inside
            </h4>
            <ul className="flex flex-col gap-1.5">
              {source.contents.map((item, i) => (
                <li
                  key={i}
                  className="text-foreground/80 flex items-start gap-2 text-sm leading-relaxed"
                >
                  <CheckCircle
                    size={12}
                    weight="fill"
                    className="text-emerald-600 mt-1 shrink-0"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Lineage from the Cognitive Ledger — only for SOP targets */}
          {isPromotionTarget && promotedRules.length > 0 ? (
            <section className="border-primary/20 bg-primary/5 flex flex-col gap-3 rounded-lg border p-4">
              <h4 className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
                <Brain size={11} weight="regular" className="text-primary" />
                From the Cognitive Ledger · {promotedRules.length} section
                {promotedRules.length === 1 ? "" : "s"}
              </h4>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Rules the team approved + promoted into this SOP.
                Snapshots are frozen at promotion time — rule changes
                don&apos;t silently update the policy.
              </p>
              <ul className="flex flex-col gap-2">
                {promotedRules.map(({ promotion, isPrimary }) => (
                  <li
                    key={promotion.ruleId}
                    className="bg-card border-border/60 flex flex-col gap-1.5 rounded-md border p-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                        {isPrimary
                          ? `${promotion.sopVersion} · primary`
                          : "see also"}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        promoted{" "}
                        {new Date(promotion.promotedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <p className="text-foreground font-medium leading-snug">
                      {promotion.snapshotStatement}
                    </p>
                    {promotion.snapshotConditions.length > 0 ? (
                      <div className="text-muted-foreground border-border/40 mt-1 border-t pt-1.5 leading-relaxed">
                        <span className="text-foreground/70 font-medium">
                          Conditions:
                        </span>{" "}
                        {promotion.snapshotConditions.join(" · ")}
                      </div>
                    ) : null}
                    <a
                      href={`/neoflo-workspace/cognitive-ledger`}
                      className="text-primary hover:underline self-start text-[11px] font-medium"
                    >
                      Trace to source rule →
                    </a>
                  </li>
                ))}
              </ul>
              <div className="text-muted-foreground flex items-start gap-2 text-[11px] leading-snug">
                <Quotes size={11} weight="fill" className="mt-0.5 shrink-0 text-amber-500" />
                <span>
                  Audit reads cleanly: SOP section → source rule →
                  observations + human rationale that birthed it.
                </span>
              </div>
            </section>
          ) : null}

          {/* Sample signals */}
          <section className="bg-muted/30 flex flex-col gap-2 rounded-lg p-4">
            <h4 className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
              <Sparkle size={11} weight="fill" className="text-primary" />
              Signals Neo extracts
            </h4>
            <ul className="flex flex-col gap-1.5">
              {source.sampleSignals.map((sig, i) => (
                <li
                  key={i}
                  className="text-foreground/85 text-xs leading-relaxed italic"
                >
                  {sig}
                </li>
              ))}
            </ul>
          </section>

          {/* Workflows */}
          <section className="flex flex-col gap-2">
            <h4 className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              Powers
            </h4>
            <div className="flex flex-wrap items-center gap-1.5">
              {source.powers.map((w) => (
                <span
                  key={w}
                  className="bg-card border-border inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
                >
                  <Lightning
                    size={11}
                    weight="fill"
                    className="text-amber-500"
                  />
                  {WORKFLOW_LABEL[w]}
                </span>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isLocked ? (
            <Button onClick={handleUpgrade}>
              Upgrade to access
              <ArrowRight size={14} weight="bold" />
            </Button>
          ) : source.kind === "internal" ? (
            <Button variant="outline" onClick={handleConnectMore}>
              Add another source
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
