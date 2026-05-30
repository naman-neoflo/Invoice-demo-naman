const buckets = new Map<string, number[]>()

const WINDOW_MS = 5 * 60 * 1000
const MAX_REQUESTS = 30

export function checkRateLimit(sessionId: string): boolean {
  const now = Date.now()
  const cutoff = now - WINDOW_MS
  const recent = (buckets.get(sessionId) ?? []).filter((t) => t > cutoff)
  if (recent.length >= MAX_REQUESTS) return true
  recent.push(now)
  buckets.set(sessionId, recent)
  return false
}
