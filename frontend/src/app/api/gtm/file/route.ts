import { type NextRequest } from "next/server"

const GTM_BASE = "http://65.1.10.248:5002"
const GTM_KEY  = "nf-gtm-2026-secure"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filename = searchParams.get("filename")
  const run_id   = searchParams.get("run_id")

  if (!filename) {
    return new Response(JSON.stringify({ error: "filename is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const params = new URLSearchParams({ filename })
  if (run_id) params.set("run_id", run_id)

  try {
    const upstream = await fetch(`${GTM_BASE}/api/gtm/file?${params}`, {
      headers: { "X-API-Key": GTM_KEY },
    })
    const data = await upstream.json()
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[gtm/file] error:", err)
    return new Response(JSON.stringify({ error: "Upstream unreachable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }
}
