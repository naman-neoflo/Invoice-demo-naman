/**
 * Accept Invite page — /auth/accept-invite?token=<JWT>
 *
 * Flow:
 *  1. Page loads → validates token with backend (GET /settings/invite/{token})
 *  2. Shows pre-filled email + role, asks for full name + password
 *  3. On submit → POST /settings/invite/{token}/accept
 *  4. On success → redirect to /auth/login with success message
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { settingsService, ApiError } from "@/services";

type PageState = "loading" | "valid" | "invalid" | "success";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export default function AcceptInvitePage() {
  const router = useRouter();
  const { token } = router.query;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [invite, setInvite] = useState<{
    email: string;
    role: string;
    invited_by_email: string;
    invite_id: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ full_name: "", password: "", confirm_password: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!token || typeof token !== "string") {
      setPageState("invalid");
      setErrorMsg("No invite token found in the link.");
      return;
    }

    settingsService.validateInvite(token)
      .then(data => {
        setInvite(data);
        setPageState("valid");
      })
      .catch(err => {
        setPageState("invalid");
        setErrorMsg(
          err instanceof ApiError
            ? err.message
            : "This invite link is invalid or has expired."
        );
      });
  }, [router.isReady, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.full_name.trim()) { setFormError("Please enter your full name."); return; }
    if (form.password.length < 8) { setFormError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm_password) { setFormError("Passwords don't match."); return; }

    setSubmitting(true);
    try {
      await settingsService.acceptInvite(token as string, form.full_name.trim(), form.password);
      setPageState("success");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Layout shell ──────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#F4F6F9" }}
    >
      <div
        className="w-full rounded-2xl p-8"
        style={{
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/neoflo-logo.svg" alt="Neoflo" style={{ height: 28 }} />
        </div>

        {/* ── Loading ── */}
        {pageState === "loading" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div
              className="w-8 h-8 rounded-full border-2 border-blue-200"
              style={{ borderTopColor: "#2563EB", animation: "spin 0.7s linear infinite" }}
            />
            <p className="text-sm" style={{ color: "#6B7280" }}>Validating your invite…</p>
          </div>
        )}

        {/* ── Invalid ── */}
        {pageState === "invalid" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#FEF2F2" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#DC2626" strokeWidth="1.6" />
                <path d="M7 7l8 8M15 7l-8 8" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold" style={{ color: "#101828" }}>Invalid invite link</h1>
              <p className="text-sm mt-1.5" style={{ color: "#6B7280" }}>{errorMsg}</p>
            </div>
            <button
              onClick={() => router.push("/auth/login")}
              className="mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: "#2563EB", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Go to login
            </button>
          </div>
        )}

        {/* ── Valid — show form ── */}
        {pageState === "valid" && invite && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-base font-bold" style={{ color: "#101828" }}>Set up your account</h1>
              <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                {invite.invited_by_email
                  ? <><strong>{invite.invited_by_email}</strong> invited you to join as </>
                  : "You've been invited to join as "
                }
                <span
                  className="font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: "#EFF6FF", color: "#2563EB" }}
                >
                  {ROLE_LABELS[invite.role] ?? invite.role}
                </span>
              </p>
            </div>

            {/* Pre-filled email */}
            <div className="rounded-lg px-3 py-2.5" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <p className="text-xs font-medium mb-0.5" style={{ color: "#9CA3AF" }}>Email address</p>
              <p className="text-sm font-medium" style={{ color: "#374151" }}>{invite.email}</p>
            </div>

            {/* Full name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "#374151" }}>Full name</label>
              <input
                type="text"
                placeholder="Jane Smith"
                required
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm rounded-lg"
                style={{ border: "1px solid #D1D5DB", outline: "none", color: "#101828", background: "#fff" }}
                onFocus={e => (e.target.style.borderColor = "#2563EB")}
                onBlur={e => (e.target.style.borderColor = "#D1D5DB")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "#374151" }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-lg pr-10"
                  style={{ border: "1px solid #D1D5DB", outline: "none", color: "#101828", background: "#fff" }}
                  onFocus={e => (e.target.style.borderColor = "#2563EB")}
                  onBlur={e => (e.target.style.borderColor = "#D1D5DB")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "#374151" }}>Confirm password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                required
                value={form.confirm_password}
                onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm rounded-lg"
                style={{ border: "1px solid #D1D5DB", outline: "none", color: "#101828", background: "#fff" }}
                onFocus={e => (e.target.style.borderColor = "#2563EB")}
                onBlur={e => (e.target.style.borderColor = "#D1D5DB")}
              />
            </div>

            {/* Error */}
            {formError && (
              <div className="rounded-lg px-3 py-2.5" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                <p className="text-xs" style={{ color: "#DC2626" }}>{formError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg text-sm font-semibold"
              style={{
                background: "#2563EB",
                color: "#fff",
                border: "none",
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        {/* ── Success ── */}
        {pageState === "success" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#DCFCE7" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M5 11.5l4 4 8-8" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold" style={{ color: "#101828" }}>You're all set!</h1>
              <p className="text-sm mt-1.5" style={{ color: "#6B7280" }}>
                Your account has been created. Sign in to get started.
              </p>
            </div>
            <button
              onClick={() => router.push("/auth/login")}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: "#2563EB", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Go to login
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
