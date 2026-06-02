import { useState } from "react";
import { useRouter } from "next/router";
import { DOCUMENT_SETS } from "@/data/freightData";
import { useFreight } from "@/contexts/FreightContext";
import StatusPill from "./StatusPill";

// ── Style helpers ─────────────────────────────────────────────────────────────

const eyebrow: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 600, letterSpacing: "0.09em",
  textTransform: "uppercase", color: "#94a3b8",
};
const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #e2e8f0",
  borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};
const mono: React.CSSProperties = { fontFamily: "monospace", fontFeatureSettings: '"tnum" 1' };

const TONE_TEXT: Record<string, string> = {
  red: "#b91c1c", amber: "#b45309", green: "#15803d", neutral: "#0f172a",
};
const CHARGE_BG: Record<string, string> = {
  green: "#f0fdf4", amber: "#fffbeb", red: "#fef2f2", neutral: "#f8fafc",
};

// ── DocPanel ──────────────────────────────────────────────────────────────────

function DocPanel({ panel, title, isInvoice }: {
  panel: { tag: string; fields: { label: string; value: string; mono?: boolean }[]; charges: { label: string; value: string; tone: string; note: string }[] };
  title: string;
  isInvoice?: boolean;
}) {
  const tagTone = isInvoice
    ? { bg: "#fffbeb", line: "#fde68a", ink: "#b45309" }
    : { bg: "#eff6ff", line: "#bfdbfe", ink: "#1d4ed8" };

  return (
    <div style={{ ...card, overflow: "hidden", padding: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #e2e8f0", padding: "12px 16px" }}>
        {isInvoice ? (
          <svg width="16" height="16" viewBox="0 0 17 17" fill="none"><rect x="2" y="1" width="11" height="14" rx="1.5" stroke={tagTone.ink} strokeWidth="1.3" /><path d="M5 5h6M5 8h6M5 11h3" stroke={tagTone.ink} strokeWidth="1.2" strokeLinecap="round" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 17 17" fill="none"><path d="M4 2h7l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={tagTone.ink} strokeWidth="1.3" /><path d="M11 2v4h4" stroke={tagTone.ink} strokeWidth="1.3" /></svg>
        )}
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{title}</span>
        <span style={{ ...mono, marginLeft: "auto", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, background: tagTone.bg, border: `0.5px solid ${tagTone.line}`, color: tagTone.ink }}>{panel.tag}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 14px", padding: "14px 16px" }}>
        {panel.fields.map(f => (
          <div key={f.label}>
            <div style={{ ...eyebrow, marginBottom: 3 }}>{f.label}</div>
            <div style={{ fontSize: f.mono ? 11.5 : 12.5, fontWeight: 500, color: "#0f172a", ...(f.mono ? mono : {}) }}>{f.value}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #e2e8f0", padding: "10px 16px" }}>
        <div style={{ ...eyebrow, marginBottom: 8 }}>Charges</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {panel.charges.map(c => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 7, padding: "7px 10px", background: CHARGE_BG[c.tone] || "#f8fafc" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{c.label}</span>
              <span style={{ ...mono, fontSize: 12, fontWeight: 600, color: TONE_TEXT[c.tone] || "#0f172a" }}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ReconDetailModal ──────────────────────────────────────────────────────────

interface Props {
  setId: string;
  onClose: () => void;
}

export default function ReconDetailModal({ setId, onClose }: Props) {
  const router = useRouter();
  const { getLineItems, approveLineItem, exceptionsResolved, submitToAP } = useFreight();
  const [showSubmitDone, setShowSubmitDone] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const set = DOCUMENT_SETS[setId];
  if (!set) return null;

  const lineItems = getLineItems(setId);
  const resolved = exceptionsResolved(setId);
  const header = set.resultsHeader;

  function handleSubmit() {
    submitToAP(setId);
    setShowSubmitDone(true);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#f8fafc", borderRadius: 16, width: "100%", maxWidth: 1080, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", marginTop: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", borderRadius: "16px 16px 0 0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ ...eyebrow, marginBottom: 4 }}>Reconciliation Report</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ ...mono, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{header.bolNo}</span>
              {set.hasExceptions
                ? <StatusPill tone="amber">{header.exceptions} Exceptions</StatusPill>
                : <StatusPill tone="green">No exceptions</StatusPill>}
            </div>
            <div style={{ marginTop: 3, fontSize: 13, color: "#475569" }}>{header.carrier} · {header.route} · {header.date}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => { onClose(); router.push(`/freight/results/${setId}`); }}
              style={{ borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", padding: "7px 14px", fontSize: 12.5, fontWeight: 600, color: "#475569", cursor: "pointer" }}
            >
              Full page →
            </button>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {set.summaryCards.map(c => (
              <div key={c.label} style={{ ...card, padding: 14 }}>
                <div style={{ ...eyebrow, marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: TONE_TEXT[c.tone] || "#0f172a" }}>{c.value}</div>
                <div style={{ marginTop: 6, fontSize: 11.5, color: "#94a3b8" }}>{c.note}</div>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div style={{ display: "flex", gap: 12, borderRadius: 12, padding: 14, background: "#f0fdfa", border: "0.5px solid #99f6e4" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1l1.5 4h4l-3.2 2.4 1.2 4L7.5 9 4 11.4l1.2-4L2 5h4L7.5 1z" fill="white" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#0f766e", marginBottom: 4 }}>Neoflo AI Insight</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#0f172a", margin: 0 }}>{set.aiInsight}</p>
            </div>
          </div>

          {/* BOL + Invoice panels */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <DocPanel panel={set.bolPanel} title="Bill of Lading" />
            <DocPanel panel={set.invoicePanel} title="Carrier Invoice" isInvoice />
          </div>

          {/* Exception banner */}
          {set.hasExceptions && (
            <div style={{ borderRadius: 12, padding: 16, background: "#fffbeb", border: "0.5px solid #fde68a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 1L16 15H1L8.5 1z" stroke="#b45309" strokeWidth="1.3" strokeLinejoin="round" /><path d="M8.5 6v4" stroke="#b45309" strokeWidth="1.4" strokeLinecap="round" /><circle cx="8.5" cy="12" r=".7" fill="#b45309" /></svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>{header.exceptions} exceptions require attention</span>
              </div>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {set.exceptions.map((e, i) => (
                  <li key={e.title} style={{ display: "flex", gap: 10 }}>
                    <span style={{ ...mono, width: 20, height: 20, borderRadius: "50%", background: "#b45309", color: "#fff", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ fontSize: 13, lineHeight: 1.55, color: "#0f172a", margin: 0 }}><strong>{e.title}</strong> — {e.detail}</p>
                  </li>
                ))}
              </ol>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {["Raise Dispute", "Request Breakdown", "Escalate"].map(label => (
                  <button
                    key={label}
                    onClick={() => setActionDone(label)}
                    style={{ borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", background: label === "Raise Dispute" ? "#274B95" : "#fff", color: label === "Raise Dispute" ? "#fff" : "#92400e", border: label === "Raise Dispute" ? "none" : "1px solid #fde68a" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clean match */}
          {!set.hasExceptions && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, padding: 14, background: "#f0fdf4", border: "0.5px solid #bbf7d0" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#15803d" strokeWidth="1.5" /><path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>Perfect match — no exceptions found</div>
                <p style={{ fontSize: 12.5, color: "#0f172a", margin: 0 }}>Every line item reconciles against the agreed BOL terms. Cleared for payment.</p>
              </div>
            </div>
          )}

          {/* Line-item table */}
          <div style={{ ...card, overflow: "hidden", padding: 0 }}>
            <div style={{ borderBottom: "1px solid #e2e8f0", padding: "12px 16px" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Line-Item Reconciliation</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Charge", "BOL / Agreed", "Invoice Amount", "Variance", "Status"].map((h, i) => (
                      <th key={h} style={{ ...eyebrow, padding: "10px 14px", textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map(item => {
                    const resolved2 = item.status === "approved-exception";
                    const approved = item.status === "approved";
                    let pill: React.ReactNode;
                    if (approved) pill = <StatusPill tone="green">Approved</StatusPill>;
                    else if (resolved2) pill = <StatusPill tone="green">Approved w/ exception</StatusPill>;
                    else pill = <StatusPill tone="pending">Pending</StatusPill>;
                    return (
                      <tr key={item.id} style={{ borderTop: "1px solid #e2e8f0", background: (approved || resolved2) && item.requiresDecision ? "#f0fdf4" : undefined }}>
                        <td style={{ padding: "10px 14px", fontWeight: 500, color: "#0f172a" }}>{item.charge}</td>
                        <td style={{ padding: "10px 14px", ...mono, fontSize: 12, color: "#475569" }}>{item.agreed}</td>
                        <td style={{ padding: "10px 14px", ...mono, fontSize: 12, color: "#0f172a" }}>{item.invoice}</td>
                        <td style={{ padding: "10px 14px", ...mono, fontSize: 12, fontWeight: 600, color: { red: "#b91c1c", amber: "#b45309", neutral: "#475569" }[item.varianceTone] || "#0f172a" }}>{item.variance}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                            {pill}
                            {item.requiresDecision && !resolved2 && (
                              <button onClick={() => approveLineItem(setId, item.id)} style={{ borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", padding: "4px 10px", fontSize: 11.5, fontWeight: 600, color: "#0f172a", cursor: "pointer" }}>
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 12, padding: 14, background: resolved ? "#f0fdf4" : "#fffbeb", border: `0.5px solid ${resolved ? "#bbf7d0" : "#fde68a"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                {resolved
                  ? <><circle cx="8.5" cy="8.5" r="7" stroke="#15803d" strokeWidth="1.4" /><path d="M5.5 8.5l2 2 4-4" stroke="#15803d" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></>
                  : <><path d="M8.5 1L16 15H1L8.5 1z" stroke="#b45309" strokeWidth="1.3" strokeLinejoin="round" /><path d="M8.5 6v4" stroke="#b45309" strokeWidth="1.4" strokeLinecap="round" /></>}
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: resolved ? "#15803d" : "#92400e" }}>
                {resolved ? "All items resolved — ready to submit to AP" : `${header.exceptions} items need decision before submitting`}
              </span>
            </div>
            <button
              disabled={!resolved}
              onClick={handleSubmit}
              style={{ borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: resolved ? "pointer" : "not-allowed", background: resolved ? "#274B95" : "#e2e8f0", color: resolved ? "#fff" : "#94a3b8", border: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Submit to AP Queue
            </button>
          </div>

        </div>
      </div>

      {/* Submit success overlay */}
      {showSubmitDone && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { setShowSubmitDone(false); onClose(); }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 380, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke="#15803d" strokeWidth="1.8" /><path d="M9 14l3.5 3.5 6.5-6.5" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Submitted to AP Queue</h3>
            <p style={{ fontSize: 13.5, color: "#475569", margin: "0 0 16px" }}>Invoice routed to Accounts Payable.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ ...eyebrow }}>AP Reference</span>
              <span style={{ ...mono, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{set.apReference}</span>
            </div>
            <button onClick={() => { setShowSubmitDone(false); onClose(); }} style={{ width: "100%", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 600, color: "#fff", background: "#274B95", border: "none", cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {/* Action done overlay */}
      {actionDone && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActionDone(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 2l2.5 7h7l-5.7 4.1 2.2 7L13 16.5 7 20.1l2.2-7L3.5 9H10.5L13 2z" fill="#b45309" /></svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>{actionDone} submitted</h3>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 20px", lineHeight: 1.6 }}>Your request has been sent to the carrier. You will receive a response within 14 days.</p>
            <button onClick={() => setActionDone(null)} style={{ width: "100%", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, color: "#fff", background: "#274B95", border: "none", cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
