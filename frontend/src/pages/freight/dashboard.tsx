import { useState, useMemo } from "react";
import { withAuthGuard } from "@/components/AuthGuard";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import StatusPill from "@/components/freight/StatusPill";
import ReconDetailModal from "@/components/freight/ReconDetailModal";
import { DASHBOARD_STATS, ALL_SHIPMENTS, CARRIER_BREAKDOWN } from "@/data/freightData";

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

// ── Tone maps ─────────────────────────────────────────────────────────────────

const STAT_TONE: Record<string, string> = {
  green: "#15803d",
  amber: "#b45309",
  neutral: "#0f172a",
};

const SHIPMENT_PILL: Record<string, string> = {
  cleared: "green",
  exceptions: "amber",
  warning: "amber",
  error: "red",
  overdue: "red",
};

// ── Trending Up icon ──────────────────────────────────────────────────────────

function TrendingUpIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
      <polyline points="1,10 4.5,6 7.5,8 12,3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

type DateFilter = "7" | "15" | "all";

function FreightDashboard() {
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("7");

  function getSetId(linkTo?: string) {
    if (!linkTo) return null;
    const parts = linkTo.split("/");
    return parts[parts.length - 1] || null;
  }

  const filteredShipments = useMemo(() => {
    if (dateFilter === "all") return ALL_SHIPMENTS;
    if (dateFilter === "7")   return ALL_SHIPMENTS.filter(s => s.daysAgo <= 7);
    if (dateFilter === "15")  return ALL_SHIPMENTS.filter(s => s.daysAgo <= 15);
    return ALL_SHIPMENTS;
  }, [dateFilter]);

  return (
    <>
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...eyebrow, marginBottom: 8 }}>Overview</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a", margin: 0 }}>
            Freight Dashboard
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "#475569" }}>
            Reconciliation performance across all carriers and lanes.
          </p>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {DASHBOARD_STATS.map((s) => (
            <div key={s.label} style={{ ...cardStyle, padding: 16 }}>
              <div style={{ ...eyebrow, marginBottom: 8 }}>{s.label}</div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: "#0f172a",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  color: STAT_TONE[s.tone] || "#0f172a",
                }}
              >
                {s.tone === "green" && <TrendingUpIcon />}
                {s.note}
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts row ────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* 1. Shipment Volume (weekly area chart) */}
          <div style={{ ...cardStyle, padding: "18px 20px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Shipment Volume</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Weekly, last 12 weeks</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={[
                { week: "W1",  shipments: 8,  exceptions: 2 },
                { week: "W2",  shipments: 11, exceptions: 3 },
                { week: "W3",  shipments: 9,  exceptions: 1 },
                { week: "W4",  shipments: 14, exceptions: 4 },
                { week: "W5",  shipments: 12, exceptions: 2 },
                { week: "W6",  shipments: 16, exceptions: 5 },
                { week: "W7",  shipments: 13, exceptions: 3 },
                { week: "W8",  shipments: 18, exceptions: 4 },
                { week: "W9",  shipments: 15, exceptions: 2 },
                { week: "W10", shipments: 20, exceptions: 6 },
                { week: "W11", shipments: 17, exceptions: 3 },
                { week: "W12", shipments: 22, exceptions: 5 },
              ]} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#274B95" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#274B95" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="excGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="shipments" name="Shipments" stroke="#274B95" strokeWidth={2} fill="url(#shipGrad)" dot={false} />
                <Area type="monotone" dataKey="exceptions" name="Exceptions" stroke="#f59e0b" strokeWidth={2} fill="url(#excGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 2. Exceptions by Carrier (horizontal bar) */}
          <div style={{ ...cardStyle, padding: "18px 20px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Exceptions by Carrier</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Count of disputed invoices</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                layout="vertical"
                data={CARRIER_BREAKDOWN.filter(c => c.exceptions > 0).slice(0, 7).map(c => ({ name: c.carrier.split(" ")[0], exceptions: c.exceptions }))}
                margin={{ top: 0, right: 8, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} width={52} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="exceptions" name="Exceptions" radius={[0, 4, 4, 0]} fill="#274B95" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 3. Status distribution (donut) */}
          <div style={{ ...cardStyle, padding: "18px 20px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Status Distribution</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>All-time shipment outcomes</div>
            </div>
            {(() => {
              const counts: Record<string, number> = {};
              ALL_SHIPMENTS.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
              const data = [
                { name: "Cleared",    value: counts["cleared"]    || 0, color: "#15803d" },
                { name: "Exceptions", value: counts["exceptions"] || 0, color: "#f59e0b" },
                { name: "Overdue",    value: counts["overdue"]    || 0, color: "#ef4444" },
                { name: "Pending",    value: counts["pending"]    || 0, color: "#94a3b8" },
                { name: "Flagged",    value: counts["error"]      || 0, color: "#b91c1c" },
              ].filter(d => d.value > 0);
              const total = data.reduce((s, d) => s + d.value, 0);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    {data.map(d => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#475569", flex: 1 }}>{d.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{Math.round(d.value / total * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Recent Shipments */}
        <div style={{ ...cardStyle, overflow: "hidden", padding: 0, marginBottom: 24 }}>
          {/* Header + filters */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>Shipments</h2>
                <span style={{ fontSize: 12, fontWeight: 600, background: "#eff6ff", color: "#274B95", border: "1px solid #bfdbfe", borderRadius: 999, padding: "2px 9px" }}>
                  {filteredShipments.length}
                </span>
              </div>
              {/* Filter pills */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {([["7","Last 7 days"],["15","Last 15 days"],["all","All time"]] as [DateFilter,string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setDateFilter(val)}
                    style={{ borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1px solid ${dateFilter === val ? "#274B95" : "#e2e8f0"}`, background: dateFilter === val ? "#274B95" : "#fff", color: dateFilter === val ? "#fff" : "#475569", transition: "all 0.12s" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable table */}
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 480 }}>
            <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    { label: "BOL No.",  align: "left"  },
                    { label: "Date",     align: "left"  },
                    { label: "Route",    align: "left"  },
                    { label: "Carrier",  align: "left"  },
                    { label: "Amount",   align: "left"  },
                    { label: "Status",   align: "right" },
                  ].map(h => (
                    <th key={h.label} style={{ ...eyebrow, padding: "10px 18px", textAlign: h.align as "left" | "right", borderBottom: "1px solid #e2e8f0" }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "32px 18px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>No shipments in this date range.</td></tr>
                )}
                {filteredShipments.map(s => (
                  <tr key={s.bol}
                    onClick={() => { const id = getSetId(s.linkTo); if (id) setSelectedSetId(id); }}
                    style={{ borderTop: "1px solid #f1f5f9", cursor: s.linkTo ? "pointer" : "default", transition: "background 0.1s" }}
                    onMouseEnter={e => { if (s.linkTo) (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ""; }}
                  >
                    <td style={{ ...monoStyle, padding: "11px 18px", fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{s.bol}</td>
                    <td style={{ padding: "11px 18px", fontSize: 12, color: "#94a3b8" }}>{s.date}</td>
                    <td style={{ padding: "11px 18px", fontSize: 12.5, color: "#475569" }}>{s.route}</td>
                    <td style={{ padding: "11px 18px", fontSize: 12.5, color: "#0f172a" }}>{s.carrier}</td>
                    <td style={{ ...monoStyle, padding: "11px 18px", fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{s.amount}</td>
                    <td style={{ padding: "11px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <StatusPill tone={SHIPMENT_PILL[s.status] || "neutral"}>{s.statusLabel}</StatusPill>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Carrier Breakdown */}
        <div style={{ ...cardStyle, overflow: "hidden", padding: 0 }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", padding: "14px 20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>
              Discrepancy Rate by Carrier
            </h2>
          </div>
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 380 }}>
            <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    { label: "Carrier", align: "left" },
                    { label: "Shipments", align: "right" },
                    { label: "Exceptions", align: "right" },
                    { label: "Amount Disputed", align: "right" },
                    { label: "Dispute Rate", align: "right" },
                  ].map((h) => (
                    <th
                      key={h.label}
                      style={{
                        ...eyebrow,
                        padding: "10px 20px",
                        textAlign: h.align as "left" | "right",
                      }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CARRIER_BREAKDOWN.map((c) => (
                  <tr key={c.carrier} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
                      {c.carrier}
                    </td>
                    <td style={{ ...monoStyle, padding: "14px 20px", textAlign: "right", fontSize: 13, color: "#475569" }}>
                      {c.shipments}
                    </td>
                    <td style={{ ...monoStyle, padding: "14px 20px", textAlign: "right", fontSize: 13, color: "#475569" }}>
                      {c.exceptions}
                    </td>
                    <td style={{ ...monoStyle, padding: "14px 20px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                      {c.disputed}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            height: 6,
                            width: 96,
                            borderRadius: 999,
                            background: "#e2e8f0",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 999,
                              width: `${c.rate}%`,
                              background:
                                c.rate >= 28
                                  ? "#b91c1c"
                                  : c.rate >= 20
                                  ? "#b45309"
                                  : "#274B95",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            ...monoStyle,
                            width: 48,
                            textAlign: "right",
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {c.rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    {selectedSetId && (
      <ReconDetailModal
        setId={selectedSetId}
        onClose={() => setSelectedSetId(null)}
      />
    )}
    </>
  );
}

export default withAuthGuard(FreightDashboard);
