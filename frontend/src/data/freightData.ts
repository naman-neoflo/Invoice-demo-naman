// ─────────────────────────────────────────────────────────────────────────────
// Freight Reconciliation demo — all hardcoded simulation data (TypeScript port)
// ─────────────────────────────────────────────────────────────────────────────

export const PROCESSING_STEPS: string[] = [
  "Extracting fields from BOL",
  "Reading carrier invoice line items",
  "Matching fields & identifying discrepancies",
  "Generating reconciliation report",
];

export interface PreviewField {
  label: string;
  value: string;
  mono?: boolean;
}

export interface PanelField {
  label: string;
  value: string;
  mono?: boolean;
}

export interface PanelCharge {
  label: string;
  value: string;
  tone: "green" | "amber" | "red" | "neutral";
  note: string;
}

export interface DocPanel {
  tag: string;
  fields: PanelField[];
  charges: PanelCharge[];
}

export interface SummaryCard {
  label: string;
  value: string;
  note: string;
  tone: "neutral" | "red" | "amber" | "green";
}

export interface ExceptionItem {
  title: string;
  detail: string;
}

export interface LineItem {
  id: string;
  charge: string;
  agreed: string;
  invoice: string;
  variance: string;
  varianceTone: "red" | "amber" | "neutral";
  status: "approved" | "approved-exception" | "disputed" | "pending";
  requiresDecision: boolean;
  resolved?: boolean;
}

export interface ApEntry {
  id: string;
  reconSetId: string;
  bolRef: string;
  carrier: string;
  route: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  status: string;
  overdue: boolean;
  paymentTerms: string;
  bank: string;
  iban: string;
  payRef: string;
  exceptionNote: string | null;
  breakdown: { label: string; value: string }[];
  total: string;
}

export interface DocumentSet {
  id: string;
  carrier: string;
  bolFilename: string;
  invoiceFilename: string;
  bolRef: string;
  invoiceNo: string;
  route: string;
  amount: string;
  hasExceptions: boolean;
  apReference: string;
  bolPreview: PreviewField[];
  invoicePreview: PreviewField[];
  resultsHeader: {
    bolNo: string;
    carrier: string;
    route: string;
    date: string;
    exceptions: number;
  };
  summaryCards: SummaryCard[];
  aiInsight: string;
  bolPanel: DocPanel;
  invoicePanel: DocPanel;
  exceptions: ExceptionItem[];
  lineItems: LineItem[];
  stageTone: "green" | "amber" | "red" | "blue" | "teal";
  stage: string;
  apEntry?: ApEntry;
  detailPanel?: {
    invoiceNo: string; invoiceDate: string; dueDate: string; carrier: string;
    route: string; bolRef: string; amount: string; currency: string;
    paymentBreakdown: { label: string; value: string }[];
    total: string;
  };
}

export const DOCUMENT_SETS: Record<string, DocumentSet> = {
  maersk: {
    id: "maersk",
    carrier: "Maersk Line",
    bolFilename: "BOL-MAEU-2025-04182.pdf",
    invoiceFilename: "MAERSK-INV-20250418.pdf",
    bolRef: "MAEU-2025-04182",
    invoiceNo: "MAERSK-INV-20250418",
    route: "Shanghai → Singapore",
    amount: "USD 4,057.00",
    hasExceptions: true,
    apReference: "AP-2025-04182",
    bolPreview: [
      { label: "BOL No.", value: "MAEU-2025-04182", mono: true },
      { label: "Shipper", value: "Global Textiles Co." },
      { label: "Consignee", value: "Neoflo PTE LTD" },
      { label: "Origin", value: "Shanghai, CN" },
      { label: "Destination", value: "Singapore, SG" },
      { label: "ETD Shanghai", value: "June 10, 2026" },
      { label: "ETA Singapore", value: "June 18, 2026" },
      { label: "Gross Weight", value: "4,820 kg" },
      { label: "Ocean Freight", value: "USD 3,200.00", mono: true },
      { label: "Fuel Surcharge", value: "USD 480.00", mono: true },
    ],
    invoicePreview: [
      { label: "Invoice No.", value: "MAERSK-INV-20250418", mono: true },
      { label: "BOL Ref.", value: "MAEU-2025-04182", mono: true },
      { label: "Carrier", value: "Maersk Line" },
      { label: "Invoice Date", value: "June 19, 2026" },
      { label: "Ocean Freight", value: "USD 3,200.00", mono: true },
      { label: "Fuel Surcharge", value: "USD 612.00", mono: true },
      { label: "THC (Dest.)", value: "USD 245.00", mono: true },
      { label: "Total Due", value: "USD 4,057.00", mono: true },
    ],
    resultsHeader: {
      bolNo: "MAEU-2025-04182",
      carrier: "Maersk Line",
      route: "Shanghai, CN → Singapore, SG",
      date: "June 19, 2026",
      exceptions: 2,
    },
    summaryCards: [
      { label: "BOL Value", value: "$3,680", note: "Agreed freight + surcharges", tone: "neutral" },
      { label: "Invoice Total", value: "$4,057", note: "Billed by Maersk Line", tone: "red" },
      { label: "Discrepancy", value: "$377", note: "Overbilled vs BOL terms", tone: "amber" },
      { label: "Match Rate", value: "68%", note: "4 of 6 line items matched", tone: "green" },
    ],
    aiInsight:
      "The carrier invoice includes a Destination THC of $245.00 and a fuel surcharge uplift of $132.00 not referenced in the BOL. The THC may be a legitimate port charge — verify against the agreed service contract. The fuel surcharge variance of 27.5% exceeds the ±10% threshold in your rate card. Recommend raising a dispute for the surcharge line before payment.",
    bolPanel: {
      tag: "MAEU-2025-04182",
      fields: [
        { label: "Shipper", value: "Global Textiles Co." },
        { label: "Consignee", value: "Neoflo PTE LTD" },
        { label: "Origin Port", value: "Shanghai, CN" },
        { label: "Destination Port", value: "Singapore, SG" },
        { label: "ETD Shanghai", value: "June 10, 2026" },
        { label: "ETA Singapore", value: "June 18, 2026" },
        { label: "Gross Weight", value: "4,820 kg" },
        { label: "Container No.", value: "MRKU-7841203", mono: true },
      ],
      charges: [
        { label: "Ocean Freight", value: "$3,200.00", tone: "green", note: "Matched" },
        { label: "Fuel Surcharge (BAF)", value: "$480.00", tone: "amber", note: "+27.5% variance on invoice" },
      ],
    },
    invoicePanel: {
      tag: "MAERSK-INV-20250418",
      fields: [
        { label: "Carrier", value: "Maersk Line" },
        { label: "Invoice Date", value: "June 19, 2026" },
        { label: "Payment Terms", value: "Net 30" },
        { label: "Due Date", value: "July 19, 2026" },
        { label: "BOL Reference", value: "MAEU-2025-04182", mono: true },
        { label: "Currency", value: "USD" },
      ],
      charges: [
        { label: "Ocean Freight", value: "$3,200.00", tone: "green", note: "Matched" },
        { label: "Fuel Surcharge (BAF)", value: "$612.00", tone: "red", note: "$132 over agreed rate" },
        { label: "THC (Destination)", value: "$245.00", tone: "amber", note: "Not in BOL — verify" },
      ],
    },
    exceptions: [
      {
        title: "Fuel Surcharge (BAF) variance",
        detail:
          "Invoice charges $612.00 vs $480.00 agreed in BOL — a $132.00 (27.5%) uplift that exceeds the ±10% tolerance.",
      },
      {
        title: "Destination THC not in BOL",
        detail:
          "Invoice includes a $245.00 Destination Terminal Handling Charge with no corresponding BOL entry. Confirm this is legitimate before approving.",
      },
    ],
    lineItems: [
      { id: "li-1", charge: "Ocean Freight", agreed: "$3,200.00", invoice: "$3,200.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
      { id: "li-2", charge: "Fuel Surcharge (BAF)", agreed: "$480.00", invoice: "$612.00", variance: "+$132.00", varianceTone: "red", status: "pending", requiresDecision: true },
      { id: "li-3", charge: "THC (Destination)", agreed: "—", invoice: "$245.00", variance: "+$245.00", varianceTone: "amber", status: "pending", requiresDecision: true },
      { id: "li-4", charge: "Documentation Fee", agreed: "$45.00", invoice: "$45.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
      { id: "li-5", charge: "Port Surcharge", agreed: "$90.00", invoice: "$90.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
      { id: "li-6", charge: "Seal Fee", agreed: "$30.00", invoice: "$30.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
    ],
    stageTone: "amber",
    stage: "Exceptions",
    apEntry: {
      id: "MAERSK-INV-20250418",
      reconSetId: "maersk",
      bolRef: "MAEU-2025-04182",
      carrier: "Maersk Line",
      route: "Shanghai → Singapore",
      invoiceDate: "June 19, 2026",
      dueDate: "July 19, 2026",
      amount: "USD 4,057.00",
      status: "exceptions-approved",
      overdue: false,
      paymentTerms: "Net 30 days",
      bank: "Deutsche Bank — DEUTDEHHXXX",
      iban: "DE89 2004 0060 0123 4567 00",
      payRef: "PAY-2025-0418-001",
      exceptionNote:
        "Approved with exceptions: Fuel Surcharge variance (+USD 132.00) and Destination THC (USD 245.00) were reviewed and approved.",
      breakdown: [
        { label: "Ocean Freight", value: "USD 3,200.00" },
        { label: "Fuel Surcharge (BAF) incl. approved variance", value: "USD 612.00" },
        { label: "Destination THC (approved)", value: "USD 245.00" },
      ],
      total: "USD 4,057.00",
    },
  },

  cmacgm: {
    id: "cmacgm",
    carrier: "CMA CGM",
    bolFilename: "BOL-CMAU-2025-04190.pdf",
    invoiceFilename: "CMACGM-INV-20250422.pdf",
    bolRef: "CMAU-2025-04190",
    invoiceNo: "CMACGM-INV-20250422",
    route: "Singapore → Ho Chi Minh City",
    amount: "USD 2,890.00",
    hasExceptions: false,
    apReference: "AP-2025-04190",
    bolPreview: [
      { label: "BOL No.", value: "CMAU-2025-04190", mono: true },
      { label: "Shipper", value: "Pacific Goods Ltd." },
      { label: "Consignee", value: "Lazada Vietnam" },
      { label: "Origin", value: "Singapore, SG" },
      { label: "Destination", value: "Ho Chi Minh City, VN" },
      { label: "Gross Weight", value: "3,210 kg" },
      { label: "Ocean Freight", value: "USD 2,450.00", mono: true },
      { label: "Documentation Fee", value: "USD 55.00", mono: true },
    ],
    invoicePreview: [
      { label: "Invoice No.", value: "CMACGM-INV-20250422", mono: true },
      { label: "BOL Ref.", value: "CMAU-2025-04190", mono: true },
      { label: "Carrier", value: "CMA CGM" },
      { label: "Invoice Date", value: "April 22, 2025" },
      { label: "Ocean Freight", value: "USD 2,450.00", mono: true },
      { label: "Documentation Fee", value: "USD 55.00", mono: true },
      { label: "Port Surcharge", value: "USD 385.00", mono: true },
      { label: "Total Due", value: "USD 2,890.00", mono: true },
    ],
    resultsHeader: {
      bolNo: "CMAU-2025-04190",
      carrier: "CMA CGM",
      route: "Singapore, SG → Ho Chi Minh City, VN",
      date: "April 22, 2025",
      exceptions: 0,
    },
    summaryCards: [
      { label: "BOL Value", value: "$2,890", note: "Agreed freight + surcharges", tone: "neutral" },
      { label: "Invoice Total", value: "$2,890", note: "Billed by CMA CGM", tone: "green" },
      { label: "Discrepancy", value: "$0", note: "Perfect match", tone: "green" },
      { label: "Match Rate", value: "100%", note: "All 5 line items matched", tone: "green" },
    ],
    aiInsight:
      "All line items on this carrier invoice reconcile perfectly against the agreed BOL terms. No exceptions found. This invoice is cleared for immediate payment — no further action required.",
    bolPanel: {
      tag: "CMAU-2025-04190",
      fields: [
        { label: "Shipper", value: "Pacific Goods Ltd." },
        { label: "Consignee", value: "Lazada Vietnam" },
        { label: "Origin Port", value: "Singapore, SG" },
        { label: "Destination Port", value: "Ho Chi Minh City, VN" },
        { label: "Gross Weight", value: "3,210 kg" },
        { label: "Container No.", value: "CMAU-5521087", mono: true },
      ],
      charges: [
        { label: "Ocean Freight", value: "$2,450.00", tone: "green", note: "Matched" },
        { label: "Documentation Fee", value: "$55.00", tone: "green", note: "Matched" },
        { label: "Port Surcharge", value: "$385.00", tone: "green", note: "Matched" },
      ],
    },
    invoicePanel: {
      tag: "CMACGM-INV-20250422",
      fields: [
        { label: "Carrier", value: "CMA CGM" },
        { label: "Invoice Date", value: "April 22, 2025" },
        { label: "Payment Terms", value: "Net 30" },
        { label: "Due Date", value: "May 22, 2025" },
        { label: "BOL Reference", value: "CMAU-2025-04190", mono: true },
        { label: "Currency", value: "USD" },
      ],
      charges: [
        { label: "Ocean Freight", value: "$2,450.00", tone: "green", note: "Matched" },
        { label: "Documentation Fee", value: "$55.00", tone: "green", note: "Matched" },
        { label: "Port Surcharge", value: "$385.00", tone: "green", note: "Matched" },
      ],
    },
    exceptions: [],
    lineItems: [
      { id: "li-1", charge: "Ocean Freight", agreed: "$2,450.00", invoice: "$2,450.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
      { id: "li-2", charge: "Documentation Fee", agreed: "$55.00", invoice: "$55.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
      { id: "li-3", charge: "Port Surcharge", agreed: "$385.00", invoice: "$385.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
      { id: "li-4", charge: "Seal Fee", agreed: "$30.00", invoice: "$30.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
      { id: "li-5", charge: "Fuel Surcharge (BAF)", agreed: "$0.00", invoice: "$0.00", variance: "$0.00", varianceTone: "neutral", status: "approved", requiresDecision: false },
    ],
    stageTone: "green",
    stage: "Complete",
    apEntry: {
      id: "CMACGM-INV-20250422",
      reconSetId: "cmacgm",
      bolRef: "CMAU-2025-04190",
      carrier: "CMA CGM",
      route: "Singapore → Ho Chi Minh City",
      invoiceDate: "April 22, 2025",
      dueDate: "May 22, 2025",
      amount: "USD 2,890.00",
      status: "cleared",
      overdue: false,
      paymentTerms: "Net 30 days",
      bank: "Société Générale — SOGEFRPPXXX",
      iban: "FR76 3000 3000 0512 3456 7890 189",
      payRef: "PAY-2025-0422-004",
      exceptionNote: null,
      breakdown: [
        { label: "Ocean Freight", value: "USD 2,450.00" },
        { label: "Documentation Fee", value: "USD 55.00" },
        { label: "Port Surcharge", value: "USD 385.00" },
      ],
      total: "USD 2,890.00",
    },
  },

  // ── Extra mock sets — reuse cmacgm results page for demo ──────────────────
  evergreen: {
    id: "evergreen",
    carrier: "Evergreen Line",
    bolFilename: "BOL-EGLV-2025-03921.pdf",
    invoiceFilename: "EGL-INV-20250401.pdf",
    bolRef: "EGLV-2025-03921",
    invoiceNo: "EGL-INV-20250401",
    route: "Shanghai → Tanjung Pelepas",
    amount: "USD 3,140.00",
    hasExceptions: true,
    apReference: "AP-2025-03921",
    bolPreview: [],
    invoicePreview: [],
    resultsHeader: { bolNo: "EGLV-2025-03921", carrier: "Evergreen Line", route: "Shanghai, CN → Tanjung Pelepas, MY", date: "April 1, 2025", exceptions: 1 },
    summaryCards: [
      { label: "BOL Value", value: "$3,052", note: "Agreed freight + surcharges", tone: "neutral" },
      { label: "Invoice Total", value: "$3,140", note: "Billed by Evergreen Line", tone: "amber" },
      { label: "Discrepancy", value: "$88", note: "Overbilled vs BOL terms", tone: "amber" },
      { label: "Match Rate", value: "86%", note: "5 of 6 line items matched", tone: "green" },
    ],
    aiInsight: "One exception found: a BAF (Bunker Adjustment Factor) surcharge of $88.00 above the agreed rate. The variance is within the 10% tolerance if your rate card allows for fuel adjustment clauses. Verify against your service contract before approving.",
    bolPanel: {
      tag: "EGLV-2025-03921",
      fields: [
        { label: "Shipper", value: "Asia Exports Co." },
        { label: "Consignee", value: "Zalora MY Sdn Bhd" },
        { label: "Origin Port", value: "Shanghai, CN" },
        { label: "Destination Port", value: "Tanjung Pelepas, MY" },
        { label: "Gross Weight", value: "3,780 kg" },
        { label: "Container No.", value: "EGLU-4421089", mono: true },
      ],
      charges: [
        { label: "Ocean Freight", value: "$2,800.00", tone: "green" as const, note: "Matched" },
        { label: "Fuel Surcharge (BAF)", value: "$252.00", tone: "amber" as const, note: "+$88 variance on invoice" },
      ],
    },
    invoicePanel: {
      tag: "EGL-INV-20250401",
      fields: [
        { label: "Carrier", value: "Evergreen Line" },
        { label: "Invoice Date", value: "April 1, 2025" },
        { label: "Payment Terms", value: "Net 30" },
        { label: "Due Date", value: "May 1, 2025" },
        { label: "BOL Reference", value: "EGLV-2025-03921", mono: true },
        { label: "Currency", value: "USD" },
      ],
      charges: [
        { label: "Ocean Freight", value: "$2,800.00", tone: "green" as const, note: "Matched" },
        { label: "Fuel Surcharge (BAF)", value: "$340.00", tone: "red" as const, note: "$88 over agreed rate" },
      ],
    },
    exceptions: [
      { title: "BAF surcharge variance", detail: "Invoice charges $340.00 vs $252.00 agreed — a $88.00 uplift that may require carrier confirmation." },
    ],
    lineItems: [
      { id: "li-1", charge: "Ocean Freight", agreed: "$2,800.00", invoice: "$2,800.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
      { id: "li-2", charge: "Fuel Surcharge (BAF)", agreed: "$252.00", invoice: "$340.00", variance: "+$88.00", varianceTone: "amber" as const, status: "pending" as const, requiresDecision: true },
      { id: "li-3", charge: "Documentation Fee", agreed: "$45.00", invoice: "$45.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
      { id: "li-4", charge: "Port Surcharge", agreed: "$90.00", invoice: "$90.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
      { id: "li-5", charge: "Seal Fee", agreed: "$30.00", invoice: "$30.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
      { id: "li-6", charge: "THC (Origin)", agreed: "$80.00", invoice: "$80.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
    ],
    stageTone: "amber",
    stage: "Exceptions",
    detailPanel: {
      invoiceNo: "EGL-INV-20250401", invoiceDate: "April 1, 2025", dueDate: "May 1, 2025", carrier: "Evergreen Line",
      route: "Shanghai → Tanjung Pelepas", bolRef: "EGLV-2025-03921", amount: "$3,140.00", currency: "USD",
      paymentBreakdown: [{ label: "Ocean Freight", value: "USD 2,800.00" }, { label: "Fuel Surcharge", value: "USD 340.00" }],
      total: "USD 3,140.00",
    },
  },

  msc: {
    id: "msc",
    carrier: "MSC",
    bolFilename: "BOL-MSCU-2025-04031.pdf",
    invoiceFilename: "MSC-INV-20250405.pdf",
    bolRef: "MSCU-2025-04031",
    invoiceNo: "MSC-INV-20250405",
    route: "Klang → Rotterdam",
    amount: "USD 5,820.00",
    hasExceptions: false,
    apReference: "AP-2025-04031",
    bolPreview: [],
    invoicePreview: [],
    resultsHeader: { bolNo: "MSCU-2025-04031", carrier: "MSC", route: "Klang, MY → Rotterdam, NL", date: "April 5, 2025", exceptions: 0 },
    summaryCards: [
      { label: "BOL Value", value: "$5,820", note: "Agreed freight + surcharges", tone: "neutral" },
      { label: "Invoice Total", value: "$5,820", note: "Billed by MSC", tone: "green" },
      { label: "Discrepancy", value: "$0", note: "Perfect match", tone: "green" },
      { label: "Match Rate", value: "100%", note: "All line items matched", tone: "green" },
    ],
    aiInsight: "All line items reconcile perfectly against the BOL terms. No exceptions found. This invoice is cleared for immediate payment.",
    bolPanel: {
      tag: "MSCU-2025-04031",
      fields: [
        { label: "Shipper", value: "Proton Auto Parts Sdn Bhd" },
        { label: "Consignee", value: "BMW AG, Munich" },
        { label: "Origin Port", value: "Klang, MY" },
        { label: "Destination Port", value: "Rotterdam, NL" },
        { label: "Gross Weight", value: "8,420 kg" },
        { label: "Container No.", value: "MSCU-9914302", mono: true },
      ],
      charges: [
        { label: "Ocean Freight", value: "$4,800.00", tone: "green" as const, note: "Matched" },
        { label: "Documentation Fee", value: "$55.00", tone: "green" as const, note: "Matched" },
        { label: "Port Surcharge", value: "$965.00", tone: "green" as const, note: "Matched" },
      ],
    },
    invoicePanel: {
      tag: "MSC-INV-20250405",
      fields: [
        { label: "Carrier", value: "MSC" },
        { label: "Invoice Date", value: "April 5, 2025" },
        { label: "Payment Terms", value: "Net 30" },
        { label: "Due Date", value: "May 5, 2025" },
        { label: "BOL Reference", value: "MSCU-2025-04031", mono: true },
        { label: "Currency", value: "USD" },
      ],
      charges: [
        { label: "Ocean Freight", value: "$4,800.00", tone: "green" as const, note: "Matched" },
        { label: "Documentation Fee", value: "$55.00", tone: "green" as const, note: "Matched" },
        { label: "Port Surcharge", value: "$965.00", tone: "green" as const, note: "Matched" },
      ],
    },
    exceptions: [],
    lineItems: [
      { id: "li-1", charge: "Ocean Freight", agreed: "$4,800.00", invoice: "$4,800.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
      { id: "li-2", charge: "Documentation Fee", agreed: "$55.00", invoice: "$55.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
      { id: "li-3", charge: "Port Surcharge", agreed: "$965.00", invoice: "$965.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
    ],
    stageTone: "green",
    stage: "Complete",
    detailPanel: {
      invoiceNo: "MSC-INV-20250405", invoiceDate: "April 5, 2025", dueDate: "May 5, 2025", carrier: "MSC",
      route: "Klang → Rotterdam", bolRef: "MSCU-2025-04031", amount: "$5,820.00", currency: "USD",
      paymentBreakdown: [{ label: "Ocean Freight", value: "USD 4,800.00" }, { label: "Port Surcharge", value: "USD 965.00" }, { label: "Documentation Fee", value: "USD 55.00" }],
      total: "USD 5,820.00",
    },
  },

  hapag: {
    id: "hapag",
    carrier: "Hapag-Lloyd",
    bolFilename: "BOL-HLCU-2025-04201.pdf",
    invoiceFilename: "HL-INV-20250416.pdf",
    bolRef: "HLCU-2025-04201",
    invoiceNo: "HL-INV-20250416",
    route: "Hamburg → Singapore",
    amount: "USD 6,550.00",
    hasExceptions: false,
    apReference: "AP-2025-04201",
    bolPreview: [],
    invoicePreview: [],
    resultsHeader: { bolNo: "HLCU-2025-04201", carrier: "Hapag-Lloyd", route: "Hamburg, DE → Singapore, SG", date: "April 16, 2025", exceptions: 0 },
    summaryCards: [
      { label: "BOL Value", value: "$6,550", note: "Agreed freight + surcharges", tone: "neutral" },
      { label: "Invoice Total", value: "$6,550", note: "Billed by Hapag-Lloyd", tone: "green" },
      { label: "Discrepancy", value: "$0", note: "Perfect match", tone: "green" },
      { label: "Match Rate", value: "100%", note: "All line items matched", tone: "green" },
    ],
    aiInsight: "All line items reconcile perfectly against the BOL terms. No exceptions found. This invoice is cleared for immediate payment.",
    bolPanel: {
      tag: "HLCU-2025-04201",
      fields: [
        { label: "Shipper", value: "Deutsche Industriegüter GmbH" },
        { label: "Consignee", value: "Changi Logistics Pte Ltd" },
        { label: "Origin Port", value: "Hamburg, DE" },
        { label: "Destination Port", value: "Singapore, SG" },
        { label: "Gross Weight", value: "11,200 kg" },
        { label: "Container No.", value: "HLCU-2287461", mono: true },
      ],
      charges: [
        { label: "Ocean Freight", value: "$5,200.00", tone: "green" as const, note: "Matched" },
        { label: "Documentation Fee", value: "$80.00", tone: "green" as const, note: "Matched" },
        { label: "THC (Destination)", value: "$1,270.00", tone: "green" as const, note: "Matched" },
      ],
    },
    invoicePanel: {
      tag: "HL-INV-20250416",
      fields: [
        { label: "Carrier", value: "Hapag-Lloyd" },
        { label: "Invoice Date", value: "April 16, 2025" },
        { label: "Payment Terms", value: "Net 30" },
        { label: "Due Date", value: "May 16, 2025" },
        { label: "BOL Reference", value: "HLCU-2025-04201", mono: true },
        { label: "Currency", value: "USD" },
      ],
      charges: [
        { label: "Ocean Freight", value: "$5,200.00", tone: "green" as const, note: "Matched" },
        { label: "Documentation Fee", value: "$80.00", tone: "green" as const, note: "Matched" },
        { label: "THC (Destination)", value: "$1,270.00", tone: "green" as const, note: "Matched" },
      ],
    },
    exceptions: [],
    lineItems: [
      { id: "li-1", charge: "Ocean Freight", agreed: "$5,200.00", invoice: "$5,200.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
      { id: "li-2", charge: "Documentation Fee", agreed: "$80.00", invoice: "$80.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
      { id: "li-3", charge: "THC (Destination)", agreed: "$1,270.00", invoice: "$1,270.00", variance: "$0.00", varianceTone: "neutral" as const, status: "approved" as const, requiresDecision: false },
    ],
    stageTone: "green",
    stage: "Complete",
    detailPanel: {
      invoiceNo: "HL-INV-20250416", invoiceDate: "April 16, 2025", dueDate: "May 16, 2025", carrier: "Hapag-Lloyd",
      route: "Hamburg → Singapore", bolRef: "HLCU-2025-04201", amount: "$6,550.00", currency: "USD",
      paymentBreakdown: [{ label: "Ocean Freight", value: "USD 5,200.00" }, { label: "THC (Destination)", value: "USD 1,270.00" }, { label: "Documentation Fee", value: "USD 80.00" }],
      total: "USD 6,550.00",
    },
  },
};

export interface ApInvoice {
  id: string;
  carrier: string;
  bolRef: string;
  invoiceNo?: string;
  amount: string;
  route: string;
  dueDate: string;
  status: string;
  overdue?: boolean;
  exceptions: number;
  exceptionNote: string | null;
  paymentTerms?: string;
  bank?: string;
  iban?: string;
  payRef?: string;
  breakdown?: { label: string; value: string }[];
  total?: string;
  invoiceDate?: string;
  reconSetId?: string;
  fields?: { label: string; value: string; mono?: boolean }[];
}

export const AP_SEED_INVOICES: ApInvoice[] = [
  {
    id: "ap-001",
    carrier: "Evergreen Line",
    bolRef: "EGLV-2025-03921",
    invoiceNo: "EGL-INV-20250401",
    amount: "$3,140.00",
    route: "Shanghai → Tanjung Pelepas",
    dueDate: "May 1, 2025",
    status: "exceptions-approved",
    exceptions: 1,
    exceptionNote: "BAF variance of $88 approved by AP Manager on Apr 15.",
    paymentTerms: "Net 30 days",
    bank: "DBS Bank Ltd — DBSSSGSG",
    iban: "012-345678-9",
    payRef: "PAY-2025-0401-001",
    breakdown: [
      { label: "Ocean Freight", value: "$2,800.00" },
      { label: "Fuel Surcharge (BAF)", value: "$340.00" },
    ],
    total: "$3,140.00",
    invoiceDate: "April 1, 2025",
    fields: [
      { label: "Payment Method", value: "SWIFT Bank Transfer" },
      { label: "Bank Name", value: "DBS Bank Ltd" },
      { label: "Account No.", value: "012-345678-9", mono: true },
      { label: "SWIFT Code", value: "DBSSSGSG", mono: true },
      { label: "Reference", value: "EGL-INV-20250401", mono: true },
      { label: "Amount", value: "$3,140.00", mono: true },
    ],
  },
  {
    id: "ap-002",
    carrier: "MSC",
    bolRef: "MSCU-2025-04031",
    invoiceNo: "MSC-INV-20250405",
    amount: "$5,820.00",
    route: "Klang → Rotterdam",
    dueDate: "May 5, 2025",
    status: "overdue",
    overdue: true,
    exceptions: 0,
    exceptionNote: null,
    paymentTerms: "Net 30 days",
    bank: "OCBC Bank — OCBCSGSG",
    iban: "456-789012-3",
    payRef: "PAY-2025-0405-002",
    breakdown: [
      { label: "Ocean Freight", value: "$5,000.00" },
      { label: "Fuel Surcharge (BAF)", value: "$820.00" },
    ],
    total: "$5,820.00",
    invoiceDate: "April 5, 2025",
    fields: [
      { label: "Payment Method", value: "SWIFT Bank Transfer" },
      { label: "Bank Name", value: "OCBC Bank" },
      { label: "Account No.", value: "456-789012-3", mono: true },
      { label: "SWIFT Code", value: "OCBCSGSG", mono: true },
      { label: "Reference", value: "MSC-INV-20250405", mono: true },
      { label: "Amount", value: "$5,820.00", mono: true },
    ],
  },
  {
    id: "ap-003",
    carrier: "COSCO",
    bolRef: "COSU-2025-04102",
    invoiceNo: "COSCO-INV-20250408",
    amount: "$2,975.00",
    route: "Tianjin → Singapore",
    dueDate: "May 8, 2025",
    status: "cleared",
    exceptions: 0,
    exceptionNote: null,
    paymentTerms: "Net 30 days",
    bank: "UOB Bank — UOVBSGSG",
    iban: "789-012345-6",
    payRef: "PAY-2025-0408-003",
    breakdown: [
      { label: "Ocean Freight", value: "$2,500.00" },
      { label: "Fuel Surcharge (BAF)", value: "$475.00" },
    ],
    total: "$2,975.00",
    invoiceDate: "April 8, 2025",
    fields: [
      { label: "Payment Method", value: "SWIFT Bank Transfer" },
      { label: "Bank Name", value: "UOB Bank" },
      { label: "Account No.", value: "789-012345-6", mono: true },
      { label: "SWIFT Code", value: "UOVBSGSG", mono: true },
      { label: "Reference", value: "COSCO-INV-20250408", mono: true },
      { label: "Amount", value: "$2,975.00", mono: true },
    ],
  },
  {
    id: "ap-004",
    carrier: "ONE Line",
    bolRef: "ONEY-2025-04155",
    invoiceNo: "ONE-INV-20250412",
    amount: "$4,210.00",
    route: "Busan → Tanjung Pelepas",
    dueDate: "May 12, 2025",
    status: "paid",
    exceptions: 0,
    exceptionNote: null,
    paymentTerms: "Net 30 days",
    bank: "DBS Bank Ltd — DBSSSGSG",
    iban: "321-654987-0",
    payRef: "PAY-2025-0412-004",
    breakdown: [
      { label: "Ocean Freight", value: "$3,600.00" },
      { label: "Fuel Surcharge (BAF)", value: "$610.00" },
    ],
    total: "$4,210.00",
    invoiceDate: "April 12, 2025",
    fields: [
      { label: "Payment Method", value: "SWIFT Bank Transfer" },
      { label: "Bank Name", value: "DBS Bank Ltd" },
      { label: "Account No.", value: "321-654987-0", mono: true },
      { label: "SWIFT Code", value: "DBSSSGSG", mono: true },
      { label: "Reference", value: "ONE-INV-20250412", mono: true },
      { label: "Amount", value: "$4,210.00", mono: true },
    ],
  },
  {
    id: "ap-005",
    carrier: "Hapag-Lloyd",
    bolRef: "HLCU-2025-04201",
    invoiceNo: "HL-INV-20250416",
    amount: "$6,550.00",
    route: "Hamburg → Singapore",
    dueDate: "May 16, 2025",
    status: "cleared",
    exceptions: 2,
    exceptionNote: "Two exceptions approved: documentation uplift and seal fee variance.",
    paymentTerms: "Net 30 days",
    bank: "Standard Chartered — SCBLSGSG",
    iban: "654-321098-7",
    payRef: "PAY-2025-0416-005",
    breakdown: [
      { label: "Ocean Freight", value: "$5,600.00" },
      { label: "Fuel Surcharge (BAF)", value: "$950.00" },
    ],
    total: "$6,550.00",
    invoiceDate: "April 16, 2025",
    fields: [
      { label: "Payment Method", value: "SWIFT Bank Transfer" },
      { label: "Bank Name", value: "Standard Chartered" },
      { label: "Account No.", value: "654-321098-7", mono: true },
      { label: "SWIFT Code", value: "SCBLSGSG", mono: true },
      { label: "Reference", value: "HL-INV-20250416", mono: true },
      { label: "Amount", value: "$6,550.00", mono: true },
    ],
  },
  {
    id: "ap-006",
    carrier: "Yang Ming",
    bolRef: "YMLU-2025-04230",
    invoiceNo: "YM-INV-20250419",
    amount: "$3,890.00",
    route: "Kaohsiung → Jakarta",
    dueDate: "May 19, 2025",
    status: "exceptions-approved",
    exceptions: 1,
    exceptionNote: "THC variance of $55 approved.",
    paymentTerms: "Net 30 days",
    bank: "DBS Bank Ltd — DBSSSGSG",
    iban: "987-654321-0",
    payRef: "PAY-2025-0419-006",
    breakdown: [
      { label: "Ocean Freight", value: "$3,300.00" },
      { label: "Fuel Surcharge (BAF)", value: "$590.00" },
    ],
    total: "$3,890.00",
    invoiceDate: "April 19, 2025",
    fields: [
      { label: "Payment Method", value: "SWIFT Bank Transfer" },
      { label: "Bank Name", value: "DBS Bank Ltd" },
      { label: "Account No.", value: "987-654321-0", mono: true },
      { label: "SWIFT Code", value: "DBSSSGSG", mono: true },
      { label: "Reference", value: "YM-INV-20250419", mono: true },
      { label: "Amount", value: "$3,890.00", mono: true },
    ],
  },
];

export const AP_SUMMARY = {
  totalOutstanding: "$26,375.00",
  overdueCount: 1,
  avgDaysToClose: "3.2 days",
  matchRate: "94%",
  paidCount: 6,
  paidAmount: "USD 38,240",
};

export const HOME_STAGE_FILTERS: string[] = [
  "Awaiting Documents",
  "Processing",
  "Exceptions",
  "Approved",
  "Complete",
];

export const SAMPLE_FILES: { setId: string; type: "bol" | "invoice"; filename: string; name: string; label: string }[] = [
  { setId: "maersk",  type: "bol",     filename: "BOL-MAEU-2025-04182.pdf",  name: "BOL-MAEU-2025-04182.pdf",  label: "BOL · Maersk" },
  { setId: "maersk",  type: "invoice", filename: "MAERSK-INV-20250418.pdf",  name: "MAERSK-INV-20250418.pdf",  label: "Invoice · Maersk" },
  { setId: "cmacgm",  type: "bol",     filename: "BOL-CMAU-2025-04190.pdf",  name: "BOL-CMAU-2025-04190.pdf",  label: "BOL · CMA CGM" },
  { setId: "cmacgm",  type: "invoice", filename: "CMACGM-INV-20250422.pdf",  name: "CMACGM-INV-20250422.pdf",  label: "Invoice · CMA CGM" },
];

export function findDocByFilename(name: string): { setId: string; type: "bol" | "invoice" } | null {
  const n = String(name).trim().toLowerCase();
  for (const set of Object.values(DOCUMENT_SETS)) {
    if (set.bolFilename.toLowerCase() === n) return { setId: set.id, type: "bol" };
    if (set.invoiceFilename.toLowerCase() === n) return { setId: set.id, type: "invoice" };
  }
  return null;
}

export const DASHBOARD_STATS = [
  { label: "Shipments Processed", value: "142", note: "+18% vs March", tone: "green" },
  { label: "Total Invoice Value", value: "$1.24M", note: "Across all carriers", tone: "neutral" },
  { label: "Discrepancies Found", value: "34", note: "24% of volume", tone: "amber" },
  { label: "Amount Recovered", value: "$18.4K", note: "vs $6.2K last month", tone: "green" },
];

// ── Full 142-shipment list (last 90 days) ────────────────────────────────────

type ShipmentStatus = "cleared" | "exceptions" | "overdue" | "error" | "pending";

export interface Shipment {
  bol: string;
  route: string;
  carrier: string;
  amount: string;
  status: ShipmentStatus;
  statusLabel: string;
  linkTo?: string;
  date: string;          // ISO YYYY-MM-DD — used for date filtering
  daysAgo: number;
}

function _makeShipments(): Shipment[] {
  const carriers = [
    { name: "Maersk Line",   prefix: "MAEU" },
    { name: "CMA CGM",       prefix: "CMAU" },
    { name: "OOCL",          prefix: "OOLU" },
    { name: "MSC",           prefix: "MSCU" },
    { name: "Hapag-Lloyd",   prefix: "HLCU" },
    { name: "Evergreen",     prefix: "EGLV" },
    { name: "Yang Ming",     prefix: "YMLU" },
    { name: "ONE Line",      prefix: "ONEY" },
    { name: "Cosco",         prefix: "COSU" },
    { name: "PIL",           prefix: "PILG" },
  ];
  const routes = [
    "Shanghai → Singapore",
    "Singapore → Ho Chi Minh City",
    "Busan → Rotterdam",
    "Klang → Rotterdam",
    "Hamburg → Singapore",
    "Shanghai → Tanjung Pelepas",
    "Kaohsiung → Jakarta",
    "Tianjin → Singapore",
    "Singapore → Sydney",
    "Hong Kong → Los Angeles",
    "Qingdao → Hamburg",
    "Ningbo → Felixstowe",
    "Bangkok → Colombo",
    "Manila → Singapore",
    "Surabaya → Fremantle",
  ];
  const statusPool: { status: ShipmentStatus; label: string }[] = [
    { status: "cleared",    label: "Cleared" },
    { status: "cleared",    label: "Cleared" },
    { status: "cleared",    label: "Cleared" },
    { status: "cleared",    label: "Cleared" },
    { status: "exceptions", label: "1 exception" },
    { status: "exceptions", label: "2 exceptions" },
    { status: "exceptions", label: "3 exceptions" },
    { status: "overdue",    label: "Overdue" },
    { status: "pending",    label: "Pending review" },
    { status: "error",      label: "Flagged" },
  ];
  const linkMap: Record<string, string> = {
    "MAEU": "/freight/results/maersk",
    "CMAU": "/freight/results/cmacgm",
    "EGLV": "/freight/results/evergreen",
    "MSCU": "/freight/results/msc",
    "HLCU": "/freight/results/hapag",
  };

  // Fixed first 5 to match original
  const fixed: Shipment[] = [
    { bol: "MAEU-2025-04182", route: "Shanghai → Singapore",           carrier: "Maersk Line",  amount: "$4,057", status: "exceptions", statusLabel: "2 exceptions", linkTo: "/freight/results/maersk",    date: "2025-04-18", daysAgo: 1  },
    { bol: "CMAU-2025-04190", route: "Singapore → Ho Chi Minh City",  carrier: "CMA CGM",       amount: "$2,890", status: "cleared",    statusLabel: "Cleared",       linkTo: "/freight/results/cmacgm",   date: "2025-04-17", daysAgo: 2  },
    { bol: "OOLU-2025-04177", route: "Busan → Rotterdam",             carrier: "OOCL",          amount: "$9,120", status: "exceptions", statusLabel: "3 exceptions", linkTo: "/freight/results/evergreen", date: "2025-04-16", daysAgo: 3  },
    { bol: "MSCU-2025-04031", route: "Klang → Rotterdam",             carrier: "MSC",           amount: "$5,820", status: "overdue",    statusLabel: "Overdue",       linkTo: "/freight/results/msc",      date: "2025-04-14", daysAgo: 5  },
    { bol: "HLCU-2025-04201", route: "Hamburg → Singapore",           carrier: "Hapag-Lloyd",   amount: "$6,550", status: "cleared",    statusLabel: "Cleared",       linkTo: "/freight/results/hapag",    date: "2025-04-12", daysAgo: 7  },
  ];

  const rest: Shipment[] = [];
  const amounts = [1840,2210,3050,3780,4120,4890,5340,6070,6810,7450,8220,9130,10200,11500,12800];
  let day = 8;
  for (let i = 0; i < 137; i++) {
    const c = carriers[(i * 3 + 7) % carriers.length];
    const route = routes[(i * 7 + 3) % routes.length];
    const sp = statusPool[(i * 4 + 2) % statusPool.length];
    const amt = amounts[(i * 5 + 1) % amounts.length];
    const seq = String(4200 + i).padStart(5, "0");
    const bolNo = `${c.prefix}-2025-${seq}`;
    const d = day;
    day += Math.floor(Math.random() * 2) + 1;
    const isoDate = `2025-${String(Math.floor(4 + (i * 0.6) / 30)).padStart(2,"0")}-${String(((i % 27) + 1)).padStart(2,"0")}`;
    rest.push({
      bol: bolNo,
      route,
      carrier: c.name,
      amount: `$${amt.toLocaleString()}`,
      status: sp.status,
      statusLabel: sp.label,
      linkTo: linkMap[c.prefix],
      date: isoDate,
      daysAgo: d,
    });
  }

  return [...fixed, ...rest];
}

export const ALL_SHIPMENTS: Shipment[] = _makeShipments();

// Legacy alias (still 5 items, used by dashboard CARRIER section)
export const RECENT_SHIPMENTS = ALL_SHIPMENTS.slice(0, 5);

export const CARRIER_BREAKDOWN = [
  { carrier: "Maersk Line",  shipments: 38, exceptions: 12, disputed: "$7,240", rate: 31.6 },
  { carrier: "Hapag-Lloyd",  shipments: 31, exceptions: 8,  disputed: "$4,880", rate: 25.8 },
  { carrier: "MSC",          shipments: 28, exceptions: 4,  disputed: "$1,920", rate: 14.3 },
  { carrier: "OOCL",         shipments: 25, exceptions: 7,  disputed: "$3,810", rate: 28.0 },
  { carrier: "Evergreen",    shipments: 20, exceptions: 3,  disputed: "$550",   rate: 15.0 },
  { carrier: "CMA CGM",      shipments: 18, exceptions: 5,  disputed: "$2,630", rate: 27.8 },
  { carrier: "Yang Ming",    shipments: 14, exceptions: 2,  disputed: "$740",   rate: 14.3 },
  { carrier: "ONE Line",     shipments: 12, exceptions: 3,  disputed: "$1,150", rate: 25.0 },
  { carrier: "Cosco",        shipments: 10, exceptions: 1,  disputed: "$390",   rate: 10.0 },
  { carrier: "PIL",          shipments: 6,  exceptions: 0,  disputed: "$0",     rate: 0.0  },
];
