import { useEffect, useRef, useState } from "react";
import { PROCESSING_STEPS } from "@/data/freightData";

// Step 3 (index 2) is "Matching fields & identifying discrepancies"
// In mismatch mode we complete steps 0-1, stall on step 2, then show the error.
const MISMATCH_STEP = 2;
const STEP_MS = 900;

interface ProcessingOverlayProps {
  onDone: () => void;
  /** When true: simulation stops at the matching step and shows a mismatch error */
  mismatch?: boolean;
  /** Filenames to show in the mismatch error */
  bolFilename?: string;
  invoiceFilename?: string;
}

export default function ProcessingOverlay({
  onDone,
  mismatch = false,
  bolFilename,
  invoiceFilename,
}: ProcessingOverlayProps) {
  const [current, setCurrent] = useState(0);
  // In mismatch mode this flips to true after we stall on step 2 for 2 s
  const [showMismatch, setShowMismatch] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    // Normal: all steps done → call onDone
    if (!mismatch && current >= PROCESSING_STEPS.length) {
      const t = setTimeout(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        onDone();
      }, 500);
      return () => clearTimeout(t);
    }

    // Mismatch: stall on matching step, then reveal error after 2 s
    if (mismatch && current === MISMATCH_STEP) {
      const t = setTimeout(() => setShowMismatch(true), 2000);
      return () => clearTimeout(t);
    }

    // Don't advance past mismatch step in mismatch mode
    if (mismatch && current >= MISMATCH_STEP) return;

    const t = setTimeout(() => setCurrent((c) => c + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [current, mismatch, onDone]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, background: "rgba(4,28,76,0.55)", backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)", padding: 28,
          width: "100%", maxWidth: 460,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: mismatch && showMismatch ? "#b91c1c" : "#274B95", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.3s" }}>
            {mismatch && showMismatch ? (
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M9.5 4v6M9.5 13.5v.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M9.5 2l1.8 3.6L15 6.3l-2.75 2.7.65 3.8L9.5 11l-3.4 1.8.65-3.8L4 6.3l3.7-.7L9.5 2z" fill="white" />
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
              {mismatch && showMismatch ? "Reconciliation Failed" : "Running AI Reconciliation"}
            </div>
            <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2 }}>
              {mismatch && showMismatch
                ? "Document mismatch detected"
                : "Comparing BOL terms against carrier invoice…"}
            </div>
          </div>
        </div>

        {/* Steps */}
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {PROCESSING_STEPS.map((label, i) => {
            const done = mismatch ? i < MISMATCH_STEP : i < current;
            const active = mismatch ? i === MISMATCH_STEP : i === current;
            const isMismatchStep = mismatch && i === MISMATCH_STEP;
            const hasError = isMismatchStep && showMismatch;

            return (
              <li
                key={label}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12, borderRadius: 10,
                  padding: "10px 12px",
                  background: hasError ? "#fef2f2" : done ? "#f0fdf4" : active ? "#f8fafc" : "transparent",
                  opacity: !done && !active ? 0.4 : 1,
                  transition: "background 0.25s",
                }}
              >
                <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {hasError ? (
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#b91c1c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M3 3l7 7M10 3L3 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  ) : done ? (
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : active && !showMismatch ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="9" cy="9" r="7" stroke="#e2e8f0" strokeWidth="2" />
                      <path d="M9 2a7 7 0 0 1 7 7" stroke="#274B95" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e2e8f0", marginLeft: 8 }} />
                  )}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: hasError ? "#b91c1c" : done ? "#15803d" : active ? "#0f172a" : "#94a3b8" }}>
                    {label}
                  </span>

                  {/* Mismatch error detail */}
                  {hasError && (
                    <div style={{ marginTop: 10, borderRadius: 8, padding: "10px 12px", background: "#fff", border: "1px solid #fecaca" }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: "#b91c1c", margin: "0 0 6px" }}>
                        BOL / Invoice mismatch
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {bolFilename && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                            <span style={{ fontFamily: "monospace", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 5, padding: "2px 7px", color: "#1d4ed8", fontWeight: 600 }}>BOL</span>
                            <span style={{ color: "#475569", fontFamily: "monospace", fontSize: 11.5 }}>{bolFilename}</span>
                          </div>
                        )}
                        {invoiceFilename && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                            <span style={{ fontFamily: "monospace", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 5, padding: "2px 7px", color: "#b45309", fontWeight: 600 }}>INV</span>
                            <span style={{ color: "#475569", fontFamily: "monospace", fontSize: 11.5 }}>{invoiceFilename}</span>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "8px 0 0", lineHeight: 1.5 }}>
                        The invoice BOL reference does not match the uploaded Bill of Lading. Please upload the correct matching documents.
                      </p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Dismiss button — only in mismatch mode after error is shown */}
        {mismatch && showMismatch && (
          <button
            onClick={onDone}
            style={{ marginTop: 20, width: "100%", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 600, color: "#fff", background: "#274B95", border: "none", cursor: "pointer" }}
          >
            Try Again
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
