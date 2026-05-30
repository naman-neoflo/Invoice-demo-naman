import { useCallback, useEffect, useState } from "react";
import { withAuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { settingsService, ApiError } from "@/services";
import { useToast } from "@/components/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  tenant_id: string | null;
  tenant_name: string | null;
  last_login_at: string | null;
  created_at: string | null;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invited_by_email: string | null;
  status: string;
  created_at: string | null;
  expires_at: string | null;
  expires_in_hours: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  tenant_admin:    "Tenant Admin",
  workspace_admin: "Workspace Admin",
  reviewer:        "Reviewer",
  member:          "Member",
};

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  tenant_admin:    { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  workspace_admin: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  reviewer:        { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  member:          { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Invite Modal ──────────────────────────────────────────────────────────────

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvited: (link: string, email: string) => void;
}

function InviteModal({ open, onClose, onInvited }: InviteModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", role: "member" });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.email) { toast("Email is required", "error"); return; }
    setLoading(true);
    try {
      const res = await settingsService.sendInvite(form.email, form.role);
      onInvited(res.invite_token, res.email);
      onClose();
      setForm({ email: "", role: "member" });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to send invite", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "#fff", width: 420, border: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#101828" }}>Invite team member</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>They'll receive a link to set up their account.</p>
          </div>
          <button onClick={onClose} style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#374151" }}>Email address</label>
            <input
              type="email"
              placeholder="jane@company.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-lg"
              style={{ border: "1px solid #D1D5DB", outline: "none", color: "#101828", background: "#fff" }}
              onFocus={e => (e.target.style.borderColor = "#2563EB")}
              onBlur={e => (e.target.style.borderColor = "#D1D5DB")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#374151" }}>Role</label>
            <select
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-lg"
              style={{ border: "1px solid #D1D5DB", outline: "none", color: "#101828", background: "#fff" }}
            >
              {user?.role === "tenant_admin" && (
                <option value="tenant_admin">Tenant Admin — full tenant access</option>
              )}
              <option value="workspace_admin">Workspace Admin — configure workspace</option>
              <option value="reviewer">Reviewer — process invoices</option>
              <option value="member">Member — process invoices</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "#2563EB", color: "#fff", border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Sending…" : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Invite Link Modal ─────────────────────────────────────────────────────────

interface InviteLinkModalProps {
  open: boolean;
  link: string;
  email: string;
  onClose: () => void;
}

function InviteLinkModal({ open, link, email, onClose }: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const fullLink = typeof window !== "undefined"
    ? `${window.location.origin}/auth/accept-invite?token=${link}`
    : `/auth/accept-invite?token=${link}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#fff", width: 480, border: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#DCFCE7" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9.5l4 4 8-8" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#101828" }}>Invite created</h2>
            <p className="text-xs" style={{ color: "#6B7280" }}>Share this link with <strong>{email}</strong></p>
          </div>
        </div>

        <div className="rounded-lg p-3" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-medium mb-1.5" style={{ color: "#6B7280" }}>Invite link (expires in 7 days)</p>
          <div className="flex items-center gap-2">
            <p className="text-xs flex-1 break-all" style={{ color: "#374151", fontFamily: "monospace" }}>
              {fullLink.length > 80 ? fullLink.slice(0, 80) + "…" : fullLink}
            </p>
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: copied ? "#DCFCE7" : "#EFF6FF", color: copied ? "#16A34A" : "#2563EB", border: `1px solid ${copied ? "#BBF7D0" : "#BFDBFE"}` }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          This link can only be used once. The recipient will be asked to set their name and password.
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmModal({ open, title, message, confirmLabel, danger, onConfirm, onClose }: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#fff", width: 380, border: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div>
          <h2 className="text-sm font-bold" style={{ color: "#101828" }}>{title}</h2>
          <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: danger ? "#DC2626" : "#2563EB", color: "#fff", border: "none" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "users" | "invites";

function PeoplePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("users");
  const [userList, setUserList] = useState<UserRecord[]>([]);
  const [inviteList, setInviteList] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<{ link: string; email: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "remove_user" | "deactivate" | "revoke_invite";
    id: string;
    label: string;
  } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await settingsService.getPeople<{ users: UserRecord[]; pending_invites: PendingInvite[] }>();
      setUserList(res.users);
      setInviteList(res.pending_invites);
    } catch {
      toast("Failed to load people", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (u: UserRecord, role: string) => {
    setUpdatingId(u.id);
    try {
      await settingsService.updateUser(u.id, { role });
      setUserList(prev => prev.map(x => x.id === u.id ? { ...x, role } : x));
      toast(`${u.full_name}'s role updated to ${ROLE_LABELS[role] ?? role}`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Update failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (u: UserRecord) => {
    if (u.id === user?.id) { toast("Cannot deactivate your own account", "error"); return; }
    if (u.is_active) {
      setConfirmAction({ type: "deactivate", id: u.id, label: u.full_name });
      return;
    }
    setUpdatingId(u.id);
    try {
      await settingsService.updateUser(u.id, { is_active: true });
      setUserList(prev => prev.map(x => x.id === u.id ? { ...x, is_active: true } : x));
      toast(`${u.full_name} reactivated`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Update failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveUser = (u: UserRecord) => {
    if (u.id === user?.id) { toast("Cannot remove your own account", "error"); return; }
    setConfirmAction({ type: "remove_user", id: u.id, label: u.full_name });
  };

  const handleRevokeInvite = (inv: PendingInvite) => {
    setConfirmAction({ type: "revoke_invite", id: inv.id, label: inv.email });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, id, label } = confirmAction;
    setConfirmAction(null);
    setUpdatingId(id);
    try {
      if (type === "remove_user") {
        await settingsService.removeUser(id);
        setUserList(prev => prev.filter(x => x.id !== id));
        toast(`${label} removed`, "success");
      } else if (type === "deactivate") {
        await settingsService.updateUser(id, { is_active: false });
        setUserList(prev => prev.map(x => x.id === id ? { ...x, is_active: false } : x));
        toast(`${label} deactivated`, "success");
      } else if (type === "revoke_invite") {
        await settingsService.revokeInvite(id);
        setInviteList(prev => prev.filter(x => x.id !== id));
        toast(`Invite for ${label} revoked`, "success");
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Action failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResend = async (inv: PendingInvite) => {
    setUpdatingId(inv.id);
    try {
      const res = await settingsService.resendInvite(inv.id);
      setInviteLink({ link: res.invite_token, email: res.email });
      toast("New invite link generated", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Resend failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F6F9" }}>
        <div className="w-8 h-8 rounded-full border-2 border-blue-200" style={{ borderTopColor: "#2563EB", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  const activeUsers = userList.filter(u => u.is_active);
  const inactiveUsers = userList.filter(u => !u.is_active);
  const canInvite = user?.role === "tenant_admin";

  return (
    <div className="min-h-screen" style={{ background: "#F4F6F9" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold" style={{ color: "#101828" }}>People</h1>
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                {userList.length} member{userList.length !== 1 ? "s" : ""}
                {inviteList.length > 0 && (
                  <span className="ml-2" style={{ color: "#D97706" }}>· {inviteList.length} pending invite{inviteList.length !== 1 ? "s" : ""}</span>
                )}
              </p>
            </div>
            {canInvite && (
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "#2563EB", color: "#fff", border: "none", cursor: "pointer" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Invite member
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-4" style={{ borderBottom: "2px solid #E5E7EB" }}>
            {([["users", "Members"], ["invites", "Pending Invites"]] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="px-4 py-2 text-sm font-medium transition-colors relative"
                style={{
                  color: tab === key ? "#2563EB" : "#6B7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: tab === key ? "2px solid #2563EB" : "2px solid transparent",
                  marginBottom: -2,
                }}
              >
                {label}
                {key === "invites" && inviteList.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "#FEF3C7", color: "#D97706" }}>
                    {inviteList.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* ── Members Tab ──────────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Name", "Role", "Status", "Last active", "Joined", "Actions"].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userList.map(u => {
                  const roleStyle = ROLE_COLORS[u.role] ?? ROLE_COLORS.viewer;
                  const isSelf = u.id === user?.id;
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid #F3F4F6",
                        opacity: !u.is_active ? 0.6 : 1,
                      }}
                    >
                      {/* Name + email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: `${roleStyle.bg}`, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}
                          >
                            {initials(u.full_name || u.email)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold" style={{ color: "#101828" }}>{u.full_name}</span>
                              {isSelf && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#EFF6FF", color: "#2563EB", fontWeight: 600 }}>You</span>}
                            </div>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isUpdating || isSelf}
                          onChange={e => handleRoleChange(u, e.target.value)}
                          className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{
                            background: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`,
                            outline: "none",
                            cursor: isSelf ? "default" : "pointer",
                          }}
                        >
                          <option value="tenant_admin">Tenant Admin</option>
                          <option value="workspace_admin">Workspace Admin</option>
                          <option value="reviewer">Reviewer</option>
                          <option value="member">Member</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={u.is_active
                            ? { background: "#DCFCE7", color: "#16A34A" }
                            : { background: "#F3F4F6", color: "#6B7280" }
                          }
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.is_active ? "#16A34A" : "#9CA3AF" }} />
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Last active */}
                      <td className="px-4 py-3 text-xs" style={{ color: "#9CA3AF" }}>
                        {formatRelative(u.last_login_at)}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs" style={{ color: "#9CA3AF" }}>
                        {formatDate(u.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isUpdating || isSelf}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{
                              background: u.is_active ? "#FEF2F2" : "#F0FDF4",
                              color: u.is_active ? "#DC2626" : "#16A34A",
                              border: `1px solid ${u.is_active ? "#FECACA" : "#BBF7D0"}`,
                              opacity: isSelf || isUpdating ? 0.4 : 1,
                              cursor: isSelf ? "default" : "pointer",
                            }}
                          >
                            {isUpdating ? "…" : u.is_active ? "Deactivate" : "Activate"}
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleRemoveUser(u)}
                              disabled={isUpdating}
                              title="Remove from team"
                              style={{ color: "#D1D5DB", background: "none", border: "none", cursor: "pointer", padding: 4 }}
                              onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                              onMouseLeave={e => (e.currentTarget.style.color = "#D1D5DB")}
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {userList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "#9CA3AF" }}>
                      No members yet — invite someone to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pending Invites Tab ───────────────────────────────────────────────── */}
        {tab === "invites" && (
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Email", "Role", "Invited by", "Sent", "Expires in", "Actions"].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inviteList.map(inv => {
                  const roleStyle = ROLE_COLORS[inv.role] ?? ROLE_COLORS.viewer;
                  const isUpdating = updatingId === inv.id;

                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      {/* Email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#F3F4F6", color: "#6B7280" }}>
                            {inv.email[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-medium" style={{ color: "#101828" }}>{inv.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
                          {ROLE_LABELS[inv.role] ?? inv.role}
                        </span>
                      </td>

                      {/* Invited by */}
                      <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>
                        {inv.invited_by_email ?? "—"}
                      </td>

                      {/* Sent */}
                      <td className="px-4 py-3 text-xs" style={{ color: "#9CA3AF" }}>
                        {formatRelative(inv.created_at)}
                      </td>

                      {/* Expires in */}
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium"
                          style={{ color: inv.expires_in_hours < 24 ? "#DC2626" : "#D97706" }}
                        >
                          {inv.expires_in_hours > 0
                            ? inv.expires_in_hours >= 24
                              ? `${Math.floor(inv.expires_in_hours / 24)}d ${inv.expires_in_hours % 24}h`
                              : `${inv.expires_in_hours}h`
                            : "Expired"
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResend(inv)}
                            disabled={isUpdating}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", cursor: "pointer", opacity: isUpdating ? 0.5 : 1 }}
                          >
                            {isUpdating ? "…" : "Resend"}
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(inv)}
                            disabled={isUpdating}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", cursor: "pointer", opacity: isUpdating ? 0.5 : 1 }}
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {inviteList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "#9CA3AF" }}>
                      No pending invites.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(link, email) => {
          setInviteOpen(false);
          setInviteLink({ link, email });
          load();
        }}
      />

      {inviteLink && (
        <InviteLinkModal
          open
          link={inviteLink.link}
          email={inviteLink.email}
          onClose={() => setInviteLink(null)}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          open
          title={
            confirmAction.type === "remove_user"
              ? "Remove member"
              : confirmAction.type === "deactivate"
              ? "Deactivate member"
              : "Revoke invite"
          }
          message={
            confirmAction.type === "remove_user"
              ? `Remove ${confirmAction.label} from the team? This cannot be undone.`
              : confirmAction.type === "deactivate"
              ? `Deactivate ${confirmAction.label}? They won't be able to sign in.`
              : `Revoke the invite for ${confirmAction.label}? The link will stop working immediately.`
          }
          confirmLabel={
            confirmAction.type === "remove_user" ? "Remove" :
            confirmAction.type === "deactivate" ? "Deactivate" :
            "Revoke"
          }
          danger
          onConfirm={handleConfirm}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

export default withAuthGuard(PeoplePage, { allowedRoles: ["tenant_admin", "workspace_admin"] });
