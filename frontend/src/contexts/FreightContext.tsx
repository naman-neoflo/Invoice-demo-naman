import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

// ── localStorage helpers ───────────────────────────────────────────────────────

const LS_KEY = "freight_state_v1";

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(state: object) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
import {
  DOCUMENT_SETS,
  AP_SEED_INVOICES,
  AP_SUMMARY,
  LineItem,
  ApInvoice,
} from "@/data/freightData";

// ── Types ──────────────────────────────────────────────────────────────────────

interface UploadState {
  bol?: boolean;
  invoice?: boolean;
}

export interface Reconciliation {
  setId: string;
  carrier: string;
  ref: string;
  amount: string;
  route: string;
  bolFilename: string;
  invoiceFilename: string;
  hasBol: boolean;
  hasInvoice: boolean;
  both: boolean;
  stage: string;
  stageTone: "green" | "amber" | "blue" | "red" | "teal" | string;
  action: "review" | "view" | "await-invoice" | "await-bol";
  target?: string;
}

export interface ApCounts {
  pending: number;
  paid: number;
  exceptionsApproved: number;
  overdue: number;
  navBadge: number;
}

interface FreightContextValue {
  uploads: Record<string, UploadState>;
  addDocument: (setId: string, type: "bol" | "invoice") => boolean;
  reconciliations: Reconciliation[];
  getLineItems: (setId: string) => LineItem[];
  approveLineItem: (setId: string, itemId: string) => void;
  exceptionsResolved: (setId: string) => boolean;
  apInvoices: ApInvoice[];
  apCounts: ApCounts;
  submitted: Record<string, boolean>;
  submitToAP: (setId: string) => void;
  payInvoice: (id: string) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const FreightContext = createContext<FreightContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────

export function FreightProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage (or empty defaults)
  const saved = loadState();

  const [uploads, setUploads] = useState<Record<string, UploadState>>(
    saved?.uploads ?? {}
  );
  const [lineItemsBySet, setLineItemsBySet] = useState<Record<string, LineItem[]>>(
    saved?.lineItemsBySet ?? {}
  );
  const [apInvoices, setApInvoices] = useState<ApInvoice[]>(
    saved?.apInvoices ?? AP_SEED_INVOICES.map((inv) => ({ ...inv }))
  );
  const [submitted, setSubmitted] = useState<Record<string, boolean>>(
    saved?.submitted ?? {}
  );

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveState({ uploads, lineItemsBySet, apInvoices, submitted });
  }, [uploads, lineItemsBySet, apInvoices, submitted]);

  // Records a document upload. Returns whether the set now has BOTH docs.
  const addDocument = useCallback((setId: string, type: "bol" | "invoice"): boolean => {
    let nowComplete = false;
    setUploads((prev) => {
      const cur = prev[setId] || {};
      const next = { ...cur, [type]: true };
      nowComplete = !!(next.bol && next.invoice);
      return { ...prev, [setId]: next };
    });
    return nowComplete;
  }, []);

  const getLineItems = useCallback(
    (setId: string): LineItem[] =>
      lineItemsBySet[setId] ||
      DOCUMENT_SETS[setId].lineItems.map((i) => ({ ...i })),
    [lineItemsBySet]
  );

  const approveLineItem = useCallback((setId: string, itemId: string) => {
    setLineItemsBySet((prev) => {
      const current =
        prev[setId] || DOCUMENT_SETS[setId].lineItems.map((i) => ({ ...i }));
      return {
        ...prev,
        [setId]: current.map((item) =>
          item.id === itemId
            ? { ...item, status: "approved-exception" as const, resolved: true }
            : item
        ),
      };
    });
  }, []);

  const exceptionsResolved = useCallback(
    (setId: string): boolean =>
      getLineItems(setId)
        .filter((i) => i.requiresDecision)
        .every((i) => i.status === "approved-exception"),
    [getLineItems]
  );

  const submitToAP = useCallback((setId: string) => {
    const entry = DOCUMENT_SETS[setId]?.apEntry;
    if (!entry) return;
    setSubmitted((prev) => {
      if (prev[setId]) return prev;
      setApInvoices((list) => {
        const apEntry: ApInvoice = {
          id: entry.id,
          carrier: entry.carrier,
          bolRef: entry.bolRef,
          amount: entry.amount,
          route: entry.route,
          dueDate: entry.dueDate,
          status: entry.status,
          overdue: entry.overdue,
          exceptions: entry.exceptionNote ? 1 : 0,
          exceptionNote: entry.exceptionNote,
          paymentTerms: entry.paymentTerms,
          bank: entry.bank,
          iban: entry.iban,
          payRef: entry.payRef,
          breakdown: entry.breakdown,
          total: entry.total,
          invoiceDate: entry.invoiceDate,
          reconSetId: entry.reconSetId,
        };
        return list.some((i) => i.id === apEntry.id) ? list : [apEntry, ...list];
      });
      return { ...prev, [setId]: true };
    });
  }, []);

  const payInvoice = useCallback((id: string) => {
    setApInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv))
    );
  }, []);

  // Derived reconciliation list from uploads
  const reconciliations = useMemo((): Reconciliation[] => {
    return Object.entries(uploads).map(([setId, docs]) => {
      const set = DOCUMENT_SETS[setId];
      if (!set) return null;
      const both = !!(docs.bol && docs.invoice);
      const resolved = exceptionsResolved(setId);
      let stage: string;
      let stageTone: Reconciliation["stageTone"];
      let action: Reconciliation["action"];
      let target: string | undefined;

      if (!both) {
        stage = docs.bol ? "Awaiting Invoice" : "Awaiting BOL";
        stageTone = "amber";
        action = docs.bol ? "await-invoice" : "await-bol";
      } else if (submitted[setId]) {
        stage = "AP Queue";
        stageTone = "blue";
        action = "view";
        target = `/freight/results/${setId}`;
      } else if (set.hasExceptions && !resolved) {
        stage = "Exceptions";
        stageTone = "amber";
        action = "review";
        target = `/freight/results/${setId}`;
      } else {
        stage = "Reconciled";
        stageTone = "green";
        action = "review";
        target = `/freight/results/${setId}`;
      }

      return {
        setId,
        carrier: set.carrier,
        ref: set.bolRef,
        amount: set.amount,
        route: set.route,
        bolFilename: set.bolFilename,
        invoiceFilename: set.invoiceFilename,
        hasBol: !!docs.bol,
        hasInvoice: !!docs.invoice,
        both,
        stage,
        stageTone,
        action,
        target,
      };
    }).filter(Boolean) as Reconciliation[];
  }, [uploads, submitted, exceptionsResolved]);

  // Derived AP counts
  const apCounts = useMemo((): ApCounts => {
    const pending = apInvoices.filter((i) => i.status !== "paid");
    return {
      pending: pending.length,
      paid: AP_SUMMARY.paidCount + apInvoices.filter((i) => i.status === "paid").length,
      exceptionsApproved: apInvoices.filter((i) => i.status === "exceptions-approved").length,
      overdue: apInvoices.filter((i) => i.status === "overdue").length,
      navBadge: pending.length,
    };
  }, [apInvoices]);

  const value: FreightContextValue = {
    uploads,
    addDocument,
    reconciliations,
    getLineItems,
    approveLineItem,
    exceptionsResolved,
    apInvoices,
    apCounts,
    submitted,
    submitToAP,
    payInvoice,
  };

  return (
    <FreightContext.Provider value={value}>{children}</FreightContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useFreight(): FreightContextValue {
  const ctx = useContext(FreightContext);
  if (!ctx) throw new Error("useFreight must be used within FreightProvider");
  return ctx;
}
