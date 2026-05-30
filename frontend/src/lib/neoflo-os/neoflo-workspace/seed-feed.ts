// lib/neoflo-workspace/seed-feed.ts
//
// Persona-aware view over the canonical SEED_FEED. Decorates each feed
// item with the personas it is relevant to. Same pattern as
// seed-briefing.ts — adapter rather than fork.

import { SEED_FEED, type FeedItem } from "@/lib/neoflo-os/workspace/seed-feed"
import type { PersonaId } from "./personas"

export type PersonaAwareFeedItem = FeedItem & {
  relevantPersonas: PersonaId[]
}

// Tag every feed item id with the personas that care about it.
// Items missing from the map default to ["all"] (visible to everyone).
const PERSONA_TAGS_BY_FEED_ID: Record<string, PersonaId[]> = {
  // Helpdesk — high-risk verification routes to AP + Controller
  "pacific-banking-change": ["ap-manager", "controller"],
  "helpdesk-sumitomo-remittance": ["ap-manager"],
  "helpdesk-coastal-payment-status": ["ap-manager"],
  "helpdesk-westside-statement": ["ap-manager"],

  // Cash app — AR Manager owns, Controller for $$ visibility
  "cash-app-short-pays": ["ar-manager", "controller"],
  "cash-app-unapplied-aging": ["ar-manager"],
  "cash-app-overnight-posted": ["ar-manager", "controller"],

  // Close — Controller + Treasurer + CFO axis
  "close-day-3-blocked": ["controller", "treasurer", "cfo"],
  "close-day-3-progress": ["controller", "cfo"],

  // Collections — AR Manager primary, Controller/CFO for risk
  "collections-monday-batch": ["ar-manager"],
  "collections-atlantic-dispute-resolved": ["ar-manager", "controller"],
  "collections-pacific-account-hold": ["ar-manager", "cfo"],
  "collections-promise-expires-today": ["ar-manager"],
  "collections-dso-trend": ["cfo", "ar-manager"],

  // Invoice processing — AP Manager owns, Controller for duplicates/tax
  "invoice-processing-posted-24h": ["ap-manager"],
  "invoice-processing-duplicate-acme": ["ap-manager", "controller"],
  "invoice-processing-gst-singapore": ["ap-manager", "controller"],
  "invoice-processing-grn-pending": ["ap-manager"],
  "invoice-processing-tax-cross-border": ["ap-manager", "controller"],
  "invoice-processing-auto-posted-47": ["ap-manager"],

  // Spend — strategic CFO/CPO/Treasurer
  "spend-westpoint-maverick": ["cpo"],
  "spend-working-capital-opportunity": ["cfo", "treasurer", "cpo"],
  "spend-deferral-opportunity": ["treasurer", "cpo"],
  "spend-q2-concentration-alert": ["cpo", "cfo"],

  // Billing / KPIs — Controller + CFO
  "billing-q2-milestone-batch": ["controller", "cfo"],
  "kpi-may-flux-margin": ["cfo", "controller"],
}

export const SEED_FEED_PERSONA_AWARE: PersonaAwareFeedItem[] = SEED_FEED.map(
  (item) => ({
    ...item,
    relevantPersonas: PERSONA_TAGS_BY_FEED_ID[item.id] ?? ["all"],
  }),
)

export function filterFeedByPersona(
  items: PersonaAwareFeedItem[],
  persona: PersonaId,
): PersonaAwareFeedItem[] {
  if (persona === "all") return items
  return items.filter(
    (it) =>
      it.relevantPersonas.includes("all") ||
      it.relevantPersonas.includes(persona),
  )
}
