import { useState, useMemo, Fragment } from "react";
import { useRouter } from "next/router";
import { withAuthGuard } from "@/components/AuthGuard";

import StatusPill from "@/components/freight/StatusPill";
import Modal from "@/components/freight/Modal";
import { useFreight } from "@/contexts/FreightContext";
import { ApInvoice } from "@/data/freightData";

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

// ── Status pill map ───────────────────────────────────────────────────────────

const STATUS_PILL: Record<string, { tone: string; label: string }> = {
  "exceptions-approved": { tone: "amber", label: "Exceptions approved" },
  overdue: { tone: "red", label: "Overdue" },
  cleared: { tone: "blue", label: "Cleared" },
  paid: { tone: "green", label: "Paid" },
};

// ── Summary card ──────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "red" | "amber";
}) {
  const valueColor =
    tone === "red"
      ? "#b91c1c"
      : tone === "amber"
      ? "#b45309"
      : "#0f172a";

  return (
    <div style={{ ...cardStyle, padding: 16 }}>
      <div style={{ ...eyebrow, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: valueColor }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>{sub}</div>}
    </div>
  );
}

// ── Detail panel (inline expandable) ─────────────────────────────────────────

function DetailPanel({
  invoice,
  onCancel,
  onPay,
}: {
  invoice: ApInvoice;
  onCancel: () => void;
  onPay: () => void;
}) {
  function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
      <div>
        <div style={{ ...eyebrow, marginBottom: 4 }}>{label}</div>
        <div
          style={{
            fontSize: mono ? 12 : 13,
            fontWeight: 500,
            color: "#0f172a",
            ...(mono ? monoStyle : {}),
          }}
        >
          {value}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderTop: "1px solid #e2e8f0",
        background: "#f8fafc",
        padding: "20px 24px",
      }}
    >
      {/* Fields grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px 24px",
          marginBottom: 20,
        }}
      >
        <Field label="Invoice No." value={invoice.id} mono />
        <Field label="BOL Reference" value={invoice.bolRef} mono />
        <Field label="Carrier" value={invoice.carrier} />
        <Field label="Route" value={invoice.route} />
        <Field label="Invoice Date" value={invoice.invoiceDate || "—"} />
        <Field label="Due Date" value={invoice.dueDate} />
        <Field label="Payment Terms" value={invoice.paymentTerms || "Net 30 days"} />
        <Field label="Bank / SWIFT" value={invoice.bank || "—"} mono />
        <Field label="Account / IBAN" value={invoice.iban || "—"} mono />
      </div>

      {/* Exception note */}
      {invoice.exceptionNote && (
        <div
          style={{
            display: "flex",
            gap: 10,
            borderRadius: 10,
            padding: 14,
            background: "#fffbeb",
            border: "0.5px solid #fde68a",
            marginBottom: 20,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            <path d="M8 1L15 14H1L8 1z" stroke="#b45309" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M8 6v4" stroke="#b45309" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r=".7" fill="#b45309" />
          </svg>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "#92400e", margin: 0 }}>
            {invoice.exceptionNote}
          </p>
        </div>
      )}

      {/* Payment breakdown */}
      {invoice.breakdown && invoice.breakdown.length > 0 && (
        <div style={{ ...cardStyle, padding: 16, marginBottom: 20 }}>
          <div style={{ ...eyebrow, marginBottom: 12 }}>Payment Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {invoice.breakdown.map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#475569" }}>{b.label}</span>
                <span style={{ ...monoStyle, fontWeight: 500, color: "#0f172a" }}>{b.value}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #e2e8f0",
                paddingTop: 10,
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>Total Due</span>
              <span style={{ ...monoStyle, fontSize: 15, fontWeight: 700, color: "#15803d" }}>
                {invoice.total || invoice.amount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          onClick={onCancel}
          style={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "#fff",
            padding: "10px 16px",
            fontSize: 13,
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
          Cancel
        </button>
        <button
          onClick={onPay}
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
          Approve &amp; Pay
        </button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "exceptions" | "overdue" | "paid";

function APQueuePage() {
  const router = useRouter();
  const { apInvoices, apCounts, payInvoice } = useFreight();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [paidModal, setPaidModal] = useState<ApInvoice | null>(null);

  const counts = useMemo(
    () => ({
      all: apInvoices.filter((i) => i.status !== "paid").length,
      exceptions: apInvoices.filter((i) => i.status === "exceptions-approved").length,
      overdue: apInvoices.filter((i) => i.status === "overdue").length,
      paid: apInvoices.filter((i) => i.status === "paid").length,
    }),
    [apInvoices]
  );

  const outstanding = useMemo(() => {
    const total = apInvoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + (parseFloat(i.amount.replace(/[^0-9.]/g, "")) || 0), 0);
    return `USD ${total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [apInvoices]);

  const filtered = useMemo(() => {
    if (filter === "all") return apInvoices.filter((i) => i.status !== "paid");
    if (filter === "exceptions") return apInvoices.filter((i) => i.status === "exceptions-approved");
    if (filter === "overdue") return apInvoices.filter((i) => i.status === "overdue");
    if (filter === "paid") return apInvoices.filter((i) => i.status === "paid");
    return apInvoices;
  }, [apInvoices, filter]);

  function handlePay(invoice: ApInvoice) {
    payInvoice(invoice.id);
    setExpanded(null);
    setPaidModal(invoice);
  }

  const FILTERS: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "exceptions", label: "With Exceptions", count: counts.exceptions },
    { key: "overdue", label: "Overdue", count: counts.overdue },
    { key: "paid", label: "Paid", count: counts.paid },
  ];

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...eyebrow, marginBottom: 8 }}>Accounts Payable</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a", margin: 0 }}>
            AP Queue
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "#475569" }}>
            Reconciled carrier invoices awaiting payment approval.
          </p>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <SummaryCard
            label="Pending Payment"
            value={apCounts.pending}
            sub={`${outstanding} outstanding`}
          />
          <SummaryCard
            label="Approved with Exceptions"
            value={apCounts.exceptionsApproved}
            sub="Reviewed & cleared"
            tone="amber"
          />
          <SummaryCard
            label="Paid This Month"
            value={apCounts.paid}
            sub="USD 38,240"
          />
          <SummaryCard
            label="Overdue"
            value={apCounts.overdue}
            sub="Past due date"
            tone="red"
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  borderRadius: 999,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: active ? "#274B95" : "#fff",
                  color: active ? "#fff" : "#475569",
                  border: `0.5px solid ${active ? "#274B95" : "#e2e8f0"}`,
                  transition: "all 0.15s",
                }}
              >
                {f.label} ({f.count})
              </button>
            );
          })}
        </div>

        {/* Queue table */}
        <div style={{ ...cardStyle, overflow: "hidden", padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    { label: "Invoice No.", align: "left" },
                    { label: "BOL Ref", align: "left" },
                    { label: "Carrier", align: "left" },
                    { label: "Route", align: "left" },
                    { label: "Due Date", align: "left" },
                    { label: "Amount", align: "right" },
                    { label: "Status", align: "right" },
                    { label: "Actions", align: "right" },
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
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "40px 16px",
                        textAlign: "center",
                        fontSize: 13,
                        color: "#94a3b8",
                      }}
                    >
                      No invoices in this view.
                    </td>
                  </tr>
                )}
                {filtered.map((inv) => {
                  const isOpen = expanded === inv.id;
                  const pill = STATUS_PILL[inv.status] || { tone: "neutral", label: inv.status };
                  const reconTarget = inv.reconSetId ? `/freight/results/${inv.reconSetId}` : null;
                  return (
                    <Fragment key={inv.id}>
                      <tr
                        style={{ borderTop: "1px solid #e2e8f0", cursor: reconTarget ? "pointer" : "default", transition: "background 0.12s" }}
                        onClick={() => { if (reconTarget) router.push(reconTarget); }}
                        onMouseEnter={(e) => { if (reconTarget) (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                      >
                        <td style={{ ...monoStyle, padding: "14px 16px", fontSize: 12.5, fontWeight: 500, color: "#0f172a" }}>
                          {inv.id}
                        </td>
                        <td style={{ ...monoStyle, padding: "14px 16px", fontSize: 12, color: "#475569" }}>
                          {inv.bolRef}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#0f172a" }}>
                          {inv.carrier}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                          {inv.route}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 500, color: inv.overdue ? "#b91c1c" : "#475569" }}>
                          {inv.dueDate}
                        </td>
                        <td style={{ ...monoStyle, padding: "14px 16px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                          {inv.amount}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
                        </td>
                        <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                            {inv.status !== "paid" ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); setExpanded(isOpen ? null : inv.id); }}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 4,
                                  borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 600,
                                  color: "#fff", background: "#274B95", border: "none", cursor: "pointer",
                                }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1e3a7a")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#274B95")}
                              >
                                Review &amp; Pay
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                                  style={{ transition: "transform 0.18s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                                  <path d="M2 4l5 5 5-5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            ) : (
                              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#15803d" }}>Payment sent</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={8} style={{ padding: 0 }}>
                            <DetailPanel
                              invoice={inv}
                              onCancel={() => setExpanded(null)}
                              onPay={() => handlePay(inv)}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment confirmation modal */}
      <Modal open={!!paidModal} onClose={() => setPaidModal(null)}>
        {paidModal && (
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
              Payment approved
            </h3>
            <p style={{ fontSize: 13.5, color: "#475569", margin: "0 0 16px" }}>
              {paidModal.total || paidModal.amount} payment instruction sent to{" "}
              {(paidModal.bank || "").split(" — ")[0] || "carrier bank"} for {paidModal.carrier}.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span style={{ ...eyebrow }}>Reference</span>
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
                {paidModal.payRef || paidModal.id}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "#94a3b8", margin: "0 0 24px" }}>
              Funds will be transferred within 1–2 business days via SWIFT.
            </p>
            <button
              onClick={() => setPaidModal(null)}
              style={{
                width: "100%",
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
              Done
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default withAuthGuard(APQueuePage);
