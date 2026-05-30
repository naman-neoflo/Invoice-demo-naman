// Static seed data for the AcmeCo supplier-helpdesk demo.
// All content here is stable across reruns — only runtime mutation lives in demo-store.ts.

export type InquiryClassifierTone = "info" | "danger"
export type InquirySeedStatus =
  | "unread"
  | "auto-resolved"
  | "queued"
  | "sent"

export type DataSource = {
  system: string
  query: string
  result: string
  // Optional accent for the system-logo chip; defaults to bg-primary/15.
  tone?: string
}

export type AuditEvent = {
  // Offset in milliseconds from receivedAt — store will materialize ISO timestamps at processing time.
  offsetMs: number
  action: string
  source?: string
  reasoning?: string
}

export type InquirySeed = {
  id: string
  supplier: string
  supplierInitials: string
  supplierTone: string
  contactName: string
  contactEmail: string
  contactDomain: string
  subject: string
  body: string
  // Minutes prior to "now" — converted to a Date at render time so the inbox always feels fresh.
  receivedOffsetMinutes: number
  classifierLabel: string
  classifierConfidence: number
  classifierTone: InquiryClassifierTone
  riskLabel?: string
  // Initial seed status — store overwrites for the two interactive inquiries on reset().
  defaultStatus: InquirySeedStatus
  // Only populated for the two demo-critical inquiries; filler rows leave these undefined.
  dataSources?: DataSource[]
  reasoningTrace?: string[]
  draftedResponse?: string
  responseRecipient?: string
  auditEvents?: AuditEvent[]
  // Inquiry-2-only context shown in the queued-for-human panel.
  verificationProtocol?: string[]
  historicalCorrespondence?: { date: string; summary: string }[]
  fraudSignals?: string[]
}

/**
 * Returns the date the inquiry was "received" — relative to the moment of call.
 * Computed at render time so timestamps in the inbox always read as "minutes ago"
 * instead of staling against a baked-in anchor date.
 */
export function getReceivedDate(seed: InquirySeed): Date {
  return new Date(Date.now() - seed.receivedOffsetMinutes * 60_000)
}

const minutes = (n: number): number => n
const hours = (n: number): number => Math.round(n * 60)

// Verbatim from the demo script — must match across detail page, audit log, and seller talk track.
const INQUIRY_1_RESPONSE = `Hi Sarah, thanks for following up. Invoice 4521 ($12,840) was paid on October 18 via ACH. Bank reference: TXN-8821-2025. You should see it in your account within the next 1-2 business days if you haven't already. Let me know if you'd like me to email the payment confirmation.

— AcmeCo AP Team`

export const INQUIRY_1: InquirySeed = {
  id: "inv-4521",
  supplier: "Acme Industrial Supplies",
  supplierInitials: "AI",
  supplierTone: "bg-emerald-100 text-emerald-700",
  contactName: "Sarah Chen",
  contactEmail: "sarah.chen@acmeindustrial.com",
  contactDomain: "acmeindustrial.com",
  subject: "Status of invoice 4521 — payment overdue?",
  body: `Hi AcmeCo team,

Following up on invoice 4521 for $12,840 issued October 3. Our records show it's now past the 30-day terms and we haven't received payment confirmation. Can you let me know where this stands? Happy to provide any additional documentation if needed.

Thanks,
Sarah`,
  receivedOffsetMinutes: minutes(8),
  classifierLabel: "Invoice status inquiry",
  classifierConfidence: 96,
  classifierTone: "info",
  defaultStatus: "unread",
  dataSources: [
    {
      system: "NetSuite",
      query: "Invoice #4521",
      result: "$12,840 · status PAID · payment date Oct 18 2025",
      tone: "bg-cyan-600",
    },
    {
      system: "Tipalti",
      query: "ACH payment 8821",
      result: "Posted Oct 18 2025 · ref TXN-8821-2025",
      tone: "bg-violet-600",
    },
    {
      system: "JPMorgan Chase",
      query: "Outbound ACH confirmation",
      result: "Cleared Oct 19 2025 · funds released",
      tone: "bg-blue-700",
    },
    {
      system: "Vendor record",
      query: "Acme Industrial Supplies",
      result: "Active since 2021 · primary contact Sarah Chen",
      tone: "bg-emerald-600",
    },
  ],
  reasoningTrace: [
    "Invoice 4521 was paid 6 days ago via ACH; supplier likely hasn't reconciled yet.",
    "Standard ACH posting time is 1–3 business days — within normal range.",
    "Confirm payment with bank reference number and offer payment confirmation document.",
  ],
  draftedResponse: INQUIRY_1_RESPONSE,
  responseRecipient: "sarah.chen@acmeindustrial.com",
  auditEvents: [
    {
      offsetMs: 0,
      action: "Inbound email received",
      source: "AP inbox",
      reasoning: "Email parsed and queued for triage.",
    },
    {
      offsetMs: 412,
      action: "Classified as invoice status inquiry",
      source: "Neoflo classifier v3.4.1",
      reasoning: "Confidence 96%; routed to auto-resolve pipeline.",
    },
    {
      offsetMs: 1208,
      action: "NetSuite query — Invoice #4521",
      source: "NetSuite REST API",
      reasoning: "Fetched invoice record: $12,840, status PAID, payment date Oct 18 2025.",
    },
    {
      offsetMs: 2014,
      action: "Tipalti query — ACH payment 8821",
      source: "Tipalti payments API",
      reasoning: "Confirmed outbound ACH posted Oct 18 2025 with reference TXN-8821-2025.",
    },
    {
      offsetMs: 2845,
      action: "JPMorgan Chase confirmation lookup",
      source: "JPMorgan Access · ACH module",
      reasoning: "Funds cleared bank Oct 19 2025; no claw-back signals.",
    },
    {
      offsetMs: 3611,
      action: "Vendor record cross-check",
      source: "AcmeCo vendor master",
      reasoning: "Verified Sarah Chen is the active primary contact for Acme Industrial Supplies.",
    },
    {
      offsetMs: 4192,
      action: "Drafted response with bank reference",
      source: "Neoflo response generator",
      reasoning: "Composed reply citing only system-of-record facts; no generated content beyond template.",
    },
  ],
}

export const INQUIRY_2: InquirySeed = {
  id: "bank-change-pacific",
  supplier: "Pacific Distribution Co",
  supplierInitials: "PD",
  supplierTone: "bg-rose-100 text-rose-700",
  contactName: "Mark Reyes",
  contactEmail: "mark.reyes@pacificdist-finance.com",
  contactDomain: "pacificdist-finance.com",
  subject: "Update banking details — please send future payments to new account",
  body: `Hi AcmeCo AP,

Please update our banking details for all future payments. New routing: 121000358. New account: 9847-2210-554. This change is effective immediately for invoices going forward.

Let me know once the change is in your system.

Mark Reyes
Finance, Pacific Distribution`,
  receivedOffsetMinutes: minutes(3),
  classifierLabel: "Banking change request",
  classifierConfidence: 99,
  classifierTone: "danger",
  riskLabel: "HIGH RISK",
  defaultStatus: "unread",
  dataSources: [
    {
      system: "Vendor record",
      query: "Pacific Distribution Co",
      result: "Active since 2019 · primary domain pacificdist.com",
      tone: "bg-emerald-600",
    },
    {
      system: "Banking change history",
      query: "Last 24 months",
      result: "1 prior change · 14 months ago · verified in person",
      tone: "bg-cyan-600",
    },
    {
      system: "Domain integrity check",
      query: "Sender domain match",
      result: "MISMATCH · pacificdist-finance.com vs. pacificdist.com",
      tone: "bg-rose-600",
    },
    {
      system: "Vendor master contacts",
      query: "Authorized signers",
      result: "Mark Reyes not on file · no historical correspondence",
      tone: "bg-amber-600",
    },
  ],
  reasoningTrace: [
    "Banking change requests are the #1 vector for vendor fraud — $2.8B in losses last year.",
    "Sender domain pacificdist-finance.com does not match historical communications from pacificdist.com.",
    "Sender Mark Reyes is not on the vendor's authorized-signers list.",
    "Standard policy requires dual-factor verification before any banking change — queue for AP Director.",
  ],
  responseRecipient: "mark.reyes@pacificdist-finance.com",
  fraudSignals: [
    "Sender domain mismatch (pacificdist-finance.com ≠ pacificdist.com)",
    "Requestor not on authorized-signers list",
    "No prior correspondence from this email address",
    "Request urgency phrasing: 'effective immediately'",
  ],
  historicalCorrespondence: [
    {
      date: "2025-08-12",
      summary: "Q3 statement reconciliation — handled by Diana Park (diana@pacificdist.com).",
    },
    {
      date: "2025-04-30",
      summary: "Banking detail confirmation (existing) — Diana Park, verified by phone.",
    },
    {
      date: "2024-11-14",
      summary: "Onboarding contact update — primary signer set to Diana Park.",
    },
  ],
  verificationProtocol: [
    "Call Diana Park at the phone number on file (415-555-0148) — do not use any number from this email.",
    "Request written confirmation on Pacific Distribution letterhead, signed by an authorized signer.",
    "Independently verify the new routing number against the issuing bank's directory.",
    "Cross-check requestor identity against last-known org chart from vendor portal.",
    "Document verification outcome in vendor record before any payment is released.",
  ],
  auditEvents: [
    {
      offsetMs: 0,
      action: "Inbound email received",
      source: "AP inbox",
      reasoning: "Email parsed and queued for triage.",
    },
    {
      offsetMs: 388,
      action: "Classified as banking change request",
      source: "Neoflo classifier v3.4.1",
      reasoning: "Confidence 99%; risk level HIGH; routed to escalation pipeline (no auto-response permitted).",
    },
    {
      offsetMs: 1102,
      action: "Vendor record lookup — Pacific Distribution Co",
      source: "AcmeCo vendor master",
      reasoning: "Active vendor since 2019; primary domain pacificdist.com.",
    },
    {
      offsetMs: 1965,
      action: "Banking change history scan",
      source: "AcmeCo vendor master",
      reasoning: "1 prior change recorded 14 months ago with verified phone callback.",
    },
    {
      offsetMs: 2810,
      action: "Domain integrity check",
      source: "Neoflo fraud-signal engine",
      reasoning: "Sender domain pacificdist-finance.com does not match historical communications.",
    },
    {
      offsetMs: 3478,
      action: "Authorized-signers cross-check",
      source: "AcmeCo vendor master",
      reasoning: "Mark Reyes not on authorized-signers list for Pacific Distribution Co.",
    },
    {
      offsetMs: 3997,
      action: "Escalated to AP Director queue",
      source: "Neoflo orchestrator",
      reasoning: "Pre-built dual-factor verification protocol attached; no supplier response sent.",
    },
  ],
}

// Background filler — gives the inbox visual density. None are interactive.
const FILLER: InquirySeed[] = [
  {
    id: "f1",
    supplier: "Atlantic Logistics LLC",
    supplierInitials: "AL",
    supplierTone: "bg-blue-100 text-blue-700",
    contactName: "Joelle Bauman",
    contactEmail: "joelle@atlantic-logistics.com",
    contactDomain: "atlantic-logistics.com",
    subject: "Confirmation of payment for invoice 7782",
    body: `Hi AcmeCo,

Just looking to confirm payment receipt for invoice 7782 ($4,250.00) — our books show it as outstanding but I think we may have crossed wires. Could you send the remittance advice or confirm the payment date?

Thanks,
Joelle`,
    receivedOffsetMinutes: minutes(22),
    classifierLabel: "Payment confirmation",
    classifierConfidence: 98,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
    dataSources: [
      {
        system: "NetSuite",
        query: "Invoice #7782",
        result: "$4,250.00 · status PAID · payment date Apr 28 2026",
        tone: "bg-cyan-600",
      },
      {
        system: "Tipalti",
        query: "ACH payment 9134",
        result: "Posted Apr 28 2026 · ref TXN-9134-2026",
        tone: "bg-violet-600",
      },
      {
        system: "JPMorgan Chase",
        query: "Outbound ACH confirmation",
        result: "Cleared Apr 30 2026 · funds released",
        tone: "bg-blue-700",
      },
      {
        system: "Vendor record",
        query: "Atlantic Logistics LLC",
        result: "Active since 2020 · primary contact Joelle Bauman",
        tone: "bg-emerald-600",
      },
    ],
    reasoningTrace: [
      "Invoice 7782 was paid 8 days ago via ACH; vendor's books may be lagging behind.",
      "Standard ACH posting time is 1–3 business days — well within normal range.",
      "Confirm payment with bank reference number and offer to send remittance advice.",
    ],
    draftedResponse: `Hi Joelle, confirming invoice 7782 ($4,250.00) was paid on April 28 via ACH. Bank reference: TXN-9134-2026, cleared April 30. Remittance advice will hit your inbox automatically within the hour. Let me know if you need anything else.

— AcmeCo AP Team`,
    responseRecipient: "joelle@atlantic-logistics.com",
    auditEvents: [
      {
        offsetMs: 0,
        action: "Inbound email received",
        source: "AP inbox",
        reasoning: "Email parsed and queued for triage.",
      },
      {
        offsetMs: 391,
        action: "Classified as payment confirmation",
        source: "Neoflo classifier v3.4.1",
        reasoning: "Confidence 98%; routed to auto-resolve pipeline.",
      },
      {
        offsetMs: 1185,
        action: "NetSuite query — Invoice #7782",
        source: "NetSuite REST API",
        reasoning: "Fetched invoice record: $4,250.00, status PAID, payment date Apr 28 2026.",
      },
      {
        offsetMs: 1972,
        action: "Tipalti query — ACH payment 9134",
        source: "Tipalti payments API",
        reasoning: "Confirmed outbound ACH posted Apr 28 2026 with reference TXN-9134-2026.",
      },
      {
        offsetMs: 2784,
        action: "JPMorgan Chase confirmation lookup",
        source: "JPMorgan Access · ACH module",
        reasoning: "Funds cleared bank Apr 30 2026; no claw-back signals.",
      },
      {
        offsetMs: 3490,
        action: "Vendor record cross-check",
        source: "AcmeCo vendor master",
        reasoning: "Verified Joelle Bauman is the active primary contact for Atlantic Logistics LLC.",
      },
      {
        offsetMs: 4063,
        action: "Drafted response with bank reference and remittance trigger",
        source: "Neoflo response generator",
        reasoning: "Composed reply citing only system-of-record facts; remittance advice queued for delivery.",
      },
    ],
  },
  {
    id: "f2",
    supplier: "Westpoint Manufacturing",
    supplierInitials: "WM",
    supplierTone: "bg-violet-100 text-violet-700",
    contactName: "Rashida Khan",
    contactEmail: "ar@westpoint-mfg.com",
    contactDomain: "westpoint-mfg.com",
    subject: "Statement reconciliation — April 2026",
    body: "Statement attached for review.",
    receivedOffsetMinutes: minutes(41),
    classifierLabel: "Statement reconciliation",
    classifierConfidence: 91,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
  },
  {
    id: "f3",
    supplier: "Continental Hardware Group",
    supplierInitials: "CH",
    supplierTone: "bg-amber-100 text-amber-700",
    contactName: "Owen Kowalski",
    contactEmail: "billing@continentalhg.com",
    contactDomain: "continentalhg.com",
    subject: "Remittance advice for INV-2026-0312",
    body: "Could you send remittance advice?",
    receivedOffsetMinutes: hours(1.4),
    classifierLabel: "Remittance request",
    classifierConfidence: 95,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
  },
  {
    id: "f4",
    supplier: "Northstar Building Materials",
    supplierInitials: "NB",
    supplierTone: "bg-cyan-100 text-cyan-700",
    contactName: "Inez Whitaker",
    contactEmail: "ar.team@northstarbm.com",
    contactDomain: "northstarbm.com",
    subject: "Invoice 9911 — short payment of $214",
    body: "We received a payment short by $214 against invoice 9911.",
    receivedOffsetMinutes: hours(2.1),
    classifierLabel: "Short payment dispute",
    classifierConfidence: 84,
    classifierTone: "info",
    defaultStatus: "queued",
  },
  {
    id: "f5",
    supplier: "Pacific Maritime Services",
    supplierInitials: "PM",
    supplierTone: "bg-teal-100 text-teal-700",
    contactName: "Tomás Aguilar",
    contactEmail: "ar@pacmaritime.com",
    contactDomain: "pacmaritime.com",
    subject: "Status of invoice 6088",
    body: `Hi team,

Following up on invoice 6088 ($8,920.50) sent in mid-April. Could you confirm the status? Our finance lead is closing the month and wants to make sure nothing is hanging.

Best,
Tomás`,
    receivedOffsetMinutes: hours(3),
    classifierLabel: "Invoice status inquiry",
    classifierConfidence: 97,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
    dataSources: [
      {
        system: "NetSuite",
        query: "Invoice #6088",
        result: "$8,920.50 · status PAID · payment date May 1 2026",
        tone: "bg-cyan-600",
      },
      {
        system: "Tipalti",
        query: "ACH payment 9521",
        result: "Posted May 1 2026 · ref TXN-9521-2026",
        tone: "bg-violet-600",
      },
      {
        system: "JPMorgan Chase",
        query: "Outbound ACH confirmation",
        result: "Cleared May 2 2026 · funds released",
        tone: "bg-blue-700",
      },
      {
        system: "Vendor record",
        query: "Pacific Maritime Services",
        result: "Active since 2022 · primary contact Tomás Aguilar",
        tone: "bg-emerald-600",
      },
    ],
    reasoningTrace: [
      "Invoice 6088 was paid 5 days ago via ACH; vendor inquiry timing is consistent with month-end reconciliation.",
      "Standard ACH posting time is 1–3 business days; payment fully cleared the bank 4 days ago.",
      "Confirm payment with bank reference; offer remittance document for their close.",
    ],
    draftedResponse: `Hi Tomás, invoice 6088 ($8,920.50) was paid on May 1 via ACH. Bank reference: TXN-9521-2026, cleared May 2. I can email a formal remittance advice for your month-end close — just let me know.

— AcmeCo AP Team`,
    responseRecipient: "ar@pacmaritime.com",
    auditEvents: [
      {
        offsetMs: 0,
        action: "Inbound email received",
        source: "AP inbox",
        reasoning: "Email parsed and queued for triage.",
      },
      {
        offsetMs: 405,
        action: "Classified as invoice status inquiry",
        source: "Neoflo classifier v3.4.1",
        reasoning: "Confidence 97%; routed to auto-resolve pipeline.",
      },
      {
        offsetMs: 1218,
        action: "NetSuite query — Invoice #6088",
        source: "NetSuite REST API",
        reasoning: "Fetched invoice record: $8,920.50, status PAID, payment date May 1 2026.",
      },
      {
        offsetMs: 2024,
        action: "Tipalti query — ACH payment 9521",
        source: "Tipalti payments API",
        reasoning: "Confirmed outbound ACH posted May 1 2026 with reference TXN-9521-2026.",
      },
      {
        offsetMs: 2855,
        action: "JPMorgan Chase confirmation lookup",
        source: "JPMorgan Access · ACH module",
        reasoning: "Funds cleared bank May 2 2026; no claw-back signals.",
      },
      {
        offsetMs: 3621,
        action: "Vendor record cross-check",
        source: "AcmeCo vendor master",
        reasoning: "Verified Tomás Aguilar is the active primary contact for Pacific Maritime Services.",
      },
      {
        offsetMs: 4202,
        action: "Drafted response with bank reference",
        source: "Neoflo response generator",
        reasoning: "Composed reply citing only system-of-record facts; offered remittance document on request.",
      },
    ],
  },
  {
    id: "f6",
    supplier: "Cardinal Office Solutions",
    supplierInitials: "CO",
    supplierTone: "bg-rose-100 text-rose-700",
    contactName: "Priya Nair",
    contactEmail: "billing@cardinalos.com",
    contactDomain: "cardinalos.com",
    subject: "Payment date for May invoices",
    body: "When will the May batch be paid?",
    receivedOffsetMinutes: hours(4.2),
    classifierLabel: "Payment schedule",
    classifierConfidence: 94,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
  },
  {
    id: "f7",
    supplier: "Highland Industrial Coatings",
    supplierInitials: "HI",
    supplierTone: "bg-orange-100 text-orange-700",
    contactName: "Martin Schroeder",
    contactEmail: "ap@highland-coatings.de",
    contactDomain: "highland-coatings.de",
    subject: "VAT invoice correction request",
    body: "Need VAT line corrected.",
    receivedOffsetMinutes: hours(5.6),
    classifierLabel: "Invoice correction",
    classifierConfidence: 78,
    classifierTone: "info",
    defaultStatus: "queued",
  },
  {
    id: "f8",
    supplier: "Riverstone Engineering",
    supplierInitials: "RE",
    supplierTone: "bg-indigo-100 text-indigo-700",
    contactName: "Yui Tanaka",
    contactEmail: "ar@riverstone-eng.com",
    contactDomain: "riverstone-eng.com",
    subject: "Confirmation of receipt — INV-22041",
    body: `Hi AcmeCo,

Sent invoice INV-22041 ($2,140.00) on April 22 — could you confirm receipt and let me know when we should expect payment? Just want to make sure it didn't get caught in spam.

Thanks,
Yui`,
    receivedOffsetMinutes: hours(6.4),
    classifierLabel: "Receipt confirmation",
    classifierConfidence: 99,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
    dataSources: [
      {
        system: "AP inbox",
        query: "Search INV-22041",
        result: "Email received Apr 22 2026 · PDF attachment INV-22041.pdf parsed",
        tone: "bg-zinc-700",
      },
      {
        system: "NetSuite",
        query: "Invoice #22041",
        result: "$2,140.00 · status APPROVED · scheduled May 22 2026 (Net-30)",
        tone: "bg-cyan-600",
      },
      {
        system: "Tipalti",
        query: "Payment schedule",
        result: "Queued in May 22 batch · auto-release on due date",
        tone: "bg-violet-600",
      },
      {
        system: "Vendor record",
        query: "Riverstone Engineering",
        result: "Active since 2023 · payment terms Net-30 · primary contact Yui Tanaka",
        tone: "bg-emerald-600",
      },
    ],
    reasoningTrace: [
      "Invoice INV-22041 was received Apr 22 and successfully entered into NetSuite.",
      "Vendor terms are Net-30; payment is scheduled for May 22 in the next ACH batch.",
      "Confirm receipt and provide expected payment date so vendor can update their books.",
    ],
    draftedResponse: `Hi Yui, confirming we received INV-22041 ($2,140.00) on April 22 and it's already approved in our system. Per Net-30 terms, payment is scheduled for May 22 in our next ACH run. You'll receive remittance advice automatically once it's released.

— AcmeCo AP Team`,
    responseRecipient: "ar@riverstone-eng.com",
    auditEvents: [
      {
        offsetMs: 0,
        action: "Inbound email received",
        source: "AP inbox",
        reasoning: "Email parsed and queued for triage.",
      },
      {
        offsetMs: 372,
        action: "Classified as receipt confirmation",
        source: "Neoflo classifier v3.4.1",
        reasoning: "Confidence 99%; routed to auto-resolve pipeline.",
      },
      {
        offsetMs: 1095,
        action: "AP inbox search — INV-22041",
        source: "AcmeCo Mail API",
        reasoning: "Located prior email from Apr 22 2026 with PDF attachment; parsing log present.",
      },
      {
        offsetMs: 1881,
        action: "NetSuite query — Invoice #22041",
        source: "NetSuite REST API",
        reasoning: "Fetched invoice record: $2,140.00, status APPROVED, scheduled May 22 2026.",
      },
      {
        offsetMs: 2640,
        action: "Tipalti payment-schedule lookup",
        source: "Tipalti payments API",
        reasoning: "Confirmed invoice is queued in the May 22 ACH batch under Net-30 terms.",
      },
      {
        offsetMs: 3318,
        action: "Vendor record cross-check",
        source: "AcmeCo vendor master",
        reasoning: "Verified Yui Tanaka is the active primary contact and payment terms are Net-30.",
      },
      {
        offsetMs: 3902,
        action: "Drafted response confirming receipt and payment date",
        source: "Neoflo response generator",
        reasoning: "Composed reply citing only system-of-record facts; no generated content beyond template.",
      },
    ],
  },
  {
    id: "f9",
    supplier: "Lakefront Packaging Co.",
    supplierInitials: "LP",
    supplierTone: "bg-fuchsia-100 text-fuchsia-700",
    contactName: "Andre Beaumont",
    contactEmail: "ar.lakefront@lfpackaging.com",
    contactDomain: "lfpackaging.com",
    subject: "Updated W-9 attached",
    body: "New W-9 form attached.",
    receivedOffsetMinutes: hours(7.8),
    classifierLabel: "Document update",
    classifierConfidence: 96,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
  },
  {
    id: "f10",
    supplier: "Summit Calibration Labs",
    supplierInitials: "SC",
    supplierTone: "bg-lime-100 text-lime-700",
    contactName: "Ravi Subramanian",
    contactEmail: "billing@summitcal.com",
    contactDomain: "summitcal.com",
    subject: "Payment terms clarification",
    body: "Are we Net-30 or Net-45 going forward?",
    receivedOffsetMinutes: hours(9.1),
    classifierLabel: "Terms clarification",
    classifierConfidence: 92,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
  },
  {
    id: "f11",
    supplier: "Iron Ridge Equipment",
    supplierInitials: "IR",
    supplierTone: "bg-yellow-100 text-yellow-800",
    contactName: "Emma Liang",
    contactEmail: "ar@ironridgeeq.com",
    contactDomain: "ironridgeeq.com",
    subject: "Duplicate invoice — please void INV-77103",
    body: "We accidentally sent INV-77103 twice — please void the duplicate.",
    receivedOffsetMinutes: hours(11),
    classifierLabel: "Duplicate invoice",
    classifierConfidence: 88,
    classifierTone: "info",
    defaultStatus: "queued",
  },
  {
    id: "f12",
    supplier: "Coastline Electrical Supply",
    supplierInitials: "CE",
    supplierTone: "bg-sky-100 text-sky-700",
    contactName: "Hassan Mostafa",
    contactEmail: "billing@coastline-elec.com",
    contactDomain: "coastline-elec.com",
    subject: "Statement of account — Q1 2026",
    body: "Please find Q1 statement attached.",
    receivedOffsetMinutes: hours(13),
    classifierLabel: "Statement reconciliation",
    classifierConfidence: 93,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
  },
  {
    id: "f13",
    supplier: "Brookline Safety Equipment",
    supplierInitials: "BS",
    supplierTone: "bg-emerald-100 text-emerald-700",
    contactName: "Naomi Greer",
    contactEmail: "ar@brooklinesafety.com",
    contactDomain: "brooklinesafety.com",
    subject: "ETA on payment for invoices 88820, 88821",
    body: "Just checking ETA on the two invoices.",
    receivedOffsetMinutes: hours(15),
    classifierLabel: "Payment ETA",
    classifierConfidence: 97,
    classifierTone: "info",
    defaultStatus: "auto-resolved",
  },
]

export const ALL_INQUIRIES: InquirySeed[] = [INQUIRY_1, INQUIRY_2, ...FILLER]

export function getInquiry(id: string): InquirySeed | undefined {
  return ALL_INQUIRIES.find((i) => i.id === id)
}

// IDs of the two demo-critical inquiries that the store resets to "unread".
export const INTERACTIVE_INQUIRY_IDS = [INQUIRY_1.id, INQUIRY_2.id] as const

// Headline KPIs shown at the top of /demo.
export const DEMO_KPIS = {
  inquiriesThisMonth: 1247,
  autoResolvedPct: 73,
  avgResponseTimeSec: 28,
  activeSuppliers: 800,
} as const

// Integrations panel content. Active = currently productized; the rest are scoped post-M3.
export type IntegrationStatus = "active" | "coming"

export type IntegrationSeed = {
  name: string
  initials: string
  category: "AP system" | "Payments" | "Bank"
  group: "AP Systems" | "Payments" | "Banks"
  logoBg: string
  status: IntegrationStatus
  comingLabel?: string
}

export const INTEGRATIONS_SEED: IntegrationSeed[] = [
  {
    name: "Oracle NetSuite",
    initials: "NS",
    category: "AP system",
    group: "AP Systems",
    logoBg: "bg-cyan-600",
    status: "active",
  },
  {
    name: "Sage Intacct",
    initials: "SI",
    category: "AP system",
    group: "AP Systems",
    logoBg: "bg-emerald-600",
    status: "coming",
    comingLabel: "Coming Q1 2026",
  },
  {
    name: "QuickBooks Online",
    initials: "QB",
    category: "AP system",
    group: "AP Systems",
    logoBg: "bg-emerald-500",
    status: "coming",
    comingLabel: "Coming Q2 2026",
  },
  {
    name: "Microsoft Business Central",
    initials: "BC",
    category: "AP system",
    group: "AP Systems",
    logoBg: "bg-blue-700",
    status: "coming",
    comingLabel: "Coming Q2 2026",
  },
  {
    name: "Acumatica",
    initials: "Ac",
    category: "AP system",
    group: "AP Systems",
    logoBg: "bg-orange-500",
    status: "coming",
    comingLabel: "Coming Q3 2026",
  },
  {
    name: "Tipalti",
    initials: "Ti",
    category: "Payments",
    group: "Payments",
    logoBg: "bg-violet-600",
    status: "active",
  },
  {
    name: "Bill.com",
    initials: "Bc",
    category: "Payments",
    group: "Payments",
    logoBg: "bg-sky-600",
    status: "coming",
    comingLabel: "Coming Q1 2026",
  },
  {
    name: "Mercury",
    initials: "Mc",
    category: "Bank",
    group: "Banks",
    logoBg: "bg-zinc-800",
    status: "coming",
    comingLabel: "Coming Q2 2026",
  },
  {
    name: "JPMorgan Chase",
    initials: "JP",
    category: "Bank",
    group: "Banks",
    logoBg: "bg-blue-700",
    status: "active",
  },
  {
    name: "Bank of America",
    initials: "BA",
    category: "Bank",
    group: "Banks",
    logoBg: "bg-rose-700",
    status: "coming",
    comingLabel: "Coming Q3 2026",
  },
]
