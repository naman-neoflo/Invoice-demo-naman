import { useState } from "react";
import { useRouter } from "next/router";
import { withAuthGuard } from "@/components/AuthGuard";

import StatusPill from "@/components/freight/StatusPill";
import Modal from "@/components/freight/Modal";
import { useFreight } from "@/contexts/FreightContext";
import { DOCUMENT_SETS, DocPanel as DocPanelData, LineItem } from "@/data/freightData";

// ── Style helpers ─────────────────────────────────────────────────────────────

const eyebrow: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#94a3b8",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const monoStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontFeatureSettings: '"tnum" 1',
};

// ── Tone color maps ────────────────────────────────────────────────────────────

const TONE_TEXT: Record<string, string> = {
  red: "#b91c1c",
  amber: "#b45309",
  green: "#15803d",
  neutral: "#0f172a",
};

const MODAL_TONE: Record<string, { bg: string; ink: string }> = {
  amber: { bg: "#fffbeb", ink: "#b45309" },
  blue: { bg: "#eff6ff", ink: "#1d4ed8" },
  teal: { bg: "#f0fdfa", ink: "#0f766e" },
  green: { bg: "#f0fdf4", ink: "#15803d" },
};

const CHARGE_BG: Record<string, string> = {
  green: "#f0fdf4",
  amber: "#fffbeb",
  red: "#fef2f2",
  neutral: "#f8fafc",
};

const ROW_TONE: Record<string, string> = {
  red: "#b91c1c",
  amber: "#b45309",
  neutral: "#475569",
};

// ── Action modals ──────────────────────────────────────────────────────────────

// AI-drafted messages for each action (editable before sending)
const ACTION_CONFIG: Record<string, {
  title: string;
  to: string;
  subject: string;
  aiDraft: string;
  tone: string;
  icon: React.ReactNode;
}> = {
  dispute: {
    title: "Raise Dispute with Carrier",
    to: "carrier-ap@maerskline.com",
    subject: "Dispute — BOL MAEU-2025-04182 | Invoice MAERSK-INV-20250418",
    aiDraft: `Dear Maersk Line AP Team,

I am writing to formally dispute line items on invoice MAERSK-INV-20250418 dated April 18, 2025, referencing BOL MAEU-2025-04182.

We have identified the following discrepancies:

1. Fuel Surcharge (BAF): Invoice charges $612.00 vs. the agreed rate of $480.00 in the BOL — a $132.00 (27.5%) uplift that exceeds our contractual ±10% tolerance.

2. Destination THC ($245.00): This charge has no corresponding reference in the BOL or our agreed rate card and requires justification.

Please provide written clarification or a corrected invoice within 14 days. Payment will be withheld on the disputed amount until resolution.

Reference: BOL MAEU-2025-04182
Disputed Amount: $377.00

Best regards,
AP Team`,
    tone: "amber",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 16L9 3l5 13M6.5 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  breakdown: {
    title: "Request Breakdown",
    to: "carrier-ap@maerskline.com",
    subject: "Breakdown Request — Invoice MAERSK-INV-20250418",
    aiDraft: `Dear Maersk Line AP Team,

We are reviewing invoice MAERSK-INV-20250418 (BOL: MAEU-2025-04182) and require an itemised breakdown for the following charges before we can process payment:

1. Fuel Surcharge (BAF) — $612.00
   Our agreed rate per BOL is $480.00. Please provide the rate card or tariff schedule supporting this figure.

2. Destination THC — $245.00
   This charge does not appear in the BOL terms. Please confirm the port authority fee schedule or contractual basis for this charge.

Kindly respond within 5 business days. We are happy to process payment promptly upon receipt of satisfactory documentation.

Best regards,
AP Team`,
    tone: "blue",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="2" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6h6M5 9h6M5 12h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="13" cy="13" r="3.5" fill="#eff6ff" stroke="currentColor" strokeWidth="1.3"/><path d="M12 13h2M13 12v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  },
  escalate: {
    title: "Escalate to Manager",
    to: "ap.manager@company.com",
    subject: "Escalation Required — Invoice MAERSK-INV-20250418 | 2 Exceptions",
    aiDraft: `Hi,

I am escalating invoice MAERSK-INV-20250418 from Maersk Line for your review and sign-off before payment is released.

BOL Reference: MAEU-2025-04182
Invoice Total: $4,057.00
Disputed Amount: $377.00

Exceptions identified:
• Fuel Surcharge (BAF): $132.00 overbilled vs. agreed rate (27.5% variance, exceeds ±10% tolerance)
• Destination THC: $245.00 charge with no BOL reference — legitimacy unconfirmed

I recommend withholding payment on the $377.00 disputed amount pending carrier response. Please advise on next steps.

Supporting documents attached.

Best regards,
AP Team`,
    tone: "teal",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M1 16c0-3.314 2.686-6 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13 9l3 3-3 3M16 12H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return (
    <div style={{ ...cardStyle, padding: 16 }}>
      <div style={{ ...eyebrow, marginBottom: 8 }}>{label}</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: TONE_TEXT[tone] || "#0f172a",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>{note}</div>
    </div>
  );
}

function DocPanel({
  panel,
  title,
  isInvoice,
}: {
  panel: DocPanelData;
  title: string;
  isInvoice?: boolean;
}) {
  const tagTone = isInvoice
    ? { bg: "#fffbeb", line: "#fde68a", ink: "#b45309" }
    : { bg: "#eff6ff", line: "#bfdbfe", ink: "#1d4ed8" };

  const TitleIcon = isInvoice ? (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="2" y="1" width="11" height="14" rx="1.5" stroke={tagTone.ink} strokeWidth="1.3" />
      <path d="M5 5h6M5 8h6M5 11h3" stroke={tagTone.ink} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M4 2h7l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={tagTone.ink} strokeWidth="1.3" />
      <path d="M11 2v4h4" stroke={tagTone.ink} strokeWidth="1.3" />
    </svg>
  );

  return (
    <div style={{ ...cardStyle, overflow: "hidden", padding: 0 }}>
      {/* Panel header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid #e2e8f0",
          padding: "14px 20px",
        }}
      >
        {TitleIcon}
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{title}</span>
        <span
          style={{
            ...monoStyle,
            marginLeft: "auto",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 11,
            fontWeight: 600,
            background: tagTone.bg,
            border: `0.5px solid ${tagTone.line}`,
            color: tagTone.ink,
          }}
        >
          {panel.tag}
        </span>
      </div>

      {/* Fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px 16px",
          padding: "16px 20px",
        }}
      >
        {panel.fields.map((f) => (
          <div key={f.label}>
            <div style={{ ...eyebrow, marginBottom: 4 }}>{f.label}</div>
            <div
              style={{
                fontSize: f.mono ? 12 : 13,
                fontWeight: 500,
                color: "#0f172a",
                ...(f.mono ? monoStyle : {}),
              }}
            >
              {f.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charges */}
      <div style={{ borderTop: "1px solid #e2e8f0", padding: "12px 20px" }}>
        <div style={{ ...eyebrow, marginBottom: 8 }}>Charges</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {panel.charges.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 8,
                padding: "8px 12px",
                background: CHARGE_BG[c.tone] || "#f8fafc",
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#0f172a" }}>{c.label}</span>
              <span
                style={{
                  ...monoStyle,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: TONE_TEXT[c.tone] || "#0f172a",
                }}
              >
                {c.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReconRow({
  item,
  onApprove,
}: {
  item: LineItem;
  onApprove: (id: string) => void;
}) {
  const resolved = item.status === "approved-exception";
  const approved = item.status === "approved";
  const isGreen = resolved || approved;

  let pill: React.ReactNode;
  if (approved) pill = <StatusPill tone="green">Approved</StatusPill>;
  else if (resolved) pill = <StatusPill tone="green">Approved with exception</StatusPill>;
  else if (item.status === "disputed") pill = <StatusPill tone="red">Disputed</StatusPill>;
  else pill = <StatusPill tone="pending">Pending Review</StatusPill>;

  return (
    <tr
      style={{
        borderTop: "1px solid #e2e8f0",
        background: isGreen && item.requiresDecision ? "#f0fdf4" : undefined,
      }}
    >
      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
        {item.charge}
      </td>
      <td style={{ padding: "12px 16px", ...monoStyle, fontSize: 12.5, color: "#475569" }}>
        {item.agreed}
      </td>
      <td style={{ padding: "12px 16px", ...monoStyle, fontSize: 12.5, color: "#0f172a" }}>
        {item.invoice}
      </td>
      <td
        style={{
          padding: "12px 16px",
          ...monoStyle,
          fontSize: 12.5,
          fontWeight: 600,
          color: ROW_TONE[item.varianceTone] || "#0f172a",
        }}
      >
        {item.variance}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          {pill}
          {item.requiresDecision && !resolved && (
            <button
              onClick={() => onApprove(item.id)}
              style={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#fff",
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                color: "#0f172a",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#fff")
              }
            >
              Approve anyway
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function ResultsPage() {
  const router = useRouter();
  const { setId } = router.query as { setId: string };
  const { getLineItems, approveLineItem, exceptionsResolved, submitToAP } = useFreight();

  const [showSubmit, setShowSubmit] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  // Compose modal state
  const [draftBody, setDraftBody]   = useState("");
  const [draftTo, setDraftTo]       = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [sent, setSent]             = useState(false);
  const [generating, setGenerating] = useState(false); // loading state before draft shown

  const set = setId ? DOCUMENT_SETS[setId] : null;

  if (!set) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
        
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
          {setId ? "Reconciliation not found." : "Loading…"}
        </div>
      </div>
    );
  }

  const lineItems = getLineItems(setId);
  const resolved = exceptionsResolved(setId);
  const hasExceptions = set.hasExceptions;
  const action = actionKey ? ACTION_CONFIG[actionKey] : null;
  const header = set.resultsHeader;

  function handleSubmit() {
    submitToAP(setId);
    setShowSubmit(true);
  }

  return (
    <>
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div style={{ ...eyebrow, marginBottom: 8 }}>Reconciliation Report</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ ...monoStyle, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a", margin: 0 }}>
                {header.bolNo}
              </h1>
              {hasExceptions ? (
                <StatusPill tone="amber">{header.exceptions} Exceptions</StatusPill>
              ) : (
                <StatusPill tone="green">No exceptions</StatusPill>
              )}
            </div>
            <div style={{ marginTop: 6, fontSize: 13.5, color: "#475569" }}>
              {header.carrier} · {header.route} · {header.date}
            </div>
          </div>
          <button
            onClick={() => router.push("/freight")}
            style={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#fff")
            }
          >
            ← All reconciliations
          </button>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {set.summaryCards.map((c) => (
            <SummaryCard key={c.label} {...c} />
          ))}
        </div>

        {/* AI Insight */}
        <div
          style={{
            display: "flex",
            gap: 12,
            borderRadius: 16,
            padding: 16,
            background: "#f0fdfa",
            border: "0.5px solid #99f6e4",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#0f766e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5l1.5 3 3.3.5-2.4 2.3.6 3.3L8 9l-3 1.6.6-3.3L3.2 5l3.3-.5L8 1.5z" fill="white" />
            </svg>
          </div>
          <div>
            <div
              style={{
                marginBottom: 4,
                fontSize: 12.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#0f766e",
              }}
            >
              Neoflo AI Insight
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#0f172a", margin: 0 }}>
              {set.aiInsight}
            </p>
          </div>
        </div>

        {/* Document panels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <DocPanel panel={set.bolPanel} title="Bill of Lading" />
          <DocPanel panel={set.invoicePanel} title="Carrier Invoice" isInvoice />
        </div>

        {/* Exception banner */}
        {hasExceptions && (
          <div
            style={{
              borderRadius: 16,
              padding: 20,
              background: "#fffbeb",
              border: "0.5px solid #fde68a",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L16.5 15H1.5L9 1.5z" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 7v4" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="12.5" r="0.8" fill="#b45309" />
              </svg>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#92400e", margin: 0 }}>
                {header.exceptions} exceptions require your attention before approving payment
              </h2>
            </div>
            <ol style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {set.exceptions.map((e, i) => (
                <li key={e.title} style={{ display: "flex", gap: 12 }}>
                  <span
                    style={{
                      ...monoStyle,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#b45309",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#0f172a", margin: 0 }}>
                    <span style={{ fontWeight: 600 }}>{e.title}</span> — {e.detail}
                  </p>
                </li>
              ))}
            </ol>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                onClick={() => { const c = ACTION_CONFIG.dispute; setActionKey("dispute"); setSent(false); setGenerating(true); setDraftBody(""); setTimeout(() => { setDraftBody(c.aiDraft); setDraftTo(c.to); setDraftSubject(c.subject); setGenerating(false); }, 2200); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background: "#274B95",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = "#1e3a7a")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = "#274B95")
                }
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2 13L7.5 1 13 13M5 9h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Raise Dispute with Carrier
              </button>
              <button
                onClick={() => { const c = ACTION_CONFIG.breakdown; setActionKey("breakdown"); setSent(false); setGenerating(true); setDraftBody(""); setTimeout(() => { setDraftBody(c.aiDraft); setDraftTo(c.to); setDraftSubject(c.subject); setGenerating(false); }, 2200); }}
                style={{
                  borderRadius: 8,
                  border: "1px solid #fde68a",
                  background: "#fff",
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#92400e",
                  cursor: "pointer",
                }}
              >
                Request Breakdown
              </button>
              <button
                onClick={() => { const c = ACTION_CONFIG.escalate; setActionKey("escalate"); setSent(false); setGenerating(true); setDraftBody(""); setTimeout(() => { setDraftBody(c.aiDraft); setDraftTo(c.to); setDraftSubject(c.subject); setGenerating(false); }, 2200); }}
                style={{
                  borderRadius: 8,
                  border: "1px solid #fde68a",
                  background: "#fff",
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#92400e",
                  cursor: "pointer",
                }}
              >
                Escalate to Manager
              </button>
            </div>
          </div>
        )}

        {/* Clean-match banner */}
        {!hasExceptions && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 16,
              padding: 20,
              background: "#f0fdf4",
              border: "0.5px solid #bbf7d0",
              marginBottom: 24,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#15803d" strokeWidth="1.5" />
              <path d="M5.5 10l3 3 6-6" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#15803d", margin: 0 }}>
                Perfect match — no exceptions found
              </h2>
              <p style={{ fontSize: 13, color: "#0f172a", margin: "4px 0 0" }}>
                Every line item reconciles against the agreed BOL terms. This invoice is cleared for payment.
              </p>
            </div>
          </div>
        )}

        {/* Line-item table */}
        <div style={{ ...cardStyle, overflow: "hidden", padding: 0, marginBottom: 0 }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", padding: "14px 20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>
              Line-Item Reconciliation
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    { label: "Charge", align: "left" },
                    { label: "BOL / Agreed", align: "left" },
                    { label: "Invoice Amount", align: "left" },
                    { label: "Variance", align: "left" },
                    { label: "Status", align: "right" },
                  ].map((h) => (
                    <th
                      key={h.label}
                      style={{
                        ...eyebrow,
                        padding: "10px 16px",
                        textAlign: h.align as "left" | "right",
                      }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <ReconRow
                    key={item.id}
                    item={item}
                    onApprove={(id) => approveLineItem(setId, id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notice bar + submit */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            borderRadius: 16,
            padding: 16,
            background: resolved ? "#f0fdf4" : "#fffbeb",
            border: `0.5px solid ${resolved ? "#bbf7d0" : "#fde68a"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {resolved ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="#15803d" strokeWidth="1.5" />
                <path d="M5 9l3 3 5-5" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L16.5 15H1.5L9 1.5z" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 7v4" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="12.5" r="0.8" fill="#b45309" />
              </svg>
            )}
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: resolved ? "#15803d" : "#92400e",
              }}
            >
              {resolved
                ? "All items resolved — ready to submit"
                : `${header.exceptions} items need your decision — approve or dispute each exception before submitting`}
            </span>
          </div>
          <button
            disabled={!resolved}
            onClick={handleSubmit}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: resolved ? "pointer" : "not-allowed",
              background: resolved ? "#274B95" : "#e2e8f0",
              color: resolved ? "#fff" : "#94a3b8",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (resolved)
                (e.currentTarget as HTMLButtonElement).style.background = "#1e3a7a";
            }}
            onMouseLeave={(e) => {
              if (resolved)
                (e.currentTarget as HTMLButtonElement).style.background = "#274B95";
            }}
          >
            {resolved ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h10M9 5l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 2v12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="3" y="6" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5 6V4a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
            Submit to AP Queue
          </button>
        </div>
      </div>

      {/* Submit modal */}
      <Modal open={showSubmit} onClose={() => setShowSubmit(false)}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="14" stroke="#15803d" strokeWidth="1.8" />
              <path d="M8 15l5 5 9-9" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            Submitted to AP Queue
          </h3>
          <p style={{ fontSize: 13.5, color: "#475569", margin: "0 0 16px" }}>
            {hasExceptions
              ? "The invoice has been routed to Accounts Payable with both exceptions approved."
              : "The invoice has been routed to Accounts Payable — cleared with no exceptions."}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ ...eyebrow }}>AP Reference</span>
            <span
              style={{
                ...monoStyle,
                borderRadius: 6,
                background: "#f8fafc",
                padding: "4px 10px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {set.apReference}
            </span>
          </div>
          <button
            onClick={() => router.push("/freight/ap-queue")}
            style={{
              display: "inline-flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 10,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#274B95",
              border: "none",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            View AP Queue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 5l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </Modal>

      {/* AI compose modal */}
      {actionKey && ACTION_CONFIG[actionKey] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(4,28,76,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setActionKey(null)}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#274B95", flexShrink: 0 }}>
                {ACTION_CONFIG[actionKey].icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{ACTION_CONFIG[actionKey].title}</div>
                <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>AI-drafted — review and edit before sending</div>
              </div>
              <button onClick={() => setActionKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {generating ? (
              /* Loading state */
              <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                <div style={{ position: "relative", width: 56, height: 56 }}>
                  {/* Spinning ring */}
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ animation: "spin 1.1s linear infinite", position: "absolute", inset: 0 }}>
                    <circle cx="28" cy="28" r="24" stroke="#e2e8f0" strokeWidth="3" />
                    <path d="M28 4a24 24 0 0 1 24 24" stroke="#274B95" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  {/* Star icon center */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M11 2l2 5.5 5.5.8-4 3.8 1 5.4L11 14.5l-4.5 2.5 1-5.4L3.5 8.3l5.5-.8L11 2z" fill="#274B95" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", textAlign: "center", marginBottom: 6 }}>Generating AI Email</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", lineHeight: 1.6 }}>
                    Analysing exceptions and drafting<br />a professional message…
                  </div>
                </div>
                {/* Animated dots */}
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#274B95", animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            ) : sent ? (
              /* Sent confirmation */
              <div style={{ padding: 32, textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="10" stroke="#15803d" strokeWidth="1.8"/><path d="M8.5 13l3 3 6-6" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Message Sent</div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>Your message has been sent to {draftTo}</div>
                <button onClick={() => setActionKey(null)} style={{ borderRadius: 10, padding: "10px 24px", fontSize: 13.5, fontWeight: 600, color: "#fff", background: "#274B95", border: "none", cursor: "pointer" }}>Done</button>
              </div>
            ) : (
              /* Compose form */
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* AI badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", width: "fit-content" }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1l1.2 3.1L11 4.6l-2.3 2.2.5 3.2L6.5 8.6 4 10l.5-3.2L2.2 4.6l3.3-.5L6.5 1z" fill="#274B95"/></svg>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#274B95" }}>AI-generated draft — edit before sending</span>
                </div>

                {/* To */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>To</label>
                  <input value={draftTo} onChange={e => setDraftTo(e.target.value)}
                    style={{ width: "100%", borderRadius: 8, border: "1px solid #e2e8f0", padding: "8px 12px", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                </div>

                {/* Subject */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>Subject</label>
                  <input value={draftSubject} onChange={e => setDraftSubject(e.target.value)}
                    style={{ width: "100%", borderRadius: 8, border: "1px solid #e2e8f0", padding: "8px 12px", fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
                </div>

                {/* Body */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>Message</label>
                  <textarea value={draftBody} onChange={e => setDraftBody(e.target.value)} rows={14}
                    style={{ width: "100%", borderRadius: 8, border: "1px solid #e2e8f0", padding: "10px 12px", fontSize: 13, color: "#0f172a", lineHeight: 1.65, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingBottom: 4 }}>
                  <button onClick={() => setActionKey(null)}
                    style={{ borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", padding: "9px 16px", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={() => setSent(true)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 8, border: "none", background: "#274B95", padding: "9px 18px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1e3a7a")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#274B95")}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7l12-6-6 12-2-4-4-2z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                    Send Message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes dotBounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40%            { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
    </>
  );
}

export default withAuthGuard(ResultsPage);
