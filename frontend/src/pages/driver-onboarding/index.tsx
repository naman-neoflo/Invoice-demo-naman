import { withAuthGuard } from "@/components/AuthGuard";

function DriverOnboardingPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: 16,
      background: "#f8fafc",
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
      }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M12 18h12M18 12v12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>Coming Soon</h2>
      <p style={{ margin: 0, fontSize: 15, color: "#64748b", textAlign: "center", maxWidth: 340 }}>
        Driver Onboarding is under development. Check back soon!
      </p>
    </div>
  );
}

export default withAuthGuard(DriverOnboardingPage);
