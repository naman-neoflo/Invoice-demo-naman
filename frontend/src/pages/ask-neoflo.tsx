import React, { useState, useRef, useEffect } from "react"
import Head from "next/head"
import { withAuthGuard } from "@/components/AuthGuard"
import { PaperPlaneTilt, ArrowClockwise, FilePdf, CheckCircle } from "@phosphor-icons/react"

// Injected once — keyframe animations for the thinking dots
const THINKING_CSS = `
@keyframes nf-blink {
  0%, 80%, 100% { opacity: 0.15; transform: scale(0.85); }
  40%            { opacity: 1;    transform: scale(1);    }
}
.nf-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#7c3aed; animation: nf-blink 1.2s infinite ease-in-out; }
.nf-dot:nth-child(2) { animation-delay: 0.2s; }
.nf-dot:nth-child(3) { animation-delay: 0.4s; }
`

// ── Types ─────────────────────────────────────────────────────────────────────

interface GtmEvent {
  type: "status" | "answer" | "done" | "error"
  message?: string
  text?: string
  pdf_urls?: string[]
  session_id?: string
  generated_in_ms?: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  status?: string
  pdf_urls?: string[]
  generated_in_ms?: number
  error?: boolean
}

// ── Inline text renderer (bold + code) ────────────────────────────────────

function InlineMd({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith("`") && part.endsWith("`"))
          return (
            <code key={i} style={{ background: "#f1f5f9", borderRadius: 4, padding: "1px 5px", fontSize: 12, fontFamily: "monospace" }}>
              {part.slice(1, -1)}
            </code>
          )
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </>
  )
}

// ── Full markdown renderer (tables + bold + code + paragraphs) ─────────────

function MdText({ text }: { text: string }) {
  // Split into blocks separated by blank lines
  const lines = text.split("\n")
  const blocks: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Detect markdown table: current line has pipes AND next line is |---|
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?[-:| ]+\|[-:| ]+\|?\s*$/.test(lines[i + 1])
    ) {
      const headerCells = line.split("|").map(c => c.trim()).filter(c => c !== "")
      i += 2 // skip header + separator

      const rows: string[][] = []
      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i].split("|").map(c => c.trim()).filter(c => c !== "")
        if (cells.length > 0) rows.push(cells)
        i++
      }

      blocks.push(
        <div key={i} style={{ overflowX: "auto", margin: "8px 0" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {headerCells.map((h, hi) => (
                  <th key={hi} style={{ border: "1px solid #e2e8f0", padding: "6px 12px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
                    <InlineMd text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ border: "1px solid #e2e8f0", padding: "6px 12px", color: "#1e293b" }}>
                      <InlineMd text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // Skip "source:" lines (raw source citations the API appends)
    if (/^source[s]?:/i.test(line.trim())) {
      i++
      continue
    }

    // Regular line
    if (line.trim() === "") {
      blocks.push(<br key={i} />)
    } else {
      blocks.push(
        <span key={i} style={{ display: "block", lineHeight: 1.65 }}>
          <InlineMd text={line} />
        </span>
      )
    }
    i++
  }

  return <div style={{ fontSize: 14, color: "#1e293b" }}>{blocks}</div>
}

// ── Suggestions ────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What is the total spend for Acclime?",
  "How many invoices do you have?",
  "Which vendor has the highest invoice amount?",
  "Show me invoices from April 2025",
  "List all vendors with pending invoices",
  "What is the average invoice value?",
]

// ── Page ──────────────────────────────────────────────────────────────────

function AskNeofloPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [pending, setPending] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(query: string) {
    const trimmed = query.trim()
    if (!trimmed || pending) return

    setDraft("")
    setPending(true)

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed }
    const assistantId = crypto.randomUUID()
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", status: "thinking" }

    setMessages(prev => [...prev, userMsg, assistantMsg])

    try {
      const res = await fetch("/api/gtm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        query: `Answer briefly in 1–2 sentences with key numbers only. No source lists. Question: ${trimmed}`,
        session_id: sessionId,
      }),
      })

      if (!res.ok || !res.body) {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, status: undefined, error: true } : m
        ))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          let event: GtmEvent
          try { event = JSON.parse(line.slice(6)) } catch { continue }

          if (event.type === "status") {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, status: event.message } : m
            ))
          } else if (event.type === "answer") {
            if (event.session_id) setSessionId(event.session_id)
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? {
                ...m, status: undefined,
                content: event.text ?? "",
                pdf_urls: event.pdf_urls ?? [],
                generated_in_ms: event.generated_in_ms,
              } : m
            ))
          } else if (event.type === "done") {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, status: undefined } : m
            ))
          } else if (event.type === "error") {
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, status: undefined, error: true } : m
            ))
          }
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, status: undefined, error: true } : m
      ))
    } finally {
      setPending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(draft)
    }
  }

  const hasMessages = messages.length > 0

  const CONTENT_W = "min(900px, 100%)"

  return (
    <>
      <Head><title>Ask Neoflo</title></Head>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: THINKING_CSS }} />

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56, borderBottom: "1px solid #e2e8f0", background: "#fff", flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Ask Neoflo</span>
          {hasMessages && (
            <button
              onClick={() => { setMessages([]); setSessionId(undefined) }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "1px solid #e2e8f0", background: "transparent", fontSize: 12, color: "#64748b", cursor: "pointer" }}
            >
              <ArrowClockwise size={12} />
              New chat
            </button>
          )}
        </div>

        {/* ── Messages ── */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "32px 24px 16px" }}>
          <div style={{ maxWidth: CONTENT_W, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

            {!hasMessages ? (
              /* Empty state */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, paddingTop: 48 }}>
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/neoflo-logo.svg" alt="Neoflo" style={{ height: 36, width: "auto", marginBottom: 4 }} />
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#0f172a" }}>Ask anything about your invoices</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Query vendors, spending, dates and more across your entire invoice history.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => void sendMessage(s)}
                      style={{ textAlign: "left", padding: "11px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#1e293b", cursor: "pointer", lineHeight: 1.4 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#a5b4fc" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message list */
              messages.map(msg =>
                msg.role === "user" ? (
                  /* User bubble */
                  <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ maxWidth: "72%", background: "#041C4C", color: "#fff", borderRadius: "18px 18px 4px 18px", padding: "10px 16px", fontSize: 14, lineHeight: 1.55 }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  /* Assistant bubble */
                  <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    {/* Avatar */}
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#041C4C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, padding: 5 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/neoflo-logo.svg" alt="Neoflo" style={{ height: 16, width: "auto", filter: "brightness(0) invert(1)" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Neoflo AI</span>

                      {/* Thinking dots */}
                      {msg.status && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "5px 12px", width: "fit-content" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span className="nf-dot" />
                            <span className="nf-dot" />
                            <span className="nf-dot" />
                          </span>
                          <span style={{ fontSize: 12, color: "#6d28d9", fontWeight: 500 }}>
                            {msg.status === "thinking" ? "Thinking" : "Forming answer"}
                          </span>
                        </span>
                      )}

                      {/* Answer text */}
                      {msg.content && <MdText text={msg.content} />}

                      {/* Error */}
                      {msg.error && !msg.content && (
                        <p style={{ margin: 0, fontSize: 13, color: "#ef4444" }}>Couldn't reach the server. Please try again.</p>
                      )}

                      {/* PDF sources */}
                      {msg.pdf_urls && msg.pdf_urls.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>Sources:</span>
                          {msg.pdf_urls.map(u => (
                            <a key={u} href={u} target="_blank" rel="noopener noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, color: "#374151", textDecoration: "none" }}>
                              <FilePdf size={12} weight="fill" color="#ef4444" />
                              {decodeURIComponent(u.split("/").pop()?.split("?")[0] ?? "source.pdf")}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Timing */}
                      {msg.generated_in_ms !== undefined && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          <CheckCircle size={11} weight="fill" color="#10b981" />
                          Generated in {(msg.generated_in_ms / 1000).toFixed(2)}s
                        </span>
                      )}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* ── Input bar ── */}
        <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "16px 24px 20px", flexShrink: 0 }}>
          <form
            onSubmit={e => { e.preventDefault(); void sendMessage(draft) }}
            style={{
              maxWidth: CONTENT_W,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1.5px solid #e2e8f0",
              borderRadius: 14,
              background: "#f8fafc",
              padding: "0 14px",
              minHeight: 48,
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#a5b4fc")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")}
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about invoices, vendors, spending…"
              rows={1}
              disabled={pending}
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#0f172a", outline: "none", resize: "none", maxHeight: 120, overflowY: "auto", fontFamily: "inherit", lineHeight: 1.5, margin: 0, padding: "12px 0" }}
            />
            <button
              type="submit"
              disabled={!draft.trim() || pending}
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: !draft.trim() || pending ? "#e2e8f0" : "#041C4C",
                border: "none",
                cursor: !draft.trim() || pending ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              <PaperPlaneTilt size={15} weight="fill" color={!draft.trim() || pending ? "#94a3b8" : "#fff"} />
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 11, color: "#b0bec5", margin: "8px 0 0" }}>
            <kbd style={{ fontFamily: "inherit", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1px 5px", fontSize: 10 }}>Enter</kbd> to send
            &nbsp;·&nbsp;
            <kbd style={{ fontFamily: "inherit", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1px 5px", fontSize: 10 }}>Shift+Enter</kbd> for new line
          </p>
        </div>

      </div>
    </>
  )
}

export default withAuthGuard(AskNeofloPage)
