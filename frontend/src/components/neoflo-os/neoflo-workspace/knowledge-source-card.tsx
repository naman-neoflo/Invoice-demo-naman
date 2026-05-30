// components/neoflo-workspace/knowledge-source-card.tsx
//
// Card surface for a single KnowledgeSource — used on the /knowledge page
// in both the "Your sources" grid and the Neoflo library tier sections.
// Click → opens the detail dialog. Same hover/transition language as
// integration cards.
"use client"

import * as React from "react"
import {
  Bank,
  Books,
  Briefcase,
  Buildings,
  Calendar,
  ChartBar,
  Database,
  FileCode,
  FileText,
  Globe,
  Lightning,
  Receipt,
  Scales,
  ShieldWarning,
  Users,
} from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
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

const ICON_MAP = {
  FileText,
  Books,
  Database,
  Receipt,
  ShieldWarning,
  ChartBar,
  Users,
  Bank,
  Globe,
  Calendar,
  FileCode,
  Lightning,
  Scales,
  Buildings,
  Briefcase,
} as const

interface KnowledgeSourceCardProps {
  source: KnowledgeSource
  onOpen: (source: KnowledgeSource) => void
}

export function KnowledgeSourceCard({
  source,
  onOpen,
}: KnowledgeSourceCardProps) {
  const Icon = ICON_MAP[source.icon] ?? FileText
  const isLibrary = source.kind === "library"
  const isLocked = source.status === "available"
  // Cognitive-ledger lineage — surface promotions on SOP-target cards
  const isPromotionTarget =
    source.id === "src-ap-playbook" ||
    source.id === "src-ar-playbook" ||
    source.id === "src-approval-matrix"
  const promotedRules = useRulesPromotedToSOP(source.id)
  const sopVersion = useSOPVersion(source.id)
  const promotionCount = isPromotionTarget ? promotedRules.length : 0

  // Pack styling — picks the pill colour for library cards.
  const packMeta = isLibrary && source.pack ? PACK_META[source.pack] : undefined

  return (
    <button
      type="button"
      onClick={() => onOpen(source)}
      className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
    >
      <Card
        className={cn(
          "group hover:border-primary/30 hover:shadow-sm border-border/60 h-full rounded-xl transition-all",
          isLocked && "opacity-70 hover:opacity-100",
        )}
      >
        <div className="flex h-full flex-col gap-3 p-4">
          {/* Header: icon tile + name + status */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
                source.logoBg,
              )}
            >
              <Icon size={18} weight="regular" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <h3 className="text-foreground truncate text-sm font-semibold">
                  {source.name}
                </h3>
                {source.status === "active" ? (
                  <span
                    className="inline-block size-1.5 shrink-0 rounded-full bg-emerald-500"
                    aria-label="connected"
                  />
                ) : null}
              </div>
              <span className="text-muted-foreground truncate text-xs">
                {source.status === "active"
                  ? "Connected"
                  : source.status === "included"
                    ? `Included · ${packMeta?.tier ? TIER_LABEL[packMeta.tier] : ""}`
                    : `Upgrade · ${packMeta?.tier ? TIER_LABEL[packMeta.tier] : ""}`}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
            {source.description}
          </p>

          {/* Coverage + updated */}
          <div className="flex flex-col gap-0.5 text-[11px]">
            <span className="text-foreground/80 font-medium">
              {source.coverage}
            </span>
            <span className="text-muted-foreground">{source.lastUpdated}</span>
            {promotionCount > 0 ? (
              <span className="text-primary inline-flex items-center gap-1 font-medium">
                {sopVersion} · +{promotionCount} from Cognitive Ledger
              </span>
            ) : null}
          </div>

          {/* Workflows */}
          <div className="flex flex-wrap items-center gap-1">
            {source.powers.slice(0, 3).map((w) => (
              <span
                key={w}
                className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px]"
              >
                {WORKFLOW_LABEL[w]}
              </span>
            ))}
            {source.powers.length > 3 ? (
              <span className="text-muted-foreground text-[10px]">
                +{source.powers.length - 3}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </button>
  )
}

/**
 * Compact tier-status pill used on library card detail / header.
 */
export function PackStatusPill({ source }: { source: KnowledgeSource }) {
  if (source.kind !== "library" || !source.pack) return null
  const meta = PACK_META[source.pack]
  const label =
    source.status === "included" ? "Included" : `Upgrade · ${TIER_LABEL[meta.tier]}`
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        meta.pillBg,
        meta.pillText,
      )}
    >
      {label}
    </span>
  )
}

/**
 * Smaller "Connected"/"Included"/"Upgrade" status used in the detail dialog
 * header.
 */
export function StatusPill({ source }: { source: KnowledgeSource }) {
  if (source.status === "active") {
    return <StatusBadge tone="success">Connected</StatusBadge>
  }
  if (source.status === "included") {
    return <StatusBadge tone="info">Included</StatusBadge>
  }
  return <StatusBadge tone="warning">Upgrade required</StatusBadge>
}
