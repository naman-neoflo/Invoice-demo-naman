// lib/neoflo-workspace/personas.ts
//
// Personas for the persona-aware workspace at /neoflo-workspace/*.
// Each action item and feed entry is tagged with the personas it's
// relevant to; the active persona filters what surfaces on the briefing
// + all-work pages. The "all" override (Vibs view) shows everything.

export type PersonaId =
  | "all" // Vibs override — see everything
  | "cfo"
  | "controller"
  | "ar-manager"
  | "ap-manager"
  | "cpo"
  | "treasurer"

export interface Persona {
  id: PersonaId
  name: string
  title: string
  initials: string
  /** Greeting prose tone — first-person greeting morning briefing copy. */
  greeting: string
  /** One-line framing for the briefing prose paragraph. */
  proseLead: string
}

export const PERSONAS: Persona[] = [
  {
    id: "all",
    name: "Vibs",
    title: "Founder view · everything",
    initials: "Vb",
    greeting: "Good morning, Vibs.",
    proseLead:
      "Since you logged off Friday, I handled work across the whole team. Here is everything that needs attention — across all personas.",
  },
  {
    id: "cfo",
    name: "Priya Mehta",
    title: "CFO",
    initials: "PM",
    greeting: "Good morning, Priya.",
    proseLead:
      "Two strategic items need your eyes today — working capital trapped in payment terms and close-day-3 blockers tied to bank rec.",
  },
  {
    id: "controller",
    name: "Daniel Park",
    title: "Controller",
    initials: "DP",
    greeting: "Good morning, Daniel.",
    proseLead:
      "Close progress is on track. A few items need a controller's eye — bank rec is waiting on feed, and there is one likely duplicate to confirm before the next payment run.",
  },
  {
    id: "ar-manager",
    name: "Sasha Patel",
    title: "AR Manager",
    initials: "SP",
    greeting: "Good morning, Sasha.",
    proseLead:
      "$480K at risk across 4 collections cases — I drafted everything overnight and queued them for your batch approval. Cash app applied $2.4M cleanly, 6 payments want a second look.",
  },
  {
    id: "ap-manager",
    name: "Lena Müller",
    title: "AP Manager",
    initials: "LM",
    greeting: "Good morning, Lena.",
    proseLead:
      "5 invoices need your eyes — price variances, missing GRNs, GL ambiguity. I also caught a $42,800 duplicate from Acme Cleaning that needs your confirm before the next payment run.",
  },
  {
    id: "cpo",
    name: "Olivia Brooks",
    title: "CPO",
    initials: "OB",
    greeting: "Good morning, Olivia.",
    proseLead:
      "Maverick spend at Westpoint and 2 early-pay discount opportunities are sitting in your queue. The DPO concentration analysis came back clean — no relationship risk if we stretch terms.",
  },
  {
    id: "treasurer",
    name: "Marcus Bauer",
    title: "Treasurer",
    initials: "MB",
    greeting: "Good morning, Marcus.",
    proseLead:
      "Day-3 close has 2 blockers tied to the JPMorgan bank feed. Working capital model shows $1.8M trapped — 12 vendors can absorb a DPO stretch without disruption.",
  },
]

export const DEFAULT_PERSONA: PersonaId = "all"

export function getPersona(id: PersonaId): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]
}
