import React from "react";

// ── Inline tone colors (no CSS variables) ────────────────────────────────────

const TONES: Record<
  string,
  { bg: string; line: string; ink: string; icon?: React.ReactNode }
> = {
  green: {
    bg: "#f0fdf4",
    line: "#bbf7d0",
    ink: "#15803d",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="6" stroke="#15803d" strokeWidth="1.3" />
        <path d="M3.5 6.5l2 2 3.5-3.5" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  amber: {
    bg: "#fffbeb",
    line: "#fde68a",
    ink: "#92400e",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1.5L12 11.5H1L6.5 1.5z" stroke="#b45309" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M6.5 5.5v3" stroke="#b45309" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="6.5" cy="9.5" r=".7" fill="#b45309" />
      </svg>
    ),
  },
  red: {
    bg: "#fef2f2",
    line: "#fecaca",
    ink: "#b91c1c",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="6" stroke="#b91c1c" strokeWidth="1.3" />
        <path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  pending: {
    bg: "#fffbeb",
    line: "#fde68a",
    ink: "#92400e",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="6" stroke="#92400e" strokeWidth="1.3" />
        <path d="M6.5 3.5v3l2 2" stroke="#92400e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  blue: {
    bg: "#eff6ff",
    line: "#bfdbfe",
    ink: "#1d4ed8",
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="6" stroke="#1d4ed8" strokeWidth="1.3" />
        <path d="M6.5 4v3l1.5 1.5" stroke="#1d4ed8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  neutral: {
    bg: "#f8fafc",
    line: "#e2e8f0",
    ink: "#475569",
  },
};

interface StatusPillProps {
  tone?: string;
  icon?: boolean;
  children: React.ReactNode;
}

export default function StatusPill({ tone = "neutral", icon = true, children }: StatusPillProps) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        background: t.bg,
        border: `0.5px solid ${t.line}`,
        color: t.ink,
      }}
    >
      {icon && t.icon ? t.icon : null}
      {children}
    </span>
  );
}
