// app/demo/helpdesk/_components/classifier-label-picker.tsx
//
// Clickable classifier label. Renders the current label as a Sparkle-iconed
// StatusBadge-style pill; clicking opens a dropdown of every label in the
// catalog. Selecting one calls relabel() on the demo store — the override
// persists per inquiry and the audit log can pick it up as a training
// signal ("user re-labeled X → Y").
//
// Replaces the previous confidence-percentage chip per Vibs' feedback:
// the % overlapped visually with the Status column and didn't earn its
// pixels. The label is the user-actionable thing; making it clickable
// turns the static prediction into a teachable moment.
"use client"

import * as React from "react"
import { Check, PencilSimple, Sparkle } from "@phosphor-icons/react"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/neoflo-os/ui/dropdown-menu"
import { toast } from "sonner"

import { useHydratedDemoStore, useDemoStore } from "@/lib/neoflo-os/demo-store"
import { cn } from "@/lib/neoflo-os/utils"

// Catalog of every label the classifier emits in the seed data, plus a
// couple of common operator-known labels not yet seen in the seed (so the
// picker doesn't feel like a small fixed list). Tone "danger" maps to the
// rose StatusBadge variant; everything else is informational.
const DANGER_LABELS = new Set<string>(["Banking change request"])

const ALL_LABELS: string[] = [
  "Banking change request",
  "Document update",
  "Duplicate invoice",
  "Invoice correction",
  "Invoice status inquiry",
  "Payment ETA",
  "Payment confirmation",
  "Payment schedule",
  "Receipt confirmation",
  "Remittance request",
  "Short payment dispute",
  "Statement reconciliation",
  "Terms clarification",
  "Other / not actionable",
]

function toneFor(label: string): "danger" | "info" {
  return DANGER_LABELS.has(label) ? "danger" : "info"
}

interface ClassifierLabelPickerProps {
  inquiryId: string
  /** Seed-derived label (the classifier's original prediction). */
  seedLabel: string
  /** Seed-derived tone (the classifier's original prediction). */
  seedTone: "danger" | "info"
  /**
   * Visual size — inbox row is compact, inquiry detail is comfortable.
   */
  size?: "sm" | "md"
  className?: string
}

export function ClassifierLabelPicker({
  inquiryId,
  seedLabel,
  seedTone,
  size = "sm",
  className,
}: ClassifierLabelPickerProps) {
  const override = useHydratedDemoStore(
    (s) => s.classifierOverrides[inquiryId],
  )
  const relabel = useDemoStore((s) => s.relabel)

  const activeLabel = override?.label ?? seedLabel
  const activeTone = override?.tone ?? seedTone
  const isOverridden = Boolean(override)

  function handleSelect(label: string) {
    if (label === activeLabel) return
    relabel(inquiryId, label, toneFor(label))
    toast.success(`Re-labeled · ${label}`, {
      description:
        "Saved to the training set. Neo will use this on similar inquiries.",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Classifier label: ${activeLabel}${
            isOverridden ? " (re-labeled by you)" : ""
          }. Click to change and provide training feedback.`}
          title={
            isOverridden
              ? "Re-labeled by you · saved as training data"
              : undefined
          }
          className={cn(
            "group/label inline-flex items-center rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90",
            className,
          )}
        >
          <StatusBadge
            tone={activeTone === "danger" ? "danger" : "info"}
            showDot={false}
            className="whitespace-nowrap"
          >
            {isOverridden ? (
              <PencilSimple size={size === "sm" ? 12 : 13} weight="fill" />
            ) : (
              <Sparkle size={size === "sm" ? 12 : 13} weight="fill" />
            )}
            {activeLabel}
            <PencilSimple
              size={size === "sm" ? 10 : 11}
              weight="regular"
              className="opacity-0 transition-opacity group-hover/label:opacity-70 group-focus-visible/label:opacity-70"
            />
          </StatusBadge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-96 w-64 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkle size={10} weight="fill" />
          Re-label this inquiry
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_LABELS.map((label) => {
          const isActive = label === activeLabel
          const danger = toneFor(label) === "danger"
          return (
            <DropdownMenuItem
              key={label}
              onSelect={() => handleSelect(label)}
              className={cn(
                "flex items-center gap-2 py-1.5",
                danger && "text-rose-700",
              )}
            >
              <span className="flex-1 text-sm">{label}</span>
              {isActive ? (
                <Check size={12} weight="bold" className="text-primary" />
              ) : null}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <div className="text-muted-foreground px-2 py-1.5 text-[11px] leading-snug">
          Changes are saved to the training set and shown in the audit log.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
