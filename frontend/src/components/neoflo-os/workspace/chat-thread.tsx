// components/workspace/chat-thread.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowClockwise,
  ClockCounterClockwise,
  CornersOut,
  MagnifyingGlass,
  PaperPlaneTilt,
  Sparkle,
} from "@phosphor-icons/react"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Button } from "@/components/neoflo-os/ui/button"
import { Separator } from "@/components/neoflo-os/ui/separator"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import {
  SEED_CHAT_SUGGESTIONS,
  SEED_RECENT_PROMPTS,
} from "@/lib/neoflo-os/workspace/seed-prompts"
import {
  snapshotBriefing,
  type BriefingSnapshot,
} from "@/lib/neoflo-os/workspace/briefing-snapshot"
import {
  useHydratedWorkspaceStore,
  useWorkspaceStore,
  type ChatMessage,
} from "@/lib/neoflo-os/workspace/workspace-store"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

interface ChatThreadProps {
  open: boolean
  onClose: () => void
  /** Pre-populated context for Neo: what's in the briefing right now. */
  context?: BriefingSnapshot
  /**
   * Pre-fills the chat input when the dialog opens. Used by surfaces like
   * the insights feed that hand off a contextual prompt to the chat — the
   * user can edit it before sending. Re-seeded whenever the value changes.
   */
  initialDraft?: string
}

export function ChatThread({ open, onClose, context, initialDraft }: ChatThreadProps) {
  const router = useRouter()
  const base = useBasePath()
  const messages = useHydratedWorkspaceStore((s) => s.chatMessages)
  const recentPrompts = useHydratedWorkspaceStore((s) => s.recentPrompts)

  const [draft, setDraft] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [showThinking, setShowThinking] = React.useState(false)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const lastFailedRef = React.useRef<string | null>(null)

  // Focus the input when the dialog opens, and pre-fill from initialDraft
  // if one was passed (e.g. from an insight card hand-off).
  React.useEffect(() => {
    if (!open) return
    if (initialDraft) setDraft(initialDraft)
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, initialDraft])

  // Auto-scroll the thread to the bottom when new messages stream in.
  React.useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const hasConversation = messages.length > 0

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    const store = useWorkspaceStore.getState()
    setPending(true)
    setShowThinking(false)
    lastFailedRef.current = null
    setDraft("")

    // Build the message list before mutating the store (so we send
    // the prior turns plus the new user message in correct order).
    const priorMessages = store.chatMessages
    store.appendUserMessage(trimmed)
    const neoMsgId = store.appendNeoMessageDraft()

    // Schedule the "Neo is thinking…" indicator after 2s of waiting.
    const thinkingTimer = window.setTimeout(() => setShowThinking(true), 2000)
    let firstChunkArrived = false

    const requestPayload = {
      messages: [
        ...priorMessages.map((m) => ({
          role: m.role === "neo" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user" as const, content: trimmed },
      ],
      context: context ?? snapshotBriefing(),
    }

    try {
      const res = await fetch("/api/neo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      })

      if (!res.ok || !res.body) {
        useWorkspaceStore.getState().finalizeNeoMessage(neoMsgId, { error: true })
        lastFailedRef.current = trimmed
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let errored = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const event of events) {
          if (!event.startsWith("data: ")) continue
          const raw = event.slice(6)
          let payload: { type?: string; text?: string }
          try {
            payload = JSON.parse(raw)
          } catch {
            continue
          }
          if (payload.type === "delta" && typeof payload.text === "string") {
            if (!firstChunkArrived) {
              firstChunkArrived = true
              setShowThinking(false)
            }
            useWorkspaceStore.getState().appendNeoChunk(neoMsgId, payload.text)
          } else if (payload.type === "done") {
            useWorkspaceStore.getState().finalizeNeoMessage(neoMsgId)
          } else if (payload.type === "error") {
            errored = true
            useWorkspaceStore
              .getState()
              .finalizeNeoMessage(neoMsgId, { error: true })
            lastFailedRef.current = trimmed
          }
        }
      }

      if (!errored) {
        // Safety net: finalize in case the server didn't emit `done`.
        useWorkspaceStore.getState().finalizeNeoMessage(neoMsgId)
      }
    } catch {
      useWorkspaceStore.getState().finalizeNeoMessage(neoMsgId, { error: true })
      lastFailedRef.current = trimmed
    } finally {
      window.clearTimeout(thinkingTimer)
      setShowThinking(false)
      setPending(false)
      // Re-focus so the user can continue typing immediately.
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    void sendMessage(draft)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(draft)
    }
  }

  function handleSuggestionPick(prompt: string) {
    setDraft(prompt)
    inputRef.current?.focus()
  }

  function handleBrowseAllWork() {
    onClose()
    router.push(`${base}/all-work`)
  }

  function handleRetry() {
    const last = lastFailedRef.current
    if (!last) return
    void sendMessage(last)
  }

  const recents =
    recentPrompts.length > 0
      ? recentPrompts.slice(0, 3)
      : (SEED_RECENT_PROMPTS as readonly string[])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-label="Ask Neo"
        className="bg-popover text-popover-foreground border-border flex max-h-[80vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl sm:max-w-[720px]"
        onEscapeKeyDown={onClose}
        onPointerDownOutside={onClose}
      >
        <DialogTitle className="sr-only">Ask Neo</DialogTitle>

        {hasConversation ? (
          <ConversationView
            messages={messages}
            showThinking={showThinking}
            onRetry={handleRetry}
            scrollRef={scrollRef}
          />
        ) : null}

        {!hasConversation ? (
          <EmptyStateInput
            value={draft}
            onChange={setDraft}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            disabled={pending}
          />
        ) : null}

        {!hasConversation ? (
          <EmptyStateBody
            onPickSuggestion={handleSuggestionPick}
            onBrowseAllWork={handleBrowseAllWork}
            recents={recents}
          />
        ) : (
          <ConversationInput
            value={draft}
            onChange={setDraft}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            inputRef={inputRef}
            disabled={pending}
          />
        )}

        <FooterHints />
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Empty state (no messages yet) — mirrors mockup Frame 2
// ────────────────────────────────────────────────────────────────────────────

function EmptyStateInput({
  value,
  onChange,
  onKeyDown,
  inputRef,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  disabled: boolean
}) {
  return (
    <div className="border-border flex items-start gap-3 border-b px-4 py-3.5">
      <MagnifyingGlass
        size={18}
        className="text-muted-foreground mt-1 shrink-0"
      />
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Neo anything"
        rows={1}
        disabled={disabled}
        className="text-foreground placeholder:text-muted-foreground min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-6 outline-none disabled:opacity-60"
      />
      <kbd className="border-border bg-muted text-muted-foreground/80 mt-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium">
        esc
      </kbd>
    </div>
  )
}

function EmptyStateBody({
  onPickSuggestion,
  onBrowseAllWork,
  recents,
}: {
  onPickSuggestion: (prompt: string) => void
  onBrowseAllWork: () => void
  recents: readonly string[]
}) {
  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-2">
      <PaletteSection label="Suggested by Neo">
        {SEED_CHAT_SUGGESTIONS.map((s) => (
          <PaletteRow
            key={s.label}
            icon={Sparkle}
            iconWeight="fill"
            iconText="text-primary"
            label={s.label}
            shortcut={
              <span className="text-muted-foreground text-[11px]">
                {s.intent === "draft" ? "Run draft" : "Run answer"}
              </span>
            }
            onSelect={() => onPickSuggestion(s.label)}
          />
        ))}
      </PaletteSection>

      <Separator className="my-1" />

      <PaletteSection label="Or browse">
        <PaletteRow
          icon={CornersOut}
          iconText="text-foreground/70"
          label={
            <span>
              Show me <span className="font-semibold">everything</span>
              <span className="text-muted-foreground"> → All work view</span>
            </span>
          }
          shortcut={
            <kbd className="border-border bg-muted text-muted-foreground/80 rounded border px-1.5 py-0.5 text-[10px] font-medium">
              ⏎
            </kbd>
          }
          onSelect={onBrowseAllWork}
        />
      </PaletteSection>

      <Separator className="my-1" />

      <PaletteSection label="Recent">
        {recents.length === 0 ? (
          <div className="text-muted-foreground/70 px-3 py-2 text-xs italic">
            Nothing recent yet.
          </div>
        ) : (
          recents.map((prompt) => (
            <PaletteRow
              key={prompt}
              icon={ClockCounterClockwise}
              iconText="text-foreground/50"
              label={`“${prompt}”`}
              onSelect={() => onPickSuggestion(prompt)}
            />
          ))
        )}
      </PaletteSection>
    </div>
  )
}

function PaletteSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-muted-foreground/70 px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider">
        {label}
      </div>
      {children}
    </div>
  )
}

function PaletteRow({
  icon: Icon,
  iconText,
  iconWeight = "regular",
  label,
  shortcut,
  onSelect,
}: {
  icon: React.ElementType
  iconText: string
  iconWeight?: "regular" | "fill"
  label: React.ReactNode
  shortcut?: React.ReactNode
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="hover:bg-muted/60 group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors"
    >
      <Icon size={14} weight={iconWeight} className={iconText} />
      <span className="text-foreground flex-1 text-sm">{label}</span>
      {shortcut}
    </button>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Active conversation — alternating bubbles
// ────────────────────────────────────────────────────────────────────────────

function ConversationView({
  messages,
  showThinking,
  onRetry,
  scrollRef,
}: {
  messages: ChatMessage[]
  showThinking: boolean
  onRetry: () => void
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={scrollRef}
      className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5"
    >
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          showThinking={showThinking}
          onRetry={onRetry}
        />
      ))}
    </div>
  )
}

function MessageBubble({
  message,
  showThinking,
  onRetry,
}: {
  message: ChatMessage
  showThinking: boolean
  onRetry: () => void
}) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    )
  }

  const showThinkingHere =
    message.streaming && message.content.length === 0 && showThinking
  const showInitialPlaceholder =
    message.streaming && message.content.length === 0 && !showThinking

  return (
    <div className="flex flex-col items-start gap-1.5">
      <NeoChip />
      <div
        className={cn(
          "bg-muted/60 text-foreground max-w-[85%] rounded-2xl rounded-tl-md border px-4 py-2.5 text-sm leading-relaxed",
          message.errored
            ? "border-destructive/40 bg-destructive/5"
            : "border-border/60"
        )}
      >
        {message.content.length > 0 ? (
          <MarkdownText text={message.content} />
        ) : showThinkingHere ? (
          <span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
            <ThinkingDots />
            Neo is thinking…
          </span>
        ) : showInitialPlaceholder ? (
          <span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
            <ThinkingDots />
          </span>
        ) : null}
        {message.streaming && message.content.length > 0 ? (
          <span
            className="bg-foreground/70 ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse"
            aria-hidden
          />
        ) : null}
      </div>
      {message.errored ? (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            Couldn&apos;t reach the chat backend.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-xs"
          >
            <ArrowClockwise size={12} />
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <span className="bg-muted-foreground/70 size-1.5 animate-pulse rounded-full [animation-delay:0ms]" />
      <span className="bg-muted-foreground/70 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
      <span className="bg-muted-foreground/70 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
    </span>
  )
}

function ConversationInput({
  value,
  onChange,
  onKeyDown,
  onSubmit,
  inputRef,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSubmit: (e?: React.FormEvent) => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  disabled: boolean
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="border-border flex items-end gap-2 border-t px-4 py-3"
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask a follow-up"
        rows={1}
        disabled={disabled}
        className="text-foreground placeholder:text-muted-foreground max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-6 outline-none disabled:opacity-60"
      />
      <Button
        type="submit"
        size="sm"
        disabled={disabled || value.trim().length === 0}
        className="h-8 px-3 text-xs"
      >
        <PaperPlaneTilt size={12} weight="fill" />
        Send
      </Button>
    </form>
  )
}

function FooterHints() {
  return (
    <div className="bg-muted/40 border-border text-muted-foreground/80 flex items-center justify-between border-t px-4 py-2 text-[11px]">
      <span>Type a question or pick an action — Neo answers inline.</span>
      <div className="flex items-center gap-3">
        <span>
          <kbd className="border-border bg-background rounded border px-1 py-0.5 text-[10px]">
            ↑↓
          </kbd>{" "}
          navigate
        </span>
        <span>
          <kbd className="border-border bg-background rounded border px-1 py-0.5 text-[10px]">
            ⏎
          </kbd>{" "}
          run
        </span>
        <span>
          <kbd className="border-border bg-background rounded border px-1 py-0.5 text-[10px]">
            esc
          </kbd>{" "}
          close
        </span>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Tiny inline markdown renderer
// Supports: **bold**, *italic*, `inline code`, line breaks.
// No external deps. Safely escapes HTML by rendering text nodes only.
// ────────────────────────────────────────────────────────────────────────────

type InlineToken =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "code"; text: string }

function tokenizeInline(input: string): InlineToken[] {
  const tokens: InlineToken[] = []
  // Match `code`, **bold**, or *italic* — order matters.
  const pattern = /(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", text: input.slice(lastIndex, match.index) })
    }
    if (match[2] !== undefined) {
      tokens.push({ type: "code", text: match[2] })
    } else if (match[4] !== undefined) {
      tokens.push({ type: "bold", text: match[4] })
    } else if (match[6] !== undefined) {
      tokens.push({ type: "italic", text: match[6] })
    }
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < input.length) {
    tokens.push({ type: "text", text: input.slice(lastIndex) })
  }
  return tokens
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <span className="whitespace-pre-wrap">
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {tokenizeInline(line).map((tok, j) => {
            if (tok.type === "bold")
              return (
                <strong key={j} className="font-semibold">
                  {tok.text}
                </strong>
              )
            if (tok.type === "italic")
              return (
                <em key={j} className="italic">
                  {tok.text}
                </em>
              )
            if (tok.type === "code")
              return (
                <code
                  key={j}
                  className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[12px]"
                >
                  {tok.text}
                </code>
              )
            return <React.Fragment key={j}>{tok.text}</React.Fragment>
          })}
          {i < lines.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </span>
  )
}

