/**
 * Workflow / STP settings API. The workflow document is consumed with
 * different projections by several pages (admin/workflow-settings, review,
 * matching), so its shape stays generic per caller.
 *
 * Also exposes people-management and invite-flow endpoints introduced by the
 * User Management PRD.
 */
import { api } from "./api";

export const settingsService = {
  /** Straight-through-processing toggle state. */
  getStp: () => api.get<{ stp_enabled: boolean }>("/api/v1/settings/stp"),

  setStp: (enabled: boolean) =>
    api.patch("/api/v1/settings/stp", { enabled }),

  /** Acknowledge threshold — number of manual acks before system auto-approves. */
  getAckThreshold: () =>
    api.get<{ ack_threshold: number }>("/api/v1/settings/ack-threshold"),

  setAckThreshold: (value: number) =>
    api.patch("/api/v1/settings/ack-threshold", { value }),

  /** Full workflow-settings document. Caller supplies its projection. */
  getWorkflow: <T>() => api.get<T>("/api/v1/settings/workflow"),

  /** Persist one or more workflow sections. */
  saveWorkflow: <T>(
    sections: Array<{ section: string; fields: unknown[] }>,
  ) => api.put<T>("/api/v1/settings/workflow", { sections }),

  // ── People management ────────────────────────────────────────────────────

  /** Return { users, pending_invites } for the current tenant. */
  getPeople: <T>() => api.get<T>("/api/v1/settings/people"),

  /** Create an invite — returns invite_token (the full JWT string). */
  sendInvite: (email: string, role: string) =>
    api.post<{ invite_id: string; email: string; role: string; expires_at: string; invite_token: string }>(
      "/api/v1/settings/invite",
      { email, role },
    ),

  /** Regenerate a pending invite — returns a fresh invite_token. */
  resendInvite: (inviteId: string) =>
    api.post<{ invite_id: string; email: string; expires_at: string; invite_token: string }>(
      `/api/v1/settings/invites/${inviteId}/resend`,
    ),

  /** Revoke a pending invite. */
  revokeInvite: (inviteId: string) =>
    api.delete<{ id: string; status: string }>(`/api/v1/settings/invites/${inviteId}`),

  /** Update user role or active status. */
  updateUser: (userId: string, patch: { role?: string; is_active?: boolean }) =>
    api.patch(`/api/v1/settings/users/${userId}`, patch),

  /** Remove a user from the tenant entirely. */
  removeUser: (userId: string) => api.delete(`/api/v1/settings/users/${userId}`),

  // ── Role permissions ─────────────────────────────────────────────────────

  /** Fetch per-role page-access defaults for this tenant. */
  getRolePermissions: () =>
    api.get<{ reviewer: string[]; member: string[] }>("/api/v1/settings/role-permissions"),

  /** Persist per-role page-access defaults (tenant_admin only). */
  setRolePermissions: (perms: { reviewer: string[]; member: string[] }) =>
    api.put<{ reviewer: string[]; member: string[] }>("/api/v1/settings/role-permissions", perms),

  // ── Invite acceptance (public — no auth) ─────────────────────────────────

  validateInvite: (token: string) =>
    api.get<{ email: string; role: string; invited_by_email: string; invite_id: string }>(
      `/api/v1/settings/invite/${token}`,
      { skipAuth: true },
    ),

  acceptInvite: (token: string, fullName: string, password: string) =>
    api.post<{ message: string }>(
      `/api/v1/settings/invite/${token}/accept`,
      { full_name: fullName, password },
      { skipAuth: true },
    ),
};
