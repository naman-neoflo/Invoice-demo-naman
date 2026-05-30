// 60 fictional Goods Receipt Notes for the invoice-processing demo. One per
// "receivable" PO; freight/logistics POs intentionally omit a GRN (so the
// missing-GRN exception has signal). Pure-knowledge service POs (SaaS,
// insurance, legal hours, consulting retainers, IT managed services,
// staffing hours, utility metered) also have no GRN — the agreement is the
// service confirmation in those cases.
//
// Source of truth: docs/handoff/invoice-processing/04-data-model.md
//   § "Static seed shape" > "seed-grns.ts".
//
// Hero GRNs (do NOT edit copy without also updating 05-demo-script.md):
//   - grn-441       Linked to po-1389 (Acme cleaning May 2026, service confirmation)
//   - grn-aclng-q2  Linked to po-1422 (Acme deep-clean Q2 2026, original — paid Apr 18)
//
// Intentionally missing GRNs (the 6 freight/logistics POs):
//   - po-1314  Pacific Logistics  (hero missing-GRN exception)
//   - po-1442  Pacific Logistics
//   - po-1331  Tri-State Freight
//   - po-1364  Harborline Shipping
//   - po-1473  Changi Freight Forwarders
//   - po-1469  London Couriers
//
// Service POs without GRN (knowledge / metered):
//   po-1370 / po-1281  Summit IT managed services
//   po-1382 / po-1232  Clearwater Utilities
//   po-1413            Cornerstone Legal hours
//   po-1198            Keystone SaaS subscription
//   po-1372 / po-1438 / po-1465  Rosehill Staffing hours
//   po-1380 / po-1444  Silverbrook Consulting engagements
//   po-1233            Blackford Insurance premium
//   po-1394            Raffles Legal hours
//   po-1463            Marina IT MS365 licences

import type { GoodsReceiptNote, GoodsReceiptNoteId, PurchaseOrderId } from "./types"

export const SEED_GRNS: GoodsReceiptNote[] = [
  // ── Hero GRNs ──────────────────────────────────────────────────────────
  {
    id: "grn-441",
    grnNumber: "GRN-441",
    poId: "po-1389",
    vendorId: "vendor-aclng-001",
    receivedAt: "2026-05-31T18:00:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-05-31T18:14:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-05-01", end: "2026-05-31" },
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "good",
        notes: "Service performed as scheduled across 4 weekly visits.",
      },
    ],
  },
  {
    id: "grn-aclng-q2",
    grnNumber: "GRN-Q2-ACLNG",
    poId: "po-1422",
    vendorId: "vendor-aclng-001",
    receivedAt: "2026-04-15T17:30:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-04-15T17:42:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-04-01", end: "2026-04-15" },
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "good",
        notes: "Q2 deep-clean Plant A completed Apr 6–10.",
      },
      {
        lineNumber: 2,
        poLineNumber: 2,
        quantityReceived: 1,
        condition: "good",
        notes: "Q2 deep-clean Plant B completed Apr 13–15 (verified by Plant B mgr Tom Klein).",
      },
      {
        lineNumber: 3,
        poLineNumber: 3,
        quantityReceived: 1,
        condition: "good",
        notes: "Industrial vacuum returned in working order on Apr 15.",
      },
    ],
  },

  // ── Acme Cleaning recurring monthly service confirmations ─────────────
  {
    id: "grn-432",
    grnNumber: "GRN-432",
    poId: "po-1311",
    vendorId: "vendor-aclng-001",
    receivedAt: "2026-04-30T18:00:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-04-30T18:08:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-04-01", end: "2026-04-30" },
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "good",
        notes: "Service performed as scheduled across 4 weekly visits.",
      },
    ],
  },
  {
    id: "grn-411",
    grnNumber: "GRN-411",
    poId: "po-1248",
    vendorId: "vendor-aclng-001",
    receivedAt: "2026-03-31T18:00:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-03-31T18:11:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-03-01", end: "2026-03-31" },
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "good",
        notes: "Service performed as scheduled across 5 weekly visits.",
      },
    ],
  },
  {
    id: "grn-468",
    grnNumber: "GRN-468",
    poId: "po-1477",
    vendorId: "vendor-aclng-001",
    receivedAt: "2026-05-14T16:30:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-05-14T16:38:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-06-01", end: "2026-06-30" },
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "good",
        notes: "Pre-paid June service; PO confirmed received and scheduled.",
      },
    ],
  },

  // ── Singapore Stationery (goods) ──────────────────────────────────────
  {
    id: "grn-460",
    grnNumber: "GRN-460",
    poId: "po-1462",
    vendorId: "vendor-sgs-001",
    receivedAt: "2026-05-13T08:30:00Z",
    verifiedBy: "Singapore office mgr (Geraldine Lim)",
    verifiedAt: "2026-05-13T08:52:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 50, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 12, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 1, condition: "good" },
    ],
  },
  {
    id: "grn-405",
    grnNumber: "GRN-405",
    poId: "po-1398",
    vendorId: "vendor-sgs-001",
    receivedAt: "2026-04-12T08:30:00Z",
    verifiedBy: "Singapore office mgr (Geraldine Lim)",
    verifiedAt: "2026-04-12T08:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 5, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good" },
    ],
  },

  // ── Northeast Industrial (goods) ──────────────────────────────────────
  {
    id: "grn-208",
    grnNumber: "GRN-208",
    poId: "po-1208",
    vendorId: "vendor-northeast-001",
    receivedAt: "2026-05-10T15:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-10T15:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 200, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 150, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 320, condition: "good" },
      { lineNumber: 4, poLineNumber: 4, quantityReceived: 375, condition: "good" },
      { lineNumber: 5, poLineNumber: 5, quantityReceived: 1200, condition: "good" },
      { lineNumber: 6, poLineNumber: 6, quantityReceived: 350, condition: "good" },
    ],
  },
  {
    id: "grn-355",
    grnNumber: "GRN-355",
    poId: "po-1351",
    vendorId: "vendor-northeast-001",
    receivedAt: "2026-04-15T14:00:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-04-15T14:18:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 60, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 80, condition: "good" },
    ],
  },

  // (No GRN for po-1314 — Pacific Logistics — hero missing-GRN exception)
  // (No GRN for po-1442 — Pacific Logistics inbound)
  // ── Pacific Logistics — outbound freight (closed, has GRN) ────────────
  {
    id: "grn-282",
    grnNumber: "GRN-282",
    poId: "po-1278",
    vendorId: "vendor-pacific-logistics-001",
    receivedAt: "2026-04-02T16:30:00Z",
    verifiedBy: "Logistics coordinator (Aiden Park)",
    verifiedAt: "2026-04-02T16:42:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-03-20", end: "2026-04-02" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 8, condition: "good", notes: "All 8 shipments confirmed delivered." },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good" },
    ],
  },

  // ── Westpoint Marketing ───────────────────────────────────────────────
  {
    id: "grn-435",
    grnNumber: "GRN-435",
    poId: "po-1431",
    vendorId: "vendor-westpoint-mkt-001",
    receivedAt: "2026-05-12T17:00:00Z",
    verifiedBy: "Marketing mgr (Lena Cho)",
    verifiedAt: "2026-05-12T17:14:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-05-01", end: "2026-05-12" },
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "good",
        notes: "May campaign assets delivered (mix of digital + event materials).",
      },
    ],
  },
  {
    id: "grn-481",
    grnNumber: "GRN-481",
    poId: "po-1479",
    vendorId: "vendor-westpoint-mkt-001",
    receivedAt: "2026-05-14T15:00:00Z",
    verifiedBy: "Marketing mgr (Lena Cho)",
    verifiedAt: "2026-05-14T15:14:00Z",
    isServiceConfirmation: true,
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "good",
        notes: "Trade show booth design and assets delivered for review.",
      },
    ],
  },

  // ── Atlantic Industrial (goods) ───────────────────────────────────────
  {
    id: "grn-457",
    grnNumber: "GRN-457",
    poId: "po-1455",
    vendorId: "vendor-atlantic-001",
    receivedAt: "2026-05-09T15:00:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-09T15:22:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 400, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 100, condition: "good" },
    ],
  },
  {
    id: "grn-345",
    grnNumber: "GRN-345",
    poId: "po-1342",
    vendorId: "vendor-atlantic-001",
    receivedAt: "2026-03-28T14:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-03-28T14:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 20, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 50, condition: "good" },
    ],
  },
  {
    id: "grn-485",
    grnNumber: "GRN-485",
    poId: "po-1483",
    vendorId: "vendor-atlantic-001",
    receivedAt: "2026-05-30T15:00:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-30T15:18:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 200, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 6, condition: "good" },
    ],
  },

  // ── Pacific Distribution (goods) ──────────────────────────────────────
  {
    id: "grn-379",
    grnNumber: "GRN-379",
    poId: "po-1376",
    vendorId: "vendor-pacific-dist-001",
    receivedAt: "2026-05-12T14:00:00Z",
    verifiedBy: "Warehouse mgr (Hugo Lambert)",
    verifiedAt: "2026-05-12T14:24:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 12, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 40, condition: "good" },
    ],
  },
  {
    id: "grn-292",
    grnNumber: "GRN-292",
    poId: "po-1289",
    vendorId: "vendor-pacific-dist-001",
    receivedAt: "2026-03-30T13:30:00Z",
    verifiedBy: "Warehouse mgr (Hugo Lambert)",
    verifiedAt: "2026-03-30T13:52:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 24, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 60, condition: "good" },
    ],
  },
  {
    id: "grn-484",
    grnNumber: "GRN-484",
    poId: "po-1481",
    vendorId: "vendor-pacific-dist-001",
    receivedAt: "2026-06-04T14:00:00Z",
    verifiedBy: "Warehouse mgr (Hugo Lambert)",
    verifiedAt: "2026-06-04T14:18:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 80, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good" },
    ],
  },

  // ── Blue Peak Materials (goods) ───────────────────────────────────────
  {
    id: "grn-271",
    grnNumber: "GRN-271",
    poId: "po-1267",
    vendorId: "vendor-bluepeak-001",
    receivedAt: "2026-03-28T15:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-03-28T15:50:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 100, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 30, condition: "good" },
    ],
  },
  {
    id: "grn-413",
    grnNumber: "GRN-413",
    poId: "po-1408",
    vendorId: "vendor-bluepeak-001",
    receivedAt: "2026-05-08T15:00:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-08T15:22:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 500, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 75, condition: "good" },
    ],
  },
  {
    id: "grn-441b",
    grnNumber: "GRN-441b",
    poId: "po-1437",
    vendorId: "vendor-bluepeak-001",
    receivedAt: "2026-05-18T15:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-18T15:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 30, condition: "good" },
    ],
  },

  // ── Meridian Power Systems (goods + install) ──────────────────────────
  {
    id: "grn-298",
    grnNumber: "GRN-298",
    poId: "po-1295",
    vendorId: "vendor-meridian-001",
    receivedAt: "2026-04-18T14:30:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-04-18T15:42:00Z",
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "good",
        notes: "Generator delivered and staged on pad.",
      },
      {
        lineNumber: 2,
        poLineNumber: 2,
        quantityReceived: 1,
        condition: "good",
        notes: "Commissioning completed; load test passed.",
      },
    ],
  },
  {
    id: "grn-450",
    grnNumber: "GRN-450",
    poId: "po-1448",
    vendorId: "vendor-meridian-001",
    receivedAt: "2026-06-10T15:00:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-06-10T15:30:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "Switchgear installed and energized." },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good", notes: "Annual maintenance contract activated." },
    ],
  },

  // ── Cascade Office Solutions (goods) ──────────────────────────────────
  {
    id: "grn-326",
    grnNumber: "GRN-326",
    poId: "po-1322",
    vendorId: "vendor-cascade-001",
    receivedAt: "2026-04-10T14:30:00Z",
    verifiedBy: "Office admin (Riya Sharma)",
    verifiedAt: "2026-04-10T14:42:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 20, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 6, condition: "good" },
    ],
  },
  {
    id: "grn-422",
    grnNumber: "GRN-422",
    poId: "po-1419",
    vendorId: "vendor-cascade-001",
    receivedAt: "2026-05-08T15:30:00Z",
    verifiedBy: "Office admin (Riya Sharma)",
    verifiedAt: "2026-05-08T15:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 4, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 6, condition: "good" },
    ],
  },
  {
    id: "grn-471",
    grnNumber: "GRN-471",
    poId: "po-1467",
    vendorId: "vendor-cascade-001",
    receivedAt: "2026-05-20T15:00:00Z",
    verifiedBy: "Office admin (Riya Sharma)",
    verifiedAt: "2026-05-20T15:14:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 3, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 2, condition: "good" },
    ],
  },

  // ── Ironbridge Machining (goods) ──────────────────────────────────────
  {
    id: "grn-360",
    grnNumber: "GRN-360",
    poId: "po-1356",
    vendorId: "vendor-ironbridge-001",
    receivedAt: "2026-04-22T14:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-04-22T15:08:00Z",
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 35,
        condition: "good",
        notes: "All housings inspected against drawing IB-2114; passed.",
      },
    ],
  },
  {
    id: "grn-432b",
    grnNumber: "GRN-432b",
    poId: "po-1429",
    vendorId: "vendor-ironbridge-001",
    receivedAt: "2026-06-04T14:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-06-04T14:54:00Z",
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 50,
        condition: "good",
        notes: "Shafts measured to spec; runout within tolerance.",
      },
    ],
  },

  // ── Greenfield Packaging (goods) ──────────────────────────────────────
  {
    id: "grn-307",
    grnNumber: "GRN-307",
    poId: "po-1303",
    vendorId: "vendor-greenfield-pkg-001",
    receivedAt: "2026-04-02T13:30:00Z",
    verifiedBy: "Warehouse mgr (Hugo Lambert)",
    verifiedAt: "2026-04-02T13:52:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 30, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 40, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 1, condition: "good" },
    ],
  },
  {
    id: "grn-414",
    grnNumber: "GRN-414",
    poId: "po-1411",
    vendorId: "vendor-greenfield-pkg-001",
    receivedAt: "2026-05-15T13:00:00Z",
    verifiedBy: "Warehouse mgr (Hugo Lambert)",
    verifiedAt: "2026-05-15T13:22:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 60, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 500, condition: "good" },
    ],
  },

  // ── Tri-State Freight: po-1331 has NO GRN (intentional)
  // ── Tri-State Freight: po-1453 (closed, has GRN)
  {
    id: "grn-456",
    grnNumber: "GRN-456",
    poId: "po-1453",
    vendorId: "vendor-tristate-freight-001",
    receivedAt: "2026-05-08T14:00:00Z",
    verifiedBy: "Logistics coordinator (Aiden Park)",
    verifiedAt: "2026-05-08T14:14:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-05-02", end: "2026-05-08" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "Atlanta DC delivery confirmed." },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 8, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 1, condition: "good" },
    ],
  },

  // ── Redwood Janitorial (goods) ────────────────────────────────────────
  {
    id: "grn-290",
    grnNumber: "GRN-290",
    poId: "po-1287",
    vendorId: "vendor-redwood-jntr-001",
    receivedAt: "2026-03-22T14:30:00Z",
    verifiedBy: "Office admin (Riya Sharma)",
    verifiedAt: "2026-03-22T14:42:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good" },
    ],
  },
  {
    id: "grn-428",
    grnNumber: "GRN-428",
    poId: "po-1425",
    vendorId: "vendor-redwood-jntr-001",
    receivedAt: "2026-05-12T14:30:00Z",
    verifiedBy: "Office admin (Riya Sharma)",
    verifiedAt: "2026-05-12T14:42:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 12, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 6, condition: "good" },
    ],
  },

  // ── Coastal Print (goods) ─────────────────────────────────────────────
  {
    id: "grn-340",
    grnNumber: "GRN-340",
    poId: "po-1338",
    vendorId: "vendor-coastal-print-001",
    receivedAt: "2026-04-18T14:00:00Z",
    verifiedBy: "Marketing mgr (Lena Cho)",
    verifiedAt: "2026-04-18T14:18:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 4, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 6, condition: "good" },
    ],
  },

  // ── East River Chemical (goods) ───────────────────────────────────────
  {
    id: "grn-321",
    grnNumber: "GRN-321",
    poId: "po-1318",
    vendorId: "vendor-eastriver-chem-001",
    receivedAt: "2026-04-15T14:30:00Z",
    verifiedBy: "Lab safety officer (Marcus Patel)",
    verifiedAt: "2026-04-15T15:08:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 8, condition: "good", notes: "Hazmat manifest verified; drums sealed." },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 1, condition: "good" },
    ],
  },
  {
    id: "grn-453",
    grnNumber: "GRN-453",
    poId: "po-1450",
    vendorId: "vendor-eastriver-chem-001",
    receivedAt: "2026-05-22T14:30:00Z",
    verifiedBy: "Lab safety officer (Marcus Patel)",
    verifiedAt: "2026-05-22T15:00:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 6, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 1, condition: "good" },
    ],
  },

  // ── Fairfield Electric (goods) ────────────────────────────────────────
  {
    id: "grn-296",
    grnNumber: "GRN-296",
    poId: "po-1294",
    vendorId: "vendor-fairfield-electric-001",
    receivedAt: "2026-04-09T14:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-04-09T14:54:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 40, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 12, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 8, condition: "good" },
    ],
  },
  {
    id: "grn-436",
    grnNumber: "GRN-436",
    poId: "po-1434",
    vendorId: "vendor-fairfield-electric-001",
    receivedAt: "2026-05-16T14:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-16T14:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 15, condition: "good" },
    ],
  },
  {
    id: "grn-393",
    grnNumber: "GRN-393",
    poId: "po-1391",
    vendorId: "vendor-fairfield-electric-001",
    receivedAt: "2026-05-13T14:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-13T14:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 40, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 16, condition: "good" },
    ],
  },

  // ── Harborline Shipping: po-1364 has NO GRN (intentional)
  // ── Northstar HVAC (service + goods) ──────────────────────────────────
  {
    id: "grn-398",
    grnNumber: "GRN-398",
    poId: "po-1396",
    vendorId: "vendor-northstar-hvac-001",
    receivedAt: "2026-05-05T14:30:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-05-05T14:48:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-04-28", end: "2026-05-05" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 5, condition: "good", notes: "All 5 RTUs serviced; reports filed." },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 8, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 1, condition: "good" },
    ],
  },
  {
    id: "grn-430",
    grnNumber: "GRN-430",
    poId: "po-1428",
    vendorId: "vendor-northstar-hvac-001",
    receivedAt: "2026-05-22T14:30:00Z",
    verifiedBy: "Plant B mgr (Tom Klein)",
    verifiedAt: "2026-05-22T15:30:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "Compressor swapped; system running." },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 8, condition: "good" },
    ],
  },

  // ── Prairieview Catering (event/coffee service) ───────────────────────
  {
    id: "grn-418",
    grnNumber: "GRN-418",
    poId: "po-1416",
    vendorId: "vendor-prairieview-foods-001",
    receivedAt: "2026-04-28T13:30:00Z",
    verifiedBy: "Office admin (Riya Sharma)",
    verifiedAt: "2026-04-28T13:42:00Z",
    isServiceConfirmation: true,
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 80, condition: "good", notes: "All-hands lunch served on schedule." },
    ],
  },
  {
    id: "grn-459",
    grnNumber: "GRN-459",
    poId: "po-1457",
    vendorId: "vendor-prairieview-foods-001",
    receivedAt: "2026-05-22T16:00:00Z",
    verifiedBy: "Office admin (Riya Sharma)",
    verifiedAt: "2026-05-22T16:08:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-05-01", end: "2026-05-22" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "Daily restocks completed Mon-Fri." },
    ],
  },

  // ── Arroyo Construction ───────────────────────────────────────────────
  {
    id: "grn-258",
    grnNumber: "GRN-258",
    poId: "po-1252",
    vendorId: "vendor-arroyo-construction-001",
    receivedAt: "2026-05-10T16:00:00Z",
    verifiedBy: "Plant B mgr (Tom Klein)",
    verifiedAt: "2026-05-10T17:30:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-03-01", end: "2026-05-10" },
    lines: [
      {
        lineNumber: 1,
        poLineNumber: 1,
        quantityReceived: 1,
        condition: "partial",
        notes: "Phase 1 labor complete (~60% billed-to-date); progress invoice expected.",
      },
      {
        lineNumber: 2,
        poLineNumber: 2,
        quantityReceived: 1,
        condition: "good",
        notes: "Materials staged on site; concrete pour scheduled.",
      },
    ],
  },

  // ── Bluefin Security ──────────────────────────────────────────────────
  {
    id: "grn-329",
    grnNumber: "GRN-329",
    poId: "po-1325",
    vendorId: "vendor-bluefin-security-001",
    receivedAt: "2026-04-30T18:00:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-04-30T18:08:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-04-01", end: "2026-04-30" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 4, condition: "good", notes: "All 4 weeks of guard coverage logged." },
    ],
  },
  {
    id: "grn-425",
    grnNumber: "GRN-425",
    poId: "po-1421",
    vendorId: "vendor-bluefin-security-001",
    receivedAt: "2026-05-31T18:00:00Z",
    verifiedBy: "Plant A mgr (María González)",
    verifiedAt: "2026-05-31T18:08:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-05-01", end: "2026-05-31" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 4, condition: "good", notes: "All 4 weeks of guard coverage logged." },
    ],
  },

  // ── Millbrook MRO (goods) ─────────────────────────────────────────────
  {
    id: "grn-311",
    grnNumber: "GRN-311",
    poId: "po-1308",
    vendorId: "vendor-millbrook-mro-001",
    receivedAt: "2026-04-01T13:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-04-01T13:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 24, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 8, condition: "good" },
      { lineNumber: 3, poLineNumber: 3, quantityReceived: 4, condition: "good" },
      { lineNumber: 4, poLineNumber: 4, quantityReceived: 1, condition: "good" },
    ],
  },
  {
    id: "grn-405b",
    grnNumber: "GRN-405b",
    poId: "po-1402",
    vendorId: "vendor-millbrook-mro-001",
    receivedAt: "2026-05-05T13:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-05T13:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 18, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 10, condition: "good" },
    ],
  },
  {
    id: "grn-449",
    grnNumber: "GRN-449",
    poId: "po-1446",
    vendorId: "vendor-millbrook-mro-001",
    receivedAt: "2026-05-14T13:30:00Z",
    verifiedBy: "Receiving clerk (James Whitaker)",
    verifiedAt: "2026-05-14T13:42:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 6, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 4, condition: "good" },
    ],
  },

  // ── Marina Bay IT (SG, goods + install) ───────────────────────────────
  {
    id: "grn-381",
    grnNumber: "GRN-381",
    poId: "po-1377",
    vendorId: "vendor-marina-it-001",
    receivedAt: "2026-05-12T08:30:00Z",
    verifiedBy: "Singapore IT lead (Wei Sheng Lim)",
    verifiedAt: "2026-05-12T09:14:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 4, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good", notes: "Switches racked and configured." },
    ],
  },

  // ── Changi Freight: po-1359 has NO GRN (intentional)
  // ── Changi Freight: po-1473 has NO GRN (intentional)
  // ── Orchard Facilities (SG, recurring service) ────────────────────────
  {
    id: "grn-352",
    grnNumber: "GRN-352",
    poId: "po-1346",
    vendorId: "vendor-orchard-facilities-001",
    receivedAt: "2026-04-30T11:00:00Z",
    verifiedBy: "Singapore office mgr (Geraldine Lim)",
    verifiedAt: "2026-04-30T11:12:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-04-01", end: "2026-04-30" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "All retainer activities completed." },
    ],
  },
  {
    id: "grn-444",
    grnNumber: "GRN-444",
    poId: "po-1440",
    vendorId: "vendor-orchard-facilities-001",
    receivedAt: "2026-05-31T11:00:00Z",
    verifiedBy: "Singapore office mgr (Geraldine Lim)",
    verifiedAt: "2026-05-31T11:12:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-05-01", end: "2026-05-31" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "All retainer activities completed." },
    ],
  },

  // ── Thames Print (GB, goods) ──────────────────────────────────────────
  {
    id: "grn-338",
    grnNumber: "GRN-338",
    poId: "po-1334",
    vendorId: "vendor-thames-print-001",
    receivedAt: "2026-05-02T14:00:00Z",
    verifiedBy: "UK office mgr (Eleanor Whitlock)",
    verifiedAt: "2026-05-02T14:14:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 5000, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 3000, condition: "good" },
    ],
  },
  {
    id: "grn-475",
    grnNumber: "GRN-475",
    poId: "po-1471",
    vendorId: "vendor-thames-print-001",
    receivedAt: "2026-06-05T14:00:00Z",
    verifiedBy: "UK office mgr (Eleanor Whitlock)",
    verifiedAt: "2026-06-05T14:12:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 500, condition: "good" },
    ],
  },

  // ── Mancunian Engineering (GB, goods) ─────────────────────────────────
  {
    id: "grn-324",
    grnNumber: "GRN-324",
    poId: "po-1320",
    vendorId: "vendor-mancunian-engineering-001",
    receivedAt: "2026-05-12T14:30:00Z",
    verifiedBy: "UK warehouse lead (Liam Beckett)",
    verifiedAt: "2026-05-12T14:54:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 200, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 8, condition: "good" },
    ],
  },

  // ── London Couriers (GB): po-1404 has NO GRN (intentional)
  // ── London Couriers (GB): po-1469 has NO GRN (intentional)
  //   (Both freight/courier — covered by missing-GRN omission rule.)

  // ── Sydney Harbour IT (AU, goods) ─────────────────────────────────────
  {
    id: "grn-392",
    grnNumber: "GRN-392",
    poId: "po-1388",
    vendorId: "vendor-sydney-harbour-it-001",
    receivedAt: "2026-05-09T07:30:00Z",
    verifiedBy: "AU IT lead (Ruby Atkinson)",
    verifiedAt: "2026-05-09T08:00:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 4, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 4, condition: "good" },
    ],
  },

  // ── Melbourne Printworks (AU, goods) ──────────────────────────────────
  {
    id: "grn-365",
    grnNumber: "GRN-365",
    poId: "po-1361",
    vendorId: "vendor-melbourne-printworks-001",
    receivedAt: "2026-05-02T07:30:00Z",
    verifiedBy: "AU office mgr (Owen Kavanagh)",
    verifiedAt: "2026-05-02T07:48:00Z",
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 2500, condition: "good" },
      { lineNumber: 2, poLineNumber: 2, quantityReceived: 1, condition: "good", notes: "Mail-out scheduled for next business day." },
    ],
  },

  // ── Service confirmations for managed services / SaaS ─────────────────
  {
    id: "grn-374",
    grnNumber: "GRN-374",
    poId: "po-1370",
    vendorId: "vendor-summit-it-001",
    receivedAt: "2026-05-31T18:00:00Z",
    verifiedBy: "Director of IT (Priya Raman)",
    verifiedAt: "2026-05-31T18:08:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-05-01", end: "2026-05-31" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "Helpdesk + monitoring SLAs met for May." },
    ],
  },
  {
    id: "grn-285",
    grnNumber: "GRN-285",
    poId: "po-1281",
    vendorId: "vendor-summit-it-001",
    receivedAt: "2026-04-30T18:00:00Z",
    verifiedBy: "Director of IT (Priya Raman)",
    verifiedAt: "2026-04-30T18:08:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-04-01", end: "2026-04-30" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "Helpdesk + monitoring SLAs met for April." },
    ],
  },
  {
    id: "grn-201",
    grnNumber: "GRN-201",
    poId: "po-1198",
    vendorId: "vendor-keystone-saas-001",
    receivedAt: "2026-02-15T11:00:00Z",
    verifiedBy: "Director of IT (Priya Raman)",
    verifiedAt: "2026-02-15T11:14:00Z",
    isServiceConfirmation: true,
    serviceperiod: { start: "2026-02-15", end: "2027-02-14" },
    lines: [
      { lineNumber: 1, poLineNumber: 1, quantityReceived: 1, condition: "good", notes: "Annual subscription provisioned and access verified." },
    ],
  },
]

const GRN_INDEX: Map<GoodsReceiptNoteId, GoodsReceiptNote> = new Map(
  SEED_GRNS.map((g) => [g.id, g])
)

const GRN_BY_PO_INDEX: Map<PurchaseOrderId, GoodsReceiptNote> = new Map(
  SEED_GRNS.map((g) => [g.poId, g])
)

export function getGRN(id: GoodsReceiptNoteId): GoodsReceiptNote | undefined {
  return GRN_INDEX.get(id)
}

export function getGRNByPO(poId: PurchaseOrderId): GoodsReceiptNote | undefined {
  return GRN_BY_PO_INDEX.get(poId)
}
