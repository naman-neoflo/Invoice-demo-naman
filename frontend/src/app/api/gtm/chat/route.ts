import { type NextRequest } from "next/server"

const GTM_BASE = "http://65.1.10.248:5002"
const GTM_KEY  = "nf-gtm-2026-secure"

export async function POST(req: NextRequest) {
  let body: { query: string; session_id?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!body.query?.trim()) {
    return new Response(JSON.stringify({ error: "query is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${GTM_BASE}/api/gtm/chat`, {
      method: "POST",
      headers: {
        "X-API-Key": GTM_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: body.query, session_id: body.session_id }),
    })
  } catch (err) {
    console.error("[gtm/chat] upstream error:", err)
    return new Response(JSON.stringify({ error: "Upstream unreachable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(JSON.stringify({ error: "Upstream error", status: upstream.status }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Pipe the SSE stream straight through
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
