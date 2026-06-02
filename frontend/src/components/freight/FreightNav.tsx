import Link from "next/link";
import { useRouter } from "next/router";

const TABS = [
  { label: "Reconciliations", href: "/freight" },
  { label: "Dashboard", href: "/freight/dashboard" },
  { label: "AP Queue", href: "/freight/ap-queue" },
];

export default function FreightNav() {
  const router = useRouter();

  // Active tab: exact match for /freight, startsWith for others
  function isActive(href: string) {
    if (href === "/freight") return router.pathname === "/freight";
    return router.pathname.startsWith(href);
  }

  return (
    <div
      style={{
        background: "#041C4C",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        paddingLeft: 24,
        display: "flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Brand label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingRight: 24,
          borderRight: "1px solid rgba(255,255,255,0.1)",
          marginRight: 16,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="7" width="14" height="7" rx="1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
          <path d="M3 7V5a5 5 0 0 1 10 0v2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M5 10h6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Freight Recon
        </span>
      </div>

      {/* Tabs */}
      {TABS.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 44,
              padding: "0 16px",
              fontSize: 13.5,
              fontWeight: active ? 600 : 400,
              color: active ? "#fff" : "rgba(255,255,255,0.55)",
              textDecoration: "none",
              borderBottom: active ? "2px solid #60a5fa" : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!active)
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)";
            }}
            onMouseLeave={(e) => {
              if (!active)
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)";
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
