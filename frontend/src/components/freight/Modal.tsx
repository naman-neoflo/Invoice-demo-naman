import { useEffect, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
  dismissable?: boolean;
}

export default function Modal({ open, onClose, children, dismissable = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(4, 28, 76, 0.45)",
        backdropFilter: "blur(2px)",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && dismissable) onClose?.();
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 448,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          padding: 24,
        }}
      >
        {dismissable && (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              right: 16,
              top: 16,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              padding: 4,
              borderRadius: 6,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#0f172a")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#94a3b8")}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
