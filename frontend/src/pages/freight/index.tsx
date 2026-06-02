import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { withAuthGuard } from "@/components/AuthGuard";
import StatusPill from "@/components/freight/StatusPill";
import { useFreight } from "@/contexts/FreightContext";
import { HOME_STAGE_FILTERS, PROCESSING_STEPS, DOCUMENT_SETS, findDocByFilename } from "@/data/freightData";

// ── Style helpers ─────────────────────────────────────────────────────────────

const eyebrow: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 600, letterSpacing: "0.09em",
  textTransform: "uppercase", color: "#94a3b8",
};
const monoStyle: React.CSSProperties = { fontFamily: "monospace", fontFeatureSettings: '"tnum" 1' };

const STAGE_TONE: Record<string, { bg: string; line: string; ink: string }> = {
  teal:  { bg: "#f0fdfa", line: "#99f6e4",  ink: "#0f766e" },
  blue:  { bg: "#eff6ff", line: "#bfdbfe",  ink: "#1d4ed8" },
  green: { bg: "#f0fdf4", line: "#bbf7d0",  ink: "#15803d" },
  amber: { bg: "#fffbeb", line: "#fde68a",  ink: "#92400e" },
  red:   { bg: "#fef2f2", line: "#fecaca",  ink: "#b91c1c" },
};

function StagePill({ stage, tone }: { stage: string; tone: string }) {
  const t = STAGE_TONE[tone] || STAGE_TONE.teal;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 600, lineHeight: 1, background: t.bg, border: `0.5px solid ${t.line}`, color: t.ink }}>
      {stage}
    </span>
  );
}

function FileIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M6 3h9l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M15 3v5h5" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 12h6M8 15h4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ReceiptIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 2h14v18l-3-2-4 2-4-2-3 2V2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 8h8M7 12h8M7 16h4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="#15803d" />
      <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Upload card modal ─────────────────────────────────────────────────────────

interface UploadCardProps {
  bolUploaded: string | null;
  invoiceUploaded: string | null;
  onBol: () => void;
  onInvoice: () => void;
  onClose: () => void;
}

function UploadCard({ bolUploaded, invoiceUploaded, onBol, onInvoice, onClose }: UploadCardProps) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(4,28,76,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", width: "100%", maxWidth: 560, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Upload Documents</div>
            <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2 }}>Upload BOL first, then the matching carrier invoice</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Two upload zones side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 20 }}>
          {/* BOL zone */}
          <button
            onClick={onBol}
            disabled={!!bolUploaded}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 10, borderRadius: 12, padding: "24px 16px", cursor: bolUploaded ? "default" : "pointer",
              border: `2px dashed ${bolUploaded ? "#bbf7d0" : "#bfdbfe"}`,
              background: bolUploaded ? "#f0fdf4" : "#f8faff",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!bolUploaded) (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff"; }}
            onMouseLeave={e => { if (!bolUploaded) (e.currentTarget as HTMLButtonElement).style.background = "#f8faff"; }}
          >
            {bolUploaded ? (
              <>
                <CheckCircle />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#15803d" }}>BOL Uploaded</div>
                  <div style={{ ...monoStyle, fontSize: 11, color: "#475569", marginTop: 3, wordBreak: "break-all" }}>{bolUploaded}</div>
                </div>
              </>
            ) : (
              <>
                <span style={{ width: 44, height: 44, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileIcon color="#1d4ed8" />
                </span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1d4ed8" }}>Bill of Lading</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>Click to upload BOL PDF</div>
                </div>
              </>
            )}
          </button>

          {/* Invoice zone */}
          <button
            onClick={onInvoice}
            disabled={!bolUploaded || !!invoiceUploaded}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 10, borderRadius: 12, padding: "24px 16px",
              cursor: !bolUploaded ? "not-allowed" : invoiceUploaded ? "default" : "pointer",
              border: `2px dashed ${invoiceUploaded ? "#bbf7d0" : !bolUploaded ? "#e2e8f0" : "#fde68a"}`,
              background: invoiceUploaded ? "#f0fdf4" : !bolUploaded ? "#f8fafc" : "#fffdf0",
              opacity: !bolUploaded ? 0.5 : 1,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (bolUploaded && !invoiceUploaded) (e.currentTarget as HTMLButtonElement).style.background = "#fffbeb"; }}
            onMouseLeave={e => { if (bolUploaded && !invoiceUploaded) (e.currentTarget as HTMLButtonElement).style.background = "#fffdf0"; }}
          >
            {invoiceUploaded ? (
              <>
                <CheckCircle />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#15803d" }}>Invoice Uploaded</div>
                  <div style={{ ...monoStyle, fontSize: 11, color: "#475569", marginTop: 3, wordBreak: "break-all" }}>{invoiceUploaded}</div>
                </div>
              </>
            ) : (
              <>
                <span style={{ width: 44, height: 44, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ReceiptIcon color="#b45309" />
                </span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#b45309" }}>Carrier Invoice</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                    {bolUploaded ? "Click to upload invoice PDF" : "Upload BOL first"}
                  </div>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Status bar */}
        <div style={{ padding: "12px 20px 18px", textAlign: "center" }}>
          {!bolUploaded && (
            <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Start by uploading the Bill of Lading</div>
          )}
          {bolUploaded && !invoiceUploaded && (
            <div style={{ fontSize: 12.5, color: "#1d4ed8", fontWeight: 500 }}>
              ✓ BOL uploaded — now upload the matching carrier invoice to begin reconciliation
            </div>
          )}
          {bolUploaded && invoiceUploaded && (
            <div style={{ fontSize: 12.5, color: "#15803d", fontWeight: 600 }}>
              ✓ Both documents uploaded — starting reconciliation…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inline processing row ─────────────────────────────────────────────────────

interface ProcessingEntry {
  id: string;
  bolFilename: string;
  invoiceFilename: string;
  bolSetId: string;
  invoiceSetId: string;
  stepIndex: number;
  mismatch: boolean;
  mismatchShown: boolean;
  done: boolean;            // all steps complete — shows Review button
  startedAt: number;        // epoch ms for timer display
}


// ── Processing row component (needs its own component to use the timer hook) ──

function ProcessingRow({ entry: p, onDismiss, onTryAgain, onReview }: {
  entry: ProcessingEntry;
  onDismiss: () => void;
  onTryAgain: () => void;
  onReview: () => void;
}) {
  const isStalling = p.mismatch && p.stepIndex >= 2 && !p.mismatchShown;
  const isMismatch = p.mismatch && p.mismatchShown;
  const stepLabel  = p.stepIndex < PROCESSING_STEPS.length ? PROCESSING_STEPS[p.stepIndex] : PROCESSING_STEPS[PROCESSING_STEPS.length - 1];

  return (
    <tr style={{ borderTop: "1px solid #e2e8f0", background: isMismatch ? "#fef2f2" : p.done ? "#f0fdf4" : "#f8faff" }}>
      {/* BOL */}
      <td style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M4 2h5l3 3v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#1d4ed8" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 2v3h3" stroke="#1d4ed8" strokeWidth="1.3" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#0f172a" }}>{p.bolFilename}</span>
        </div>
      </td>
      {/* Invoice */}
      <td style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><rect x="2" y="1" width="11" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.3"/><path d="M4 5h7M4 8h7M4 11h4" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#0f172a" }}>{p.invoiceFilename}</span>
        </div>
      </td>
      {/* Carrier, Ref, Amount — filled from DOCUMENT_SETS when done */}
      <td style={{ padding: "14px 18px", fontSize: 13, color: "#0f172a" }}>
        {p.done ? (DOCUMENT_SETS[p.bolSetId]?.carrier ?? "—") : "—"}
      </td>
      <td style={{ padding: "14px 18px", fontFamily: "monospace", fontSize: 12, color: "#475569" }}>
        {p.done ? (DOCUMENT_SETS[p.bolSetId]?.bolRef ?? "—") : "—"}
      </td>
      <td style={{ padding: "14px 18px", fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
        {p.done ? (DOCUMENT_SETS[p.bolSetId]?.amount ?? "—") : "—"}
      </td>

      {/* Current Stage */}
      <td style={{ padding: "14px 18px" }}>
        {p.done ? (
          <StagePill stage={DOCUMENT_SETS[p.bolSetId]?.hasExceptions ? "Exceptions" : "Reconciled"} tone={DOCUMENT_SETS[p.bolSetId]?.hasExceptions ? "amber" : "teal"} />
        ) : isMismatch ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill="#b91c1c"/><path d="M4 4l5 5M9 4L4 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>Document Mismatch</span>
            </div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.5 }}>
              BOL and invoice do not belong to the same shipment.
              <button onClick={onDismiss} style={{ display: "block", marginTop: 4, fontSize: 11.5, color: "#274B95", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
              <circle cx="7.5" cy="7.5" r="6" stroke="#e2e8f0" strokeWidth="2"/>
              <path d="M7.5 1.5a6 6 0 0 1 6 6" stroke="#274B95" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#274B95" }}>{isStalling ? "Matching fields & identifying discrepancies" : stepLabel}</span>
          </div>
        )}
      </td>

      {/* Action */}
      <td style={{ padding: "14px 18px", textAlign: "right" }}>
        {p.done ? (
          <button onClick={onReview}
            style={{ borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#274B95", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1e3a7a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#274B95")}
          >
            Review
          </button>
        ) : isMismatch ? (
          <button onClick={onTryAgain}
            style={{ borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#274B95", border: "none", cursor: "pointer" }}>
            Try Again
          </button>
        ) : null}
      </td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

// ── Persisted completed rows (survive refresh) ────────────────────────────────

const COMPLETED_KEY = "freight_completed_rows_v2"; // bumped: added reportGenerated per row

export interface CompletedRow {
  id: string;
  bolFilename: string;
  invoiceFilename: string;
  setId: string;
  reportGenerated?: boolean;
}

function loadCompleted(): CompletedRow[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"); } catch { return []; }
}

function saveCompleted(rows: CompletedRow[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(COMPLETED_KEY, JSON.stringify(rows)); } catch {}
}

// ── Page ───────────────────────────────────────────────────────────────────────

function FreightHomePage() {
  const router = useRouter();
  const { addDocument } = useFreight(); // reconciliations live in completedRows (persisted)
  const [query, setQuery]           = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [showUploadCard, setShowUploadCard] = useState(false);

  const [uploadedBol, setUploadedBol]         = useState<{ setId: string; filename: string } | null>(null);
  const [uploadedInvoice, setUploadedInvoice] = useState<{ setId: string; filename: string } | null>(null);

  // Inline processing rows (in-memory, for the current session animation)
  const [processing, setProcessing] = useState<ProcessingEntry[]>([]);

  // Persisted completed rows (survive refresh)
  const [completedRows, setCompletedRows] = useState<CompletedRow[]>(() => loadCompleted());

  const bolInputRef     = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);


  // Advance processing steps
  useEffect(() => {
    const active = processing.filter(p => !p.done && !p.mismatchShown);
    if (active.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    active.forEach(p => {
      if (p.mismatch && p.stepIndex >= 2) {
        const t = setTimeout(() => {
          setProcessing(prev => prev.map(x => x.id === p.id ? { ...x, mismatchShown: true } : x));
        }, 2000);
        timers.push(t);
        return;
      }
      if (p.stepIndex >= PROCESSING_STEPS.length) {
        const t = setTimeout(() => {
          addDocument(p.bolSetId, "bol");
          addDocument(p.bolSetId, "invoice");
          // Move from processing → completedRows (persists to localStorage)
          const newRow: CompletedRow = {
            id: p.id,
            bolFilename: p.bolFilename,
            invoiceFilename: p.invoiceFilename,
            setId: p.bolSetId,
          };
          setCompletedRows(prev => {
            const next = [...prev, newRow];
            saveCompleted(next);
            return next;
          });
          setProcessing(prev => prev.filter(x => x.id !== p.id));
        }, 600);
        timers.push(t);
        return;
      }
      const t = setTimeout(() => {
        setProcessing(prev => prev.map(x => x.id === p.id ? { ...x, stepIndex: x.stepIndex + 1 } : x));
      }, 2800);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [processing, addDocument]);

  function handleBol(file: File) {
    const match = findDocByFilename(file.name);
    if (!match) { setError(`"${file.name}" is unrecognised.`); return; }
    if (match.type !== "bol") { setError(`"${file.name}" looks like an invoice — use the Invoice slot.`); return; }
    setError(null);
    setUploadedBol({ setId: match.setId, filename: file.name });
    setUploadedInvoice(null);
    // Do NOT call addDocument here — wait until processing finishes
  }

  function handleInvoice(file: File) {
    if (!uploadedBol) { setError("Please upload a BOL first."); return; }
    const match = findDocByFilename(file.name);
    if (!match) { setError(`"${file.name}" is unrecognised.`); return; }
    if (match.type !== "invoice") { setError(`"${file.name}" looks like a BOL — use the BOL slot.`); return; }
    setError(null);
    setUploadedInvoice({ setId: match.setId, filename: file.name });

    const isMismatch = match.setId !== uploadedBol.setId;
    const entryId    = `proc-${Date.now()}`;

    setShowUploadCard(false);

    setProcessing(prev => [...prev, {
      id: entryId,
      bolFilename: uploadedBol.filename,
      invoiceFilename: file.name,
      bolSetId: uploadedBol.setId,
      invoiceSetId: match.setId,
      stepIndex: 0,
      mismatch: isMismatch,
      mismatchShown: false,
      done: false,
      startedAt: Date.now(),
    }]);

    // Reset upload state for next session
    setUploadedBol(null);
    setUploadedInvoice(null);
  }

  const filteredCompleted = useMemo(() => {
    const q = query.trim().toLowerCase();
    // newest first
    const sorted = [...completedRows].reverse();
    if (!q) return sorted;
    return sorted.filter(r => {
      const set = DOCUMENT_SETS[r.setId];
      return [r.bolFilename, r.invoiceFilename, set?.carrier ?? "", set?.bolRef ?? ""].some(v => v.toLowerCase().includes(q));
    });
  }, [completedRows, query]);

  const isEmpty = completedRows.length === 0 && processing.length === 0;

  return (
    <>
    {/* Hidden file inputs */}
    <input ref={bolInputRef} type="file" accept=".pdf" style={{ display: "none" }}
      onChange={e => { if (e.target.files?.[0]) handleBol(e.target.files[0]); e.target.value = ""; }} />
    <input ref={invoiceInputRef} type="file" accept=".pdf" style={{ display: "none" }}
      onChange={e => { if (e.target.files?.[0]) handleInvoice(e.target.files[0]); e.target.value = ""; }} />

    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a", margin: 0 }}>Reconciliation Dashboard</h1>
            <p style={{ marginTop: 6, fontSize: 14, color: "#475569" }}>Upload BOL and carrier invoice to start a reconciliation</p>
          </div>
          <button
            onClick={() => setShowUploadCard(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 10, border: "none", background: "#274B95", padding: "10px 18px", fontSize: 13.5, fontWeight: 600, color: "#fff", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1e3a7a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#274B95")}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1v9M3.5 5L7.5 1l4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 11v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Upload Documents
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 10, padding: "10px 14px", background: "#fef2f2", border: "0.5px solid #fecaca", marginBottom: 14 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.5" stroke="#b91c1c" strokeWidth="1.3"/><path d="M7.5 4.5v4" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7.5" cy="10.5" r=".7" fill="#b91c1c"/></svg>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#b91c1c" }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c", fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="7.5" cy="7.5" r="5.5" stroke="#94a3b8" strokeWidth="1.4" />
              <path d="M11.5 11.5l3 3" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by carrier, BOL ref, or amount…"
              style={{ width: "100%", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", padding: "10px 14px 10px 38px", fontSize: 13.5, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 10, border: `1px solid ${showFilters ? "#274B95" : "#e2e8f0"}`, background: showFilters ? "#eff6ff" : "#fff", padding: "10px 14px", fontSize: 13.5, fontWeight: 600, color: "#0f172a", cursor: "pointer" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="5" cy="4" r="1.8" fill="#fff" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="8" r="1.8" fill="#fff" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="12" r="1.8" fill="#fff" stroke="currentColor" strokeWidth="1.3"/></svg>
            Filters
          </button>
        </div>

        {/* Stage filters */}
        {showFilters && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ ...eyebrow, marginRight: 4 }}>Stage</span>
            {HOME_STAGE_FILTERS.map(s => {
              const active = stageFilter === s;
              return (
                <button key={s} onClick={() => setStageFilter(active ? null : s)}
                  style={{ borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", background: active ? "#274B95" : "#fff", color: active ? "#fff" : "#475569", border: `0.5px solid ${active ? "#274B95" : "#e2e8f0"}`, transition: "all 0.12s" }}>
                  {s}
                </button>
              );
            })}
            {stageFilter && <button onClick={() => setStageFilter(null)} style={{ fontSize: 12.5, color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>× Clear</button>}
          </div>
        )}

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Bill of Lading", "Carrier Invoice", "Carrier", "BOL / Invoice #", "Amount", "Current Stage", "Action"].map((h, i) => (
                    <th key={h} style={{ ...eyebrow, padding: "11px 18px", textAlign: i === 6 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {/* Inline processing rows — stay visible when done, show Review button */}
                {processing.map(p => (
                  <ProcessingRow
                    key={p.id}
                    entry={p}
                    onDismiss={() => setProcessing(prev => prev.filter(x => x.id !== p.id))}
                    onTryAgain={() => { setProcessing(prev => prev.filter(x => x.id !== p.id)); setShowUploadCard(true); }}
                    onReview={() => router.push(`/freight/results/${p.bolSetId}?rowId=${p.id}`)}
                  />
                ))}

                {/* Empty state */}
                {isEmpty && (
                  <tr>
                    <td colSpan={7} style={{ padding: "64px 20px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                            <path d="M3 16h5l2 3h6l2-3h5M3 16V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11" stroke="#94a3b8" strokeWidth="1.4" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>No reconciliations yet</div>
                        <p style={{ fontSize: 13, color: "#475569", maxWidth: 360, margin: 0 }}>
                          Click <strong>Upload Documents</strong> to upload a Bill of Lading and carrier invoice to start your first reconciliation.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* No results */}
                {!isEmpty && filteredCompleted.length === 0 && processing.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: "32px 18px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>No reconciliations match your search.</td></tr>
                )}

                {/* Completed / persisted rows */}
                {filteredCompleted.map(r => {
                  const set = DOCUMENT_SETS[r.setId];
                  const target = `/freight/results/${r.setId}?rowId=${r.id}`;
                  const stage = r.reportGenerated ? "Report Generated" : set?.hasExceptions ? "Exceptions" : "Reconciled";
                  const stageTone = r.reportGenerated ? "blue" : set?.hasExceptions ? "amber" : "green";
                  return (
                    <tr
                      key={r.id}
                      style={{ borderTop: "1px solid #e2e8f0", cursor: "pointer", transition: "background 0.12s" }}
                      onClick={() => router.push(target)}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#eff6ff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ""; }}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M4 2h5l3 3v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#1d4ed8" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 2v3h3" stroke="#1d4ed8" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#0f172a" }}>{r.bolFilename}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><rect x="2" y="1" width="11" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.3"/><path d="M4 5h7M4 8h7M4 11h4" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#0f172a" }}>{r.invoiceFilename}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 13, color: "#0f172a" }}>{set?.carrier ?? "—"}</td>
                      <td style={{ padding: "14px 18px", ...monoStyle, fontSize: 12, color: "#475569" }}>{set?.bolRef ?? "—"}</td>
                      <td style={{ padding: "14px 18px", ...monoStyle, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{set?.amount ?? "—"}</td>
                      <td style={{ padding: "14px 18px" }}><StagePill stage={stage} tone={stageTone} /></td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <button
                          onClick={e => { e.stopPropagation(); router.push(target); }}
                          style={{ borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#274B95", border: "none", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#1e3a7a")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#274B95")}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    {/* Upload card modal */}
    {showUploadCard && (
      <UploadCard
        bolUploaded={uploadedBol?.filename ?? null}
        invoiceUploaded={uploadedInvoice?.filename ?? null}
        onBol={() => bolInputRef.current?.click()}
        onInvoice={() => invoiceInputRef.current?.click()}
        onClose={() => { setShowUploadCard(false); setUploadedBol(null); setUploadedInvoice(null); setError(null); }}
      />
    )}

    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
    `}</style>
    </>
  );
}

export default withAuthGuard(FreightHomePage);
