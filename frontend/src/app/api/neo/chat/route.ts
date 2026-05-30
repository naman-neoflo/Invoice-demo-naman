import Anthropic from "@anthropic-ai/sdk"
import { type NextRequest } from "next/server"
import fs from "fs"
import path from "path"

// ---------------------------------------------------------------------------
// Key resolution — Next.js only hot-reloads .env.local on server start, so
// we fall back to reading the file directly to avoid needing a restart.
// ---------------------------------------------------------------------------
function resolveApiKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY

  try {
    const envPath = path.join(process.cwd(), ".env.local")
    const content = fs.readFileSync(envPath, "utf-8")
    const match = content.match(/^ANTHROPIC_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m)
    if (match?.[1]) return match[1].trim()
  } catch {
    // file missing or unreadable — fall through
  }

  return ""
}

const SYSTEM_PROMPT = `You are Neo, an intelligent AI assistant embedded in Neoflo Finance OS — an AI-powered financial operations platform.

You help finance teams with:
- Invoice processing, exceptions, and approvals
- Spend analytics and budget insights
- Cash application and AR reconciliation
- Collections management and customer outreach
- Cash flow forecasting
- General financial operations questions

You have access to the user's current workspace briefing context (provided below) which summarizes their pending tasks, recent activity, and key metrics.

Guidelines:
- Be concise and action-oriented — finance users are busy
- Reference specific data from the briefing context when relevant
- Suggest next steps proactively
- Use professional but friendly language
- Format responses with clear structure when listing items (use markdown)
- When asked about specific invoices, vendors, or amounts, reference the context provided`

interface Message {
  role: "user" | "assistant"
  content: string
}

interface BriefingSnapshot {
  timeRange?: string
  actionItems?: Array<{ title: string; meta?: string }>
  handled?: Array<{ text: string }>
}

interface RequestBody {
  messages: Message[]
  context?: BriefingSnapshot
}

export async function POST(req: NextRequest) {
  const apiKey = resolveApiKey()

  if (!apiKey) {
    console.error("[neo/chat] ANTHROPIC_API_KEY not found")
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { messages = [], context } = body
  if (!messages.length) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Build context block
  let contextBlock = ""
  if (context) {
    contextBlock = "\n\n--- CURRENT WORKSPACE BRIEFING ---"
    if (context.timeRange) contextBlock += `\nTime Range: ${context.timeRange}`
    if (context.actionItems?.length) {
      contextBlock += `\n\nPending Action Items (${context.actionItems.length}):`
      context.actionItems.slice(0, 10).forEach((item) => {
        contextBlock += `\n- ${item.title}${item.meta ? ` (${item.meta})` : ""}`
      })
    }
    if (context.handled?.length) {
      contextBlock += `\n\nRecently Handled (by Neo):`
      context.handled.slice(0, 5).forEach((h) => {
        contextBlock += `\n- ${h.text}`
      })
    }
    contextBlock += "\n--- END BRIEFING ---"
  }

  const client = new Anthropic({ apiKey })
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const send = (payload: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        )
      }

      try {
        const stream = await client.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 1024,
          stream: true,
          system: SYSTEM_PROMPT + contextBlock,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        })

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send({ type: "delta", text: event.delta.text })
          }
        }

        send({ type: "done" })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error("[neo/chat] Anthropic error:", message)
        send({ type: "error", message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
