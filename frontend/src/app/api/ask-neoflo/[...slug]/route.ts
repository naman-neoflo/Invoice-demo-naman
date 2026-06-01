/**
 * Catch-all proxy: forwards /api/ask-neoflo/<path> → Flask app /api/<path>
 * Handles both plain JSON and SSE streaming responses transparently.
 */
import { type NextRequest } from "next/server"

const FLASK_BASE =
  process.env.ASK_NEOFLO_API_URL ?? "http://65.1.10.248:5002"

async function proxy(req: NextRequest, slug: string[]): Promise<Response> {
  const path = slug.join("/")
  const search = req.nextUrl.searchParams.toString()
  const upstreamUrl = `${FLASK_BASE}/api/${path}${search ? "?" + search : ""}`

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
      // @ts-expect-error – Node 18 fetch supports duplex
      duplex: "half",
    })
  } catch (err) {
    console.error("[ask-neoflo proxy] upstream error:", err)
    return new Response(JSON.stringify({ error: "Upstream unreachable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  const ct = upstream.headers.get("Content-Type") ?? "application/json"
  const isSSE = ct.includes("text/event-stream")

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": ct,
      ...(isSSE
        ? {
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          }
        : {}),
    },
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  return proxy(req, slug)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  return proxy(req, slug)
}
