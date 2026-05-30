// lib/neoflo-workspace/cognitive-ledger-store.ts
//
// Per-rule mutation state for the Cognitive Ledger. Seed rules are
// frozen; this store layers user actions on top:
//
//   - approve(ruleId): advances the rule one step through its approval
//     chain. When the chain completes, the rule's effective status
//     flips drafted → active.
//   - refuse(ruleId): flips drafted → refused immediately.
//
// Effective rule state = seed ⊕ override (see getEffectiveRule below).
// The page reads effective rules and partitions them into Drafted /
// Active / Refused sections — so a refuse action visibly relocates the
// rule from Drafted to Refused on the same render.
"use client"

import * as React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { PersonaId } from "./personas"
import {
  SEED_RULES,
  type Rule,
  type RuleStatus,
} from "./cognitive-ledger"

interface RuleOverride {
  /** Force status — set to 'active' when chain completes, 'refused' on refuse. */
  status?: RuleStatus
  /** Override the chain's currentStep — increments with each approve. */
  currentStep?: number
  /** Appended on top of the seed chain.history. */
  approvalAdditions?: Array<{ approver: PersonaId; at: string }>
}

/**
 * Snapshot of the rule at the moment it was promoted into an SOP.
 * Per the design dialog: SOP sections are frozen at promotion time —
 * later rule changes do NOT auto-update the SOP. We can surface a
 * "drift" badge later if the rule diverges, but the SOP keeps its
 * authority as a fixed reference.
 */
export interface SOPPromotion {
  ruleId: string
  /** Primary SOP this rule lives in. */
  primarySopId: string
  /** Optional cross-reference SOPs ("see also"). */
  secondarySopIds: string[]
  /** Version label assigned to the SOP at promotion time (e.g. "v3.3"). */
  sopVersion: string
  promotedAt: string
  /** Frozen rule statement at promotion time. */
  snapshotStatement: string
  /** Frozen conditions. */
  snapshotConditions: string[]
  /** Frozen exceptions. */
  snapshotExceptions: string[]
}

interface LedgerState {
  overrides: Record<string, RuleOverride>
  /** ruleId → promotion record. Absent if not yet promoted. */
  sopPromotions: Record<string, SOPPromotion>
  /** Counts of promotions per SOP id — used to derive the SOP's current version. */
  sopPromotionCounts: Record<string, number>
  /** Advance the next pending approver in the chain by 1; auto-activates on final. */
  approveRule: (ruleId: string) => void
  /** Move the rule to Refused immediately. */
  refuseRule: (ruleId: string) => void
  /** Promote an active rule into an SOP. */
  promoteRuleToSOP: (args: {
    ruleId: string
    primarySopId: string
    secondarySopIds: string[]
    snapshotStatement: string
    snapshotConditions: string[]
    snapshotExceptions: string[]
  }) => void
  /** Reset everything (called from the demo's global Reset). */
  reset: () => void
}

// Each SOP starts at v3.2 (matches the seeded "AP playbook · v3.2" copy)
// or v2.4 for the AR-side. Subsequent promotions tick the minor version.
const SOP_BASE_VERSION: Record<string, [number, number]> = {
  "src-ap-playbook": [3, 2],
  "src-ar-playbook": [2, 4],
}
function deriveSopVersion(sopId: string, promotionsApplied: number): string {
  const base = SOP_BASE_VERSION[sopId] ?? [1, 0]
  return `v${base[0]}.${base[1] + promotionsApplied}`
}

export const useCognitiveLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      overrides: {},
      sopPromotions: {},
      sopPromotionCounts: {},
      approveRule: (ruleId) =>
        set((s) => {
          const seed = SEED_RULES.find((r) => r.id === ruleId)
          if (!seed) return s
          const override = s.overrides[ruleId] ?? {}
          const baseStep =
            override.currentStep ?? seed.approvalChain.currentStep
          const approver = seed.approvalChain.approvers[baseStep]
          if (!approver) return s // already past the end
          const nextStep = baseStep + 1
          const isFinal = nextStep >= seed.approvalChain.approvers.length
          const newAddition = {
            approver,
            at: new Date().toISOString(),
          }
          return {
            overrides: {
              ...s.overrides,
              [ruleId]: {
                status: isFinal ? "active" : "drafted",
                currentStep: nextStep,
                approvalAdditions: [
                  ...(override.approvalAdditions ?? []),
                  newAddition,
                ],
              },
            },
          }
        }),
      refuseRule: (ruleId) =>
        set((s) => ({
          overrides: {
            ...s.overrides,
            [ruleId]: {
              ...(s.overrides[ruleId] ?? {}),
              status: "refused",
            },
          },
        })),
      promoteRuleToSOP: (args) =>
        set((s) => {
          // Already promoted? No-op (the dialog won't re-open in that
          // case, but defend anyway).
          if (s.sopPromotions[args.ruleId]) return s
          const priorCount = s.sopPromotionCounts[args.primarySopId] ?? 0
          const newCount = priorCount + 1
          const sopVersion = deriveSopVersion(args.primarySopId, newCount)
          return {
            sopPromotions: {
              ...s.sopPromotions,
              [args.ruleId]: {
                ruleId: args.ruleId,
                primarySopId: args.primarySopId,
                secondarySopIds: args.secondarySopIds,
                sopVersion,
                promotedAt: new Date().toISOString(),
                snapshotStatement: args.snapshotStatement,
                snapshotConditions: args.snapshotConditions,
                snapshotExceptions: args.snapshotExceptions,
              },
            },
            sopPromotionCounts: {
              ...s.sopPromotionCounts,
              [args.primarySopId]: newCount,
            },
          }
        }),
      reset: () =>
        set({ overrides: {}, sopPromotions: {}, sopPromotionCounts: {} }),
    }),
    {
      name: "neoflo-cognitive-ledger-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? (undefined as unknown as Storage)
          : window.sessionStorage,
      ),
    },
  ),
)

/**
 * Compose seed + override into the rule the UI should render.
 */
export function getEffectiveRule(rule: Rule, override?: RuleOverride): Rule {
  if (!override) return rule
  const effectiveStatus = override.status ?? rule.status
  const effectiveStep =
    override.currentStep ?? rule.approvalChain.currentStep
  const effectiveHistory = [
    ...(rule.approvalChain.history ?? []),
    ...(override.approvalAdditions ?? []),
  ]
  return {
    ...rule,
    status: effectiveStatus,
    statusChangedAt:
      override.approvalAdditions?.[override.approvalAdditions.length - 1]
        ?.at ?? rule.statusChangedAt,
    approvalChain: {
      ...rule.approvalChain,
      currentStep: effectiveStep,
      history: effectiveHistory,
    },
  }
}

/**
 * SSR-safe hook: returns all rules with overrides applied. Before
 * hydration returns seed-only state to avoid a flash of "no overrides"
 * for users who have prior actions persisted.
 */
export function useHydratedLedgerRules(): Rule[] {
  const overrides = useCognitiveLedgerStore((s) => s.overrides)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return SEED_RULES
  return SEED_RULES.map((r) => getEffectiveRule(r, overrides[r.id]))
}

/**
 * Hydration-safe access to the SOP promotions map. Empty before mount.
 */
export function useHydratedSOPPromotions(): Record<string, SOPPromotion> {
  const promotions = useCognitiveLedgerStore((s) => s.sopPromotions)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return {}
  return promotions
}

/**
 * Has a rule been promoted to an SOP yet?
 */
export function useSOPPromotion(ruleId: string): SOPPromotion | undefined {
  return useHydratedSOPPromotions()[ruleId]
}

/**
 * Returns the SOP's current version label after applying all
 * promotions (e.g. "v3.4" after 2 promotions on top of v3.2).
 */
export function useSOPVersion(sopId: string): string {
  const counts = useCognitiveLedgerStore((s) => s.sopPromotionCounts)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const count = mounted ? counts[sopId] ?? 0 : 0
  return deriveSopVersion(sopId, count)
}

/**
 * All rules currently promoted to a given SOP — either as primary or
 * cross-reference. Used by the Knowledge SOP dialog to render the
 * "From the Cognitive Ledger" lineage section.
 */
export function useRulesPromotedToSOP(
  sopId: string,
): Array<{ promotion: SOPPromotion; isPrimary: boolean }> {
  const promotions = useHydratedSOPPromotions()
  const result: Array<{ promotion: SOPPromotion; isPrimary: boolean }> = []
  for (const promotion of Object.values(promotions)) {
    if (promotion.primarySopId === sopId) {
      result.push({ promotion, isPrimary: true })
    } else if (promotion.secondarySopIds.includes(sopId)) {
      result.push({ promotion, isPrimary: false })
    }
  }
  return result
}
