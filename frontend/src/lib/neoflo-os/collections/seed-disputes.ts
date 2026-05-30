// 12 disputes for the Phase 1 collections demo.
//
// Source of truth: docs/handoff/collections/04-data-model.md § "seed-disputes.ts"
// + the Phase 1 plan Bundle C requirement.
//
// Status distribution (12 total):
//   evidence-pulled         : 1   (the hero — dispute-atlantic-9912)
//   investigating           : 5   (mid-flight, photos / docs awaited)
//   credit-memo-approved    : 3   (recently resolved in customer's favor)
//   resolved-refused        : 2   (Neo's evidence supported the original invoice)
//   resolved-paid           : 1   (customer agreed and paid)
//
// Aging varies 1-21 days.

import type { Dispute, DisputeId, CustomerId } from "./types"

export const SEED_DISPUTES: Dispute[] = [
  // ════════════════════════════════════════════════════════════════════
  // Hero dispute — verbatim from spec
  // ════════════════════════════════════════════════════════════════════
  {
    id: "dispute-atlantic-9912",
    customerId: "cust-atlantic-industrial",
    invoiceId: "inv-9912",
    invoiceNumber: "INV-9912",
    disputeAmount: 4200,
    reason: "QTY_SHORT_DELIVERED",
    reasonLabel: "Quantity short delivered",
    customerStatedReason:
      "Hi — we received 197 units of the industrial fasteners, not 200 as billed. Could you adjust the invoice?",
    filedAt: "2026-05-11T09:18:00Z",
    agingDays: 4,
    status: "evidence-pulled",
    evidence: {
      poId: "po-1208-atlantic",
      poRecord: {
        number: "PO-1208",
        quantity: 200,
        unitPrice: 21,
        approver: "Daniel Park",
        issuedAt: "2026-04-28",
      },
      grnId: "grn-3412-atlantic",
      grnRecord: {
        number: "GRN-3412",
        receivedQty: 197,
        verifiedBy: "warehouse mgr",
        receivedAt: "2026-05-04",
        condition: "good",
      },
      podId: "pod-3412",
      podRecord: {
        signedAt: "2026-05-04T14:18:00Z",
        signedBy: "warehouse mgr (Marcus Reilly)",
        carrierName: "Allied Freight",
        quantityDelivered: 197,
        condition: "good",
      },
      originalQuote: { unitPrice: 21, quantity: 200, total: 4200 },
      discrepancySummary: "200 invoiced, 197 delivered = 3-unit short",
    },
    recommendation: {
      action: "issue-credit-memo",
      confidence: 0.98,
      creditMemoAmount: 63,
      creditMemoReason: "QTY_SHORT_DELIVERED",
      reasoning:
        "All four evidence sources confirm 3-unit short. Original quote and PO match invoice price ($21/unit). GRN signed by warehouse mgr 197 units, POD signed by carrier 197 units. Customer is correct. Recommend credit memo + brief apology email (no further investigation needed).",
      sources: ["PO record", "GRN record", "POD record", "original quote"],
      draftedCreditMemo: {
        id: "CM-2026-0812",
        customerId: "cust-atlantic-industrial",
        linkedDisputeId: "dispute-atlantic-9912",
        linkedInvoiceId: "inv-9912",
        amount: 63,
        reason: "QTY_SHORT_DELIVERED",
        reasonLabel: "Quantity short delivered",
        accountingTreatment: "Debit Sales returns, Credit AR",
        approvalRequired: false,
        status: "draft",
      },
      draftedEmail: {
        to: "maria.gonzalez@atlantic-industrial.com",
        subject: "Credit memo for INV-9912",
        bodyMarkdown:
          "Hi Maria,\n\nYou're right — apologies for the discrepancy. The carrier POD confirms 197 units were delivered, not 200 as billed. We've issued credit memo CM-2026-0812 for $63 (3 units × $21), which will offset INV-9912.\n\nUpdated balance: $4,137. Pay link below.\n\nPay link: stripe.com/pay/atlantic-9912 (mock)\n\nThanks for the quick check,\nSasha",
      },
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // Investigating — 5 disputes mid-flight
  // ════════════════════════════════════════════════════════════════════

  // 2. Mariner Aerospace — price mismatch, mid-investigation
  {
    id: "dispute-mariner-7046",
    customerId: "cust-mariner-aerospace",
    invoiceId: "inv-mar-7046",
    invoiceNumber: "INV-MAR-7046",
    disputeAmount: 38800,
    reason: "PRICE_MISMATCH",
    reasonLabel: "Price mismatch vs quote",
    customerStatedReason:
      "Our PO references $385/unit per the master agreement renegotiation. Your invoice charges $412/unit — that's 7% over.",
    filedAt: "2026-05-08T11:42:00Z",
    agingDays: 7,
    status: "investigating",
    evidence: {
      poId: "po-aero-22311",
      poRecord: {
        number: "PO-22311",
        quantity: 100,
        unitPrice: 385,
        approver: "Linda Park",
        issuedAt: "2026-04-15",
      },
      originalQuote: { unitPrice: 385, quantity: 100, total: 38500 },
      discrepancySummary:
        "PO at $385/unit, invoice at $412/unit. Difference $2,700. Pending sales-rep validation of which price applies.",
    },
    recommendation: {
      action: "investigate-further",
      confidence: 0.6,
      reasoning:
        "PO and customer quote match at $385/unit, but invoice references the older $412/unit pricing. Need confirmation from sales rep whether the renegotiated rate took effect before this delivery.",
      sources: ["PO record", "customer email"],
    },
  },

  // 3. Cascade Chemicals — damage credit, photos requested
  {
    id: "dispute-cascade-5544",
    customerId: "cust-cascade-chemicals",
    invoiceId: "inv-cas-5544",
    invoiceNumber: "INV-CAS-5544",
    disputeAmount: 16400,
    reason: "DAMAGED_ON_ARRIVAL",
    reasonLabel: "Damaged on arrival",
    customerStatedReason:
      "Two of the four totes arrived leaking. We're requesting a 50% credit on the damaged units pending photos.",
    filedAt: "2026-05-06T08:20:00Z",
    agingDays: 9,
    status: "investigating",
    evidence: {
      grnId: "grn-7700-cas",
      grnRecord: {
        number: "GRN-7700",
        receivedQty: 4,
        verifiedBy: "warehouse mgr",
        receivedAt: "2026-04-30",
        condition: "partial",
      },
      discrepancySummary: "GRN flagged 2 totes as damaged on arrival. Photos requested from customer to verify damage extent.",
    },
    recommendation: {
      action: "investigate-further",
      confidence: 0.55,
      reasoning:
        "GRN supports 'damaged on arrival' claim, but cost-of-replacement requires photo evidence. Awaiting customer's damage photos.",
      sources: ["GRN record"],
    },
  },

  // 4. Greatlakes Distribution — pricing error, awaiting sales validation
  {
    id: "dispute-greatlakes-7700",
    customerId: "cust-greatlakes-distribution",
    invoiceId: "inv-glk-7700",
    invoiceNumber: "INV-GLK-7700",
    disputeAmount: 26800,
    reason: "PRICE_MISMATCH",
    reasonLabel: "Price mismatch vs quote",
    customerStatedReason:
      "We agreed on volume-tier 2 pricing on the May contract amendment ($12.40/unit, not $13.20/unit).",
    filedAt: "2026-05-04T15:30:00Z",
    agingDays: 11,
    status: "investigating",
    evidence: {
      originalQuote: { unitPrice: 12.4, quantity: 2000, total: 24800 },
      discrepancySummary: "Customer quote at $12.40, invoice at $13.20. Pending sales rep confirmation on volume-tier eligibility.",
    },
    recommendation: {
      action: "investigate-further",
      confidence: 0.5,
      reasoning:
        "Customer's stated quote terms align with the contract amendment on file. Need rep confirmation the May volume threshold was met before invoicing.",
      sources: ["customer email", "contract amendment file"],
    },
  },

  // 5. Foggy Harbor Shipping — carrier surcharge dispute
  {
    id: "dispute-foggyharbor-9988",
    customerId: "cust-foggyharbor-shipping",
    invoiceId: "inv-fog-9988",
    invoiceNumber: "INV-FOG-9988",
    disputeAmount: 18900,
    reason: "UNCLEAR_DEDUCTION",
    reasonLabel: "Unclear deduction taken",
    customerStatedReason:
      "Your invoice includes a $1,800 carrier surcharge that wasn't on our quote. Please remove or explain.",
    filedAt: "2026-04-28T10:00:00Z",
    agingDays: 17,
    status: "evidence-pulled",
    evidence: {
      originalQuote: { unitPrice: 0, quantity: 1, total: 17100 },
      discrepancySummary:
        "Customer quote had no fuel surcharge line. Invoice added $1,800. Fuel-surcharge clause in master MSA §6 supports the line item but customer disputes its application.",
    },
    recommendation: {
      action: "refuse-with-evidence",
      confidence: 0.75,
      reasoning:
        "MSA §6 explicitly allows fuel-surcharge pass-through when carrier fuel index exceeds threshold. Index records show the threshold was crossed Apr 12. Recommend respectful refusal with MSA citation.",
      sources: ["MSA §6", "fuel index records"],
    },
  },

  // 6. Tidemark Supply — wrong-item delivery, POD pulled
  {
    id: "dispute-tidemark-5577",
    customerId: "cust-tidemark-supply",
    invoiceId: "inv-tdm-5577",
    invoiceNumber: "INV-TDM-5577",
    disputeAmount: 14200,
    reason: "WRONG_ITEM_DELIVERED",
    reasonLabel: "Wrong item delivered",
    customerStatedReason:
      "We ordered 10 cases of SKU-A55 but received SKU-A45 instead. Please credit the full $14,200 — we can't use these.",
    filedAt: "2026-05-01T13:40:00Z",
    agingDays: 14,
    status: "investigating",
    evidence: {
      poId: "po-tdm-9911",
      poRecord: {
        number: "PO-TDM-9911",
        quantity: 10,
        unitPrice: 1420,
        approver: "Yuki Tanaka",
        issuedAt: "2026-04-18",
      },
      podId: "pod-tdm-5577",
      podRecord: {
        signedAt: "2026-04-26T11:00:00Z",
        signedBy: "Marisol Trent",
        carrierName: "Pacific Carrier",
        quantityDelivered: 10,
        condition: "good",
      },
      discrepancySummary:
        "PO lists SKU-A55 (industrial fittings); POD lists SKU-A45 (residential fittings). Wrong SKU shipped — warehouse pick error.",
    },
    recommendation: {
      action: "issue-credit-memo",
      confidence: 0.93,
      creditMemoAmount: 14200,
      creditMemoReason: "WRONG_ITEM_DELIVERED",
      reasoning:
        "PO + POD confirm wrong SKU shipped. Recommend full credit memo + arrange return pickup + reorder correct SKU at zero cost.",
      sources: ["PO record", "POD record"],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // Credit-memo-approved — 3 recently resolved in customer's favor
  // ════════════════════════════════════════════════════════════════════

  // 7. Northstar Energy — small short-ship, credit issued
  {
    id: "dispute-northstar-7001",
    customerId: "cust-northstar-energy",
    invoiceId: "inv-nst-6077",
    invoiceNumber: "INV-NST-6077",
    disputeAmount: 8200,
    reason: "QTY_SHORT_DELIVERED",
    reasonLabel: "Quantity short delivered",
    customerStatedReason:
      "Received 47 barrels, not 50. Please adjust.",
    filedAt: "2026-04-30T09:00:00Z",
    agingDays: 15,
    status: "credit-memo-approved",
    evidence: {
      grnId: "grn-nst-2299",
      grnRecord: {
        number: "GRN-2299",
        receivedQty: 47,
        verifiedBy: "Daniel Wilcox",
        receivedAt: "2026-04-26",
        condition: "good",
      },
      podId: "pod-nst-2299",
      podRecord: {
        signedAt: "2026-04-26T08:30:00Z",
        signedBy: "Daniel Wilcox",
        carrierName: "BlueRoad Trucking",
        quantityDelivered: 47,
        condition: "good",
      },
      originalQuote: { unitPrice: 164, quantity: 50, total: 8200 },
      discrepancySummary: "50 invoiced, 47 delivered = 3 barrels short.",
    },
    recommendation: {
      action: "issue-credit-memo",
      confidence: 0.99,
      creditMemoAmount: 492,
      creditMemoReason: "QTY_SHORT_DELIVERED",
      reasoning: "GRN + POD both confirm 47 barrels. Credit memo issued and applied.",
      sources: ["GRN record", "POD record"],
      draftedCreditMemo: {
        id: "CM-2026-0788",
        customerId: "cust-northstar-energy",
        linkedDisputeId: "dispute-northstar-7001",
        linkedInvoiceId: "inv-nst-6077",
        amount: 492,
        reason: "QTY_SHORT_DELIVERED",
        reasonLabel: "Quantity short delivered",
        accountingTreatment: "Debit Sales returns, Credit AR",
        approvalRequired: false,
        status: "approved",
        approvedAt: "2026-05-02T14:20:00Z",
      },
    },
  },

  // 8. Driftwood Hospitality — pricing error, credit issued
  {
    id: "dispute-driftwood-1414",
    customerId: "cust-driftwood-hospitality",
    invoiceId: "inv-drf-1414",
    invoiceNumber: "INV-DRF-1414",
    disputeAmount: 22400,
    reason: "PRICE_MISMATCH",
    reasonLabel: "Price mismatch vs quote",
    customerStatedReason: "Your invoice charged us list, but our master agreement is at -10%.",
    filedAt: "2026-04-25T16:45:00Z",
    agingDays: 20,
    status: "credit-memo-approved",
    evidence: {
      originalQuote: { unitPrice: 0, quantity: 1, total: 20160 },
      discrepancySummary:
        "Master agreement -10% wasn't applied. Invoice $22,400, should have been $20,160. Credit $2,240 issued.",
    },
    recommendation: {
      action: "issue-credit-memo",
      confidence: 0.97,
      creditMemoAmount: 2240,
      creditMemoReason: "PRICE_MISMATCH",
      reasoning: "Master-agreement discount missed on invoice line. Credit memo issued and applied.",
      sources: ["master agreement file"],
      draftedCreditMemo: {
        id: "CM-2026-0795",
        customerId: "cust-driftwood-hospitality",
        linkedDisputeId: "dispute-driftwood-1414",
        linkedInvoiceId: "inv-drf-1414",
        amount: 2240,
        reason: "PRICE_MISMATCH",
        reasonLabel: "Price mismatch vs quote",
        accountingTreatment: "Debit Sales returns, Credit AR",
        approvalRequired: true,
        status: "approved",
        approvedAt: "2026-04-28T10:18:00Z",
      },
    },
  },

  // 9. Cypress Pharma — small freight credit, approved
  {
    id: "dispute-cypress-6006",
    customerId: "cust-cypress-pharma",
    invoiceId: "inv-cyp-6006",
    invoiceNumber: "INV-CYP-6006",
    disputeAmount: 34800,
    reason: "LATE_DELIVERY_CREDIT",
    reasonLabel: "Late-delivery credit per contract",
    customerStatedReason:
      "Per §9 of our SLA, late deliveries (>3 business days) earn 5% credit. This one was 5 days late.",
    filedAt: "2026-04-22T11:00:00Z",
    agingDays: 21,
    status: "credit-memo-approved",
    evidence: {
      podRecord: {
        signedAt: "2026-04-21T13:00:00Z",
        signedBy: "Eleanor Babcock",
        carrierName: "Allied Freight",
        quantityDelivered: 1,
        condition: "good",
      },
      discrepancySummary:
        "Required delivery Apr 14, actual Apr 21 — 5 business days late. SLA §9 triggers 5% credit ($1,740).",
    },
    recommendation: {
      action: "issue-credit-memo",
      confidence: 0.96,
      creditMemoAmount: 1740,
      creditMemoReason: "LATE_DELIVERY_CREDIT",
      reasoning: "POD confirms delivery date. SLA §9 5% credit triggered. Issued and applied.",
      sources: ["POD record", "SLA §9"],
      draftedCreditMemo: {
        id: "CM-2026-0801",
        customerId: "cust-cypress-pharma",
        linkedDisputeId: "dispute-cypress-6006",
        linkedInvoiceId: "inv-cyp-6006",
        amount: 1740,
        reason: "LATE_DELIVERY_CREDIT",
        reasonLabel: "Late-delivery credit per contract",
        accountingTreatment: "Debit Sales returns, Credit AR",
        approvalRequired: false,
        status: "approved",
        approvedAt: "2026-04-24T09:40:00Z",
      },
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // Resolved-refused — 2 where Neo's evidence supported the original invoice
  // ════════════════════════════════════════════════════════════════════

  // 10. Stonebridge Construction — claimed short-ship; POD says full
  {
    id: "dispute-stonebridge-6011",
    customerId: "cust-stonebridge-construction",
    invoiceId: "inv-stb-6011",
    invoiceNumber: "INV-STB-6011",
    disputeAmount: 28200,
    reason: "QTY_SHORT_DELIVERED",
    reasonLabel: "Quantity short delivered",
    customerStatedReason: "We're only seeing 18 of the 20 expected pallets — please credit the difference.",
    filedAt: "2026-04-26T14:00:00Z",
    agingDays: 19,
    status: "resolved-refused",
    evidence: {
      grnId: "grn-stb-1188",
      grnRecord: {
        number: "GRN-1188",
        receivedQty: 20,
        verifiedBy: "Site Foreman",
        receivedAt: "2026-04-20",
        condition: "good",
      },
      podId: "pod-stb-1188",
      podRecord: {
        signedAt: "2026-04-20T09:15:00Z",
        signedBy: "Gabriela Mendez (site foreman)",
        carrierName: "BlueRoad Trucking",
        quantityDelivered: 20,
        condition: "good",
      },
      discrepancySummary: "GRN and POD both signed for 20 pallets, signed by customer's own foreman. No discrepancy in our records.",
    },
    recommendation: {
      action: "refuse-with-evidence",
      confidence: 0.94,
      reasoning:
        "POD and GRN both signed by customer's site foreman for 20 pallets. Discrepancy is internal to customer (possibly site theft or mis-count). Recommend respectful refusal with copies of POD and GRN attached.",
      sources: ["GRN record", "POD record"],
    },
  },

  // 11. Sundown Printing — no-POD claim, POD found
  {
    id: "dispute-sundown-7711",
    customerId: "cust-sundown-printing",
    invoiceId: "inv-snd-7711",
    invoiceNumber: "INV-SND-7711",
    disputeAmount: 8500,
    reason: "NO_POD_AVAILABLE",
    reasonLabel: "No proof of delivery on file",
    customerStatedReason: "We can't find any POD for this — please send proof or remove the invoice.",
    filedAt: "2026-04-20T08:30:00Z",
    agingDays: 25,
    status: "resolved-refused",
    evidence: {
      podId: "pod-snd-9088",
      podRecord: {
        signedAt: "2026-02-08T11:18:00Z",
        signedBy: "Receiving Clerk",
        carrierName: "Allied Freight",
        quantityDelivered: 1,
        condition: "good",
      },
      discrepancySummary: "POD on file in our archive, signed by customer's receiving clerk. Forwarded copy to customer.",
    },
    recommendation: {
      action: "refuse-with-evidence",
      confidence: 0.95,
      reasoning: "POD exists, signed by customer's receiving clerk. Forwarded copy + signed timestamp. Invoice stands.",
      sources: ["POD record"],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // Resolved-paid — 1 customer agreed and paid the original invoice
  // ════════════════════════════════════════════════════════════════════

  // 12. Bristol Printing — disputed then accepted
  {
    id: "dispute-bristol-2222",
    customerId: "cust-bristol-printing",
    invoiceId: "inv-brp-2222",
    invoiceNumber: "INV-BRP-2222",
    disputeAmount: 6800,
    reason: "CUSTOMER_DISPUTES_AGREEMENT",
    reasonLabel: "Customer disputes agreement terms",
    customerStatedReason: "We thought this job was on net-45, not net-30.",
    filedAt: "2026-05-14T10:00:00Z",
    agingDays: 1,
    status: "resolved-paid",
    evidence: {
      discrepancySummary:
        "Contract clearly states Net-30 for printing-job line items. Customer confirmed after Sasha shared the contract copy. Customer paid in full.",
    },
    recommendation: {
      action: "refuse-with-evidence",
      confidence: 0.99,
      reasoning: "Customer accepted the contract terms after seeing the citation. Invoice paid same-day.",
      sources: ["MSA §3"],
    },
  },
]

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

const DISPUTE_INDEX: Map<DisputeId, Dispute> = new Map(SEED_DISPUTES.map((d) => [d.id, d]))

export function getDispute(id: DisputeId): Dispute | undefined {
  return DISPUTE_INDEX.get(id)
}

export function getDisputesByCustomer(customerId: CustomerId): Dispute[] {
  return SEED_DISPUTES.filter((d) => d.customerId === customerId)
}
