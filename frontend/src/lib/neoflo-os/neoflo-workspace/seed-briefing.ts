// lib/neoflo-workspace/seed-briefing.ts
//
// Persona-aware view over the canonical SEED_BRIEFING. Decorates each
// action item with the personas it is relevant to so the briefing page
// can filter by the active persona. The classic /workspace tree keeps
// using the un-tagged seed, so this only affects /neoflo-workspace/*.

import {
  SEED_BRIEFING,
  type BriefingActionItem,
  type BriefingDocument,
} from "@/lib/neoflo-os/workspace/seed-briefing"
import type { PersonaId } from "./personas"

export type PersonaAwareBriefingActionItem = BriefingActionItem & {
  /** Persona ids this item should show up for. "all" appears for every persona. */
  relevantPersonas: PersonaId[]
}

export type PersonaAwareBriefingDocument = Omit<
  BriefingDocument,
  "actionItems"
> & {
  actionItems: PersonaAwareBriefingActionItem[]
}

// Map briefing action item ids → personas that care about it.
// Items not in the map default to ["all"] (always visible).
const PERSONA_TAGS_BY_ITEM_ID: Record<string, PersonaId[]> = {
  // High-risk fraud-adjacent verification — AP Manager owns, Controller monitors
  "pacific-banking-change": ["ap-manager", "controller"],

  // Cash app short-pays — AR Manager primary, Controller secondary
  "cash-app-short-pays": ["ar-manager", "controller"],

  // Close blockers — Controller + Treasurer share, CFO monitors
  "close-day-3-blocked": ["controller", "treasurer", "cfo"],

  // Invoice duplicate — AP Manager primary, Controller for sign-off
  "invoice-duplicate-acme": ["ap-manager", "controller"],

  // Invoice exceptions queue — AP Manager only (tactical)
  "invoice-exceptions-queue": ["ap-manager"],

  // Early-pay discount — CPO owns sourcing decision, Treasurer for cash impact
  "invoice-early-pay": ["cpo", "treasurer"],

  // Collections at risk — AR Manager primary, Controller for $$ risk
  "collections-at-risk": ["ar-manager", "controller"],

  // Broken promise — AR Manager only
  "collections-broken-promise": ["ar-manager"],

  // Account hold — AR Manager primary, CFO for relationship risk
  "collections-account-hold": ["ar-manager", "cfo"],

  // Working capital — strategic. CFO + Treasurer + CPO
  "spend-analytics-working-capital": ["cfo", "treasurer", "cpo"],
}

export const SEED_BRIEFING_PERSONA_AWARE: PersonaAwareBriefingDocument = {
  ...SEED_BRIEFING,
  actionItems: SEED_BRIEFING.actionItems.map((item) => ({
    ...item,
    relevantPersonas: PERSONA_TAGS_BY_ITEM_ID[item.id] ?? ["all"],
  })),
}

/**
 * Filter briefing action items by the active persona.
 * "all" returns everything (Vibs override). Any other persona returns
 * items tagged with that persona (items tagged "all" always show).
 */
export function filterBriefingByPersona(
  items: PersonaAwareBriefingActionItem[],
  persona: PersonaId,
): PersonaAwareBriefingActionItem[] {
  if (persona === "all") return items
  return items.filter(
    (it) =>
      it.relevantPersonas.includes("all") ||
      it.relevantPersonas.includes(persona),
  )
}
