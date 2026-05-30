// lib/workspace/seed-prompts.ts
export const SEED_COMMAND_BAR_EXAMPLES = [
  "why is bank rec stuck?",
  "draft replies to overdue collections",
  "show me everything that needs me",
  "what changed in cash this week?",
  "summarize day-3 close progress",
] as const

export type ChatSuggestion = {
  label: string
  intent: "summary" | "draft"
}

export const SEED_CHAT_SUGGESTIONS: ChatSuggestion[] = [
  { label: "Show me what's overdue across AP, AR and close", intent: "summary" },
  { label: "Draft replies to overdue collections (top 5)", intent: "draft" },
  { label: "What changed in cash this week?", intent: "summary" },
]

export const SEED_RECENT_PROMPTS = [
  "draft response to Pacific Distribution banking change",
  "why is invoice 4521 still open?",
] as const
