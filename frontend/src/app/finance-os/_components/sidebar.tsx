"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

// ── Constants ──────────────────────────────────────────────────────────────────

const SIDEBAR_BG  = "#041C4C"
const ACTIVE_BG   = "#274B95"
const SEP         = "rgba(255,255,255,0.08)"
export const COLLAPSED_W = 64
export const EXPANDED_W  = 240

// Finance OS sub-sections
const FINANCE_OS_CHILDREN = [
  { label: "Workspace",          href: "/finance-os",                   dot: "#6366f1" },
  { label: "Invoice Processing", href: "/finance-os/invoice-processing", dot: "#0ea5e9" },
  { label: "Spend Analytics",    href: "/finance-os/spend-analytics",    dot: "#10b981" },
  { label: "Cash App",           href: "/finance-os/cash-app",           dot: "#f59e0b" },
  { label: "Collections",        href: "/finance-os/collections",        dot: "#ef4444" },
  { label: "Helpdesk",           href: "/finance-os/helpdesk",           dot: "#8b5cf6" },
  { label: "Insights",           href: "/finance-os/insights",           dot: "#ec4899" },
  { label: "Knowledge",          href: "/finance-os/knowledge",          dot: "#14b8a6" },
  { label: "Cognitive Ledger",   href: "/finance-os/cognitive-ledger",   dot: "#f97316" },
]

// Pages Router items — use <a> (hard nav) so they load the Pages Router shell
const MAIN_NAV = [
  {
    label: "Dashboard", href: "/dashboard",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
  },
  {
    label: "Reporting", href: "/insights",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polyline points="2,14 6,9 10,12 16,5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="2" cy="14" r="1.2" fill="currentColor"/><circle cx="6" cy="9" r="1.2" fill="currentColor"/><circle cx="10" cy="12" r="1.2" fill="currentColor"/><circle cx="16" cy="5" r="1.2" fill="currentColor"/></svg>,
  },
  {
    label: "AR Forecast", href: "/forecasting",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polyline points="2,13 6,8 10,10 16,4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 4h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="2" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  },
  {
    label: "Cash Application", href: "/cash-application",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="4" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4 9h.5M13.5 9h.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  },
]

const FOS_ICON = <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="10" y="2" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="10" y="8" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="12" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>

// ── Shell (sidebar + content wrapper) ─────────────────────────────────────────

export function FinanceOSShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Collapsed state — synced with localStorage so it matches the Pages Router sidebar
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    setCollapsed(localStorage.getItem("sidebar_collapsed") === "true")
  }, [])

  const toggleCollapse = (val: boolean) => {
    setCollapsed(val)
    localStorage.setItem("sidebar_collapsed", String(val))
  }

  // User info — always null on the server to avoid hydration mismatch.
  // On the client: read from localStorage cache (written by Pages Router NavSidebar)
  // first, then confirm with the API.
  const [user, setUser] = useState<{ full_name?: string; email?: string; role?: string } | null>(null)
  useEffect(() => {
    // Immediately show cached user to avoid "U / ..." flash
    try {
      const cached = localStorage.getItem("auth_user_cache")
      if (cached) setUser(JSON.parse(cached))
    } catch {}

    // Then verify / refresh from the API
    fetch("/api/v1/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setUser(d)
          localStorage.setItem("auth_user_cache", JSON.stringify({
            full_name: d.full_name ?? "",
            email: d.email ?? "",
            role: d.role ?? "",
          }))
        }
      })
      .catch(() => {})
  }, [])

  const sidebarW = mounted && collapsed ? COLLAPSED_W : EXPANDED_W

  const initials = (user?.full_name || user?.email || "U")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  const childActive = (child: { href: string }) =>
    child.href === "/finance-os"
      ? pathname === "/finance-os"
      : pathname?.startsWith(child.href) ?? false

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Sidebar ── */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: sidebarW,
          background: SIDEBAR_BG,
          transition: "width 0.2s ease",
          overflow: "hidden",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", padding: collapsed ? 0 : "0 12px 0 16px", justifyContent: collapsed ? "center" : "flex-start", gap: 8, borderBottom: `1px solid ${SEP}` }}>
          {collapsed ? (
            <button onClick={() => toggleCollapse(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#fff", padding: 6, display: "flex", alignItems: "center", borderRadius: 4 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/neoflo-logo.svg" alt="Neoflo" style={{ height: 26, width: "auto", flexShrink: 0 }} />
              <span style={{ flex: 1 }} />
              <button onClick={() => toggleCollapse(true)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#fff", padding: 4, display: "flex", alignItems: "center", borderRadius: 4, flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>

          {/* Main nav items (hard links back to Pages Router) */}
          {MAIN_NAV.map(item => (
            <a
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{ display: "flex", alignItems: "center", gap: 12, width: collapsed ? 40 : "calc(100% - 16px)", height: collapsed ? 40 : "auto", margin: collapsed ? "2px auto" : "2px 8px", padding: collapsed ? 0 : "10px 12px", justifyContent: collapsed ? "center" : "flex-start", background: "transparent", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 400, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent" }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
            </a>
          ))}

          {/* Finance OS (always active + expanded since we're inside it) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, width: collapsed ? 40 : "calc(100% - 16px)", height: collapsed ? 40 : "auto", margin: collapsed ? "2px auto" : "2px 8px", padding: collapsed ? 0 : "10px 12px", justifyContent: collapsed ? "center" : "flex-start", background: ACTIVE_BG, borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 400 }}>
              <span style={{ flexShrink: 0 }}>{FOS_ICON}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>Finance OS</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: "rotate(180deg)" }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </>
              )}
            </div>

            {!collapsed && (
              <div style={{ marginLeft: 8, marginRight: 8, marginBottom: 4 }}>
                {FINANCE_OS_CHILDREN.map(child => {
                  const active = childActive(child)
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px 7px 36px", borderRadius: 7, color: active ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: active ? 500 : 400, textDecoration: "none", background: active ? "rgba(255,255,255,0.1)" : "transparent", transition: "background 0.13s, color 0.13s" }}
                      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff" } }}
                      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)" } }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? child.dot : "rgba(255,255,255,0.25)", flexShrink: 0, transition: "background 0.13s" }} />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{child.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Settings */}
          <div style={{ margin: collapsed ? "8px auto" : "8px 8px 4px", borderTop: `1px solid ${SEP}`, width: collapsed ? 40 : "calc(100% - 16px)" }} />
          {!collapsed && <p style={{ padding: "2px 20px 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Settings</p>}
          {[{ label: "Workflow", href: "/admin/workflow-settings" }, { label: "People", href: "/settings/people" }, { label: "Roles", href: "/settings/roles" }].map(item => (
            <a key={item.href} href={item.href} title={collapsed ? item.label : undefined}
              style={{ display: "flex", alignItems: "center", gap: 12, width: collapsed ? 40 : "calc(100% - 16px)", height: collapsed ? 40 : "auto", margin: collapsed ? "2px auto" : "2px 8px", padding: collapsed ? 0 : "9px 12px", justifyContent: collapsed ? "center" : "flex-start", background: "transparent", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent" }}
            >
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ borderTop: `1px solid ${SEP}`, padding: collapsed ? "12px 0" : "12px 16px", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF0D0", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{user?.full_name || user?.email || "…"}</p>
              <p style={{ fontSize: 11, color: "#7A8FA6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{user?.role ?? ""}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ marginLeft: sidebarW, flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh", transition: "margin-left 0.2s ease" }}>
        {children}
      </div>
    </div>
  )
}
