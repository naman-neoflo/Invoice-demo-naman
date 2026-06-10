// 40 fictional mid-market AP vendors for the invoice-processing demo. Hand-written
// so Neo's reasoning has realistic master-agreement clauses, default GL coding,
// and behavior signals to reference.
//
// Source of truth: docs/handoff/invoice-processing/04-data-model.md
//   § "Static seed shape" > "seed-vendors.ts".
//
// Hero vendors (do NOT edit copy without also updating 05-demo-script.md):
//   - vendor-aclng-001  Acme Cleaning Services       (duplicate hero + 3-way match hero)
//   - vendor-sgs-001    Singapore Stationery Pte Ltd (GST input-tax-credit hero)
//   - vendor-northeast-001    Northeast Industrial   (price-variance exception)
//   - vendor-pacific-logistics-001  Pacific Logistics (missing-GRN exception)
//   - vendor-westpoint-mkt-001 Westpoint Marketing   (GL-ambiguous exception)
//   - vendor-atlantic-001  Atlantic Industrial       (early-pay discount)
//   - vendor-pacific-dist-001  Pacific Distribution  (early-pay discount)

import type { Vendor, VendorId } from "./types"

export const SEED_VENDORS: Vendor[] = [
  // ── Hero vendors ──────────────────────────────────────────────────────
  {
    id: "vendor-aclng-001",
    name: "Acme Cleaning Services",
    domain: "acmecleaning.com",
    primaryContactName: "Tom Matsuda",
    primaryContactEmail: "tom.matsuda@acmecleaning.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    agreementClauses: [
      {
        section: "§2.3",
        text: "Monthly cleaning services across all named plants are billed on the 1st of each month and coded to Maintenance & Supplies.",
        relatesTo: "GL_CODING",
      },
    ],
    defaultGL: {
      account: "62100",
      accountLabel: "Maintenance & Supplies",
      costCenter: "PLANT-A",
      entity: "AcmeCo US",
    },
    behavior: {
      averageInvoicesPerMonth: 1.5,
      typicalAmountRange: { min: 4000, max: 45000 },
      duplicateAttemptHistory: 1,
    },
  },
  {
    id: "vendor-sgs-001",
    name: "Singapore Stationery Pte Ltd",
    domain: "singaporestationery.sg",
    primaryContactName: "Wei Lin Tan",
    primaryContactEmail: "ar@singaporestationery.sg",
    jurisdiction: "SG",
    taxRegistration: {
      type: "GST",
      id: "202012345W",
      validatedAt: "2026-05-15T02:13:08Z",
      validatedSource: "IRAS GST registry",
    },
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 3000, max: 12000 },
    },
  },
  {
    id: "vendor-northeast-001",
    name: "Northeast Industrial Supply",
    domain: "neindustrial.com",
    primaryContactName: "Patricia Klein",
    primaryContactEmail: "billing@neindustrial.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    agreementClauses: [
      {
        section: "§5.1",
        text: "Unit prices are fixed for the contract term. Any escalation requires 60 days' written notice and a signed amendment.",
        relatesTo: "PRICING",
      },
    ],
    behavior: {
      averageInvoicesPerMonth: 3,
      typicalAmountRange: { min: 8000, max: 55000 },
    },
  },
  {
    id: "vendor-pacific-logistics-001",
    name: "Pacific Logistics",
    domain: "pacificlogistics.com",
    primaryContactName: "Marcus Reed",
    primaryContactEmail: "ar@pacificlogistics.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 4,
      typicalAmountRange: { min: 2000, max: 18000 },
    },
  },
  {
    id: "vendor-westpoint-mkt-001",
    name: "Westpoint Marketing",
    domain: "westpointmkt.com",
    primaryContactName: "Diego Alvarez",
    primaryContactEmail: "billing@westpointmkt.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 1500, max: 12000 },
    },
  },
  {
    id: "vendor-atlantic-001",
    name: "Atlantic Industrial",
    domain: "atlanticindustrial.com",
    primaryContactName: "Karen Whitfield",
    primaryContactEmail: "ar@atlanticindustrial.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    earlyPayDiscount: {
      discountPercent: 2,
      daysToQualify: 10,
    },
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 18000, max: 60000 },
    },
  },
  {
    id: "vendor-pacific-dist-001",
    name: "Pacific Distribution",
    domain: "pacificdist.com",
    primaryContactName: "Hiro Tanaka",
    primaryContactEmail: "ap@pacificdist.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    earlyPayDiscount: {
      discountPercent: 2,
      daysToQualify: 10,
    },
    behavior: {
      averageInvoicesPerMonth: 3,
      typicalAmountRange: { min: 15000, max: 48000 },
    },
  },

  // ── US vendors (mid-market AP mix) ────────────────────────────────────
  {
    id: "vendor-bluepeak-001",
    name: "Blue Peak Materials",
    domain: "bluepeakmaterials.com",
    primaryContactName: "Janelle Ortiz",
    primaryContactEmail: "ap@bluepeakmaterials.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    agreementClauses: [
      {
        section: "§3.2",
        text: "Freight is FOB destination; vendor bears outbound freight unless invoice specifies expedited shipping.",
        relatesTo: "FREIGHT",
      },
    ],
    behavior: {
      averageInvoicesPerMonth: 5,
      typicalAmountRange: { min: 4500, max: 32000 },
    },
  },
  {
    id: "vendor-meridian-001",
    name: "Meridian Power Systems",
    domain: "meridianpower.com",
    primaryContactName: "Felix Brennan",
    primaryContactEmail: "billing@meridianpower.com",
    jurisdiction: "US",
    paymentTermsDays: 45,
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 22000, max: 95000 },
    },
  },
  {
    id: "vendor-cascade-001",
    name: "Cascade Office Solutions",
    domain: "cascadeoffice.com",
    primaryContactName: "Rita Mohamed",
    primaryContactEmail: "ar@cascadeoffice.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 4,
      typicalAmountRange: { min: 800, max: 6500 },
    },
  },
  {
    id: "vendor-summit-it-001",
    name: "Summit IT Services",
    domain: "summit-it.com",
    primaryContactName: "Anjali Desai",
    primaryContactEmail: "billing@summit-it.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    agreementClauses: [
      {
        section: "§4.1",
        text: "Monthly managed-services fee is billed in advance on the 1st of each month and coded to IT Services & Support.",
        relatesTo: "GL_CODING",
      },
    ],
    defaultGL: {
      account: "64200",
      accountLabel: "IT Services & Support",
      costCenter: "CORP-US",
      entity: "AcmeCo US",
    },
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 8500, max: 9500 },
    },
  },
  {
    id: "vendor-ironbridge-001",
    name: "Ironbridge Machining",
    domain: "ironbridgemach.com",
    primaryContactName: "Carlos Beltrán",
    primaryContactEmail: "ap@ironbridgemach.com",
    jurisdiction: "US",
    paymentTermsDays: 60,
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 12000, max: 78000 },
      historicalShortShipPercent: 0.04,
    },
  },
  {
    id: "vendor-clearwater-utils-001",
    name: "Clearwater Utilities",
    domain: "clearwaterutils.com",
    primaryContactName: "Erica Pace",
    primaryContactEmail: "billing@clearwaterutils.com",
    jurisdiction: "US",
    paymentTermsDays: 21,
    agreementClauses: [
      {
        section: "§1.5",
        text: "Utility usage charges are calculated monthly on a metered basis and posted to Utilities — Plant operations.",
        relatesTo: "GL_CODING",
      },
    ],
    defaultGL: {
      account: "62500",
      accountLabel: "Utilities",
      costCenter: "PLANT-A",
      entity: "AcmeCo US",
    },
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 9200, max: 14500 },
    },
  },
  {
    id: "vendor-greenfield-pkg-001",
    name: "Greenfield Packaging",
    domain: "greenfieldpkg.com",
    primaryContactName: "Tova Levin",
    primaryContactEmail: "ar@greenfieldpkg.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 6,
      typicalAmountRange: { min: 3500, max: 22000 },
      historicalShortShipPercent: 0.02,
    },
  },
  {
    id: "vendor-tristate-freight-001",
    name: "Tri-State Freight",
    domain: "tristatefreight.com",
    primaryContactName: "Brad Sundquist",
    primaryContactEmail: "billing@tristatefreight.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    agreementClauses: [
      {
        section: "§2.1",
        text: "Standard LTL freight rates apply per published tariff; expedited surcharges require shipper pre-approval.",
        relatesTo: "FREIGHT",
      },
    ],
    behavior: {
      averageInvoicesPerMonth: 8,
      typicalAmountRange: { min: 600, max: 4800 },
    },
  },
  {
    id: "vendor-cornerstone-legal-001",
    name: "Cornerstone Legal Partners",
    domain: "cornerstonelegal.com",
    primaryContactName: "Margaret Foley",
    primaryContactEmail: "ar@cornerstonelegal.com",
    jurisdiction: "US",
    paymentTermsDays: 45,
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 4500, max: 38000 },
    },
  },
  {
    id: "vendor-redwood-jntr-001",
    name: "Redwood Janitorial Supply",
    domain: "redwoodjntr.com",
    primaryContactName: "Suzanne Quint",
    primaryContactEmail: "billing@redwoodjntr.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 3,
      typicalAmountRange: { min: 750, max: 5400 },
    },
  },
  {
    id: "vendor-keystone-saas-001",
    name: "Keystone SaaS Platform",
    domain: "keystonesaas.com",
    primaryContactName: "Vikram Patel",
    primaryContactEmail: "billing@keystonesaas.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    agreementClauses: [
      {
        section: "§6.4",
        text: "Annual subscription billed in arrears each anniversary; charges code to Software Subscriptions.",
        relatesTo: "GL_CODING",
      },
    ],
    defaultGL: {
      account: "64500",
      accountLabel: "Software Subscriptions",
      costCenter: "CORP-US",
      entity: "AcmeCo US",
    },
    behavior: {
      averageInvoicesPerMonth: 0.08,
      typicalAmountRange: { min: 24000, max: 28000 },
    },
  },
  {
    id: "vendor-coastal-print-001",
    name: "Coastal Print & Signage",
    domain: "coastalprint.com",
    primaryContactName: "Henry Okafor",
    primaryContactEmail: "ar@coastalprint.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 450, max: 3800 },
    },
  },
  {
    id: "vendor-rosehill-staffing-001",
    name: "Rosehill Staffing",
    domain: "rosehillstaffing.com",
    primaryContactName: "Daphne Iverson",
    primaryContactEmail: "billing@rosehillstaffing.com",
    jurisdiction: "US",
    paymentTermsDays: 14,
    earlyPayDiscount: {
      discountPercent: 1,
      daysToQualify: 7,
    },
    behavior: {
      averageInvoicesPerMonth: 4,
      typicalAmountRange: { min: 6500, max: 28000 },
    },
  },
  {
    id: "vendor-eastriver-chem-001",
    name: "East River Chemical Co",
    domain: "eastriverchem.com",
    primaryContactName: "Jonas Petrov",
    primaryContactEmail: "ap@eastriverchem.com",
    jurisdiction: "US",
    paymentTermsDays: 45,
    agreementClauses: [
      {
        section: "§4.7",
        text: "Hazardous-materials surcharges are itemized separately and post to Chemicals & Lab Supplies.",
        relatesTo: "GL_CODING",
      },
    ],
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 8500, max: 35000 },
    },
  },
  {
    id: "vendor-fairfield-electric-001",
    name: "Fairfield Electric Supply",
    domain: "fairfieldelectric.com",
    primaryContactName: "Patrick O'Sullivan",
    primaryContactEmail: "billing@fairfieldelectric.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 3,
      typicalAmountRange: { min: 1800, max: 14000 },
    },
  },
  {
    id: "vendor-harborline-shipping-001",
    name: "Harborline Shipping",
    domain: "harborlineshipping.com",
    primaryContactName: "Renata Bauer",
    primaryContactEmail: "ar@harborlineshipping.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 5,
      typicalAmountRange: { min: 1200, max: 9800 },
    },
  },
  {
    id: "vendor-northstar-hvac-001",
    name: "Northstar HVAC Service",
    domain: "northstarhvac.com",
    primaryContactName: "Lucas Ferguson",
    primaryContactEmail: "billing@northstarhvac.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 2200, max: 18000 },
    },
  },
  {
    id: "vendor-silverbrook-consult-001",
    name: "Silverbrook Consulting Group",
    domain: "silverbrookcg.com",
    primaryContactName: "Yasmin El-Sayed",
    primaryContactEmail: "ar@silverbrookcg.com",
    jurisdiction: "US",
    paymentTermsDays: 45,
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 12000, max: 42000 },
    },
  },
  {
    id: "vendor-prairieview-foods-001",
    name: "Prairieview Catering",
    domain: "prairieviewcatering.com",
    primaryContactName: "Donna Reyes",
    primaryContactEmail: "billing@prairieviewcatering.com",
    jurisdiction: "US",
    paymentTermsDays: 14,
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 350, max: 4200 },
    },
  },
  {
    id: "vendor-arroyo-construction-001",
    name: "Arroyo Construction",
    domain: "arroyoconstruction.com",
    primaryContactName: "Miguel Salazar",
    primaryContactEmail: "ap@arroyoconstruction.com",
    jurisdiction: "US",
    paymentTermsDays: 60,
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 25000, max: 180000 },
    },
  },
  {
    id: "vendor-bluefin-security-001",
    name: "Bluefin Security Services",
    domain: "bluefinsecurity.com",
    primaryContactName: "Roxanne Beaumont",
    primaryContactEmail: "ar@bluefinsecurity.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    agreementClauses: [
      {
        section: "§3.1",
        text: "Site-security guard services are billed weekly at the contracted hourly rate and code to Security & Surveillance.",
        relatesTo: "GL_CODING",
      },
    ],
    defaultGL: {
      account: "62700",
      accountLabel: "Security & Surveillance",
      costCenter: "PLANT-A",
      entity: "AcmeCo US",
    },
    behavior: {
      averageInvoicesPerMonth: 4,
      typicalAmountRange: { min: 6800, max: 9200 },
    },
  },
  {
    id: "vendor-millbrook-mro-001",
    name: "Millbrook MRO Distributors",
    domain: "millbrookmro.com",
    primaryContactName: "Theodore Vega",
    primaryContactEmail: "billing@millbrookmro.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 7,
      typicalAmountRange: { min: 400, max: 5800 },
      historicalShortShipPercent: 0.03,
    },
  },
  {
    id: "vendor-summit-recruiting-001",
    name: "Summit Talent Partners",
    domain: "summittalent.com",
    primaryContactName: "Adaeze Nkomo",
    primaryContactEmail: "ar@summittalent.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 0.5,
      typicalAmountRange: { min: 18000, max: 65000 },
    },
  },
  {
    id: "vendor-blackford-insurance-001",
    name: "Blackford Insurance Brokers",
    domain: "blackfordinsurance.com",
    primaryContactName: "Eleanor Hastings",
    primaryContactEmail: "billing@blackfordinsurance.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 0.25,
      typicalAmountRange: { min: 42000, max: 58000 },
    },
  },

  // ── Singapore vendors ──────────────────────────────────────────────────
  {
    id: "vendor-marina-it-001",
    name: "Marina Bay IT Solutions Pte Ltd",
    domain: "marinabayit.sg",
    primaryContactName: "Hui Min Wong",
    primaryContactEmail: "billing@marinabayit.sg",
    jurisdiction: "SG",
    taxRegistration: {
      type: "GST",
      id: "201534721K",
      validatedAt: "2026-05-10T03:42:00Z",
      validatedSource: "IRAS GST registry",
    },
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 5500, max: 18000 },
    },
  },
  {
    id: "vendor-changi-logistics-001",
    name: "Changi Freight Forwarders Pte Ltd",
    domain: "changifreight.sg",
    primaryContactName: "Kumar Subramaniam",
    primaryContactEmail: "ar@changifreight.sg",
    jurisdiction: "SG",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 3,
      typicalAmountRange: { min: 1200, max: 11000 },
    },
  },
  {
    id: "vendor-orchard-facilities-001",
    name: "Orchard Facilities Management Pte Ltd",
    domain: "orchardfm.sg",
    primaryContactName: "Siti Nuraini",
    primaryContactEmail: "billing@orchardfm.sg",
    jurisdiction: "SG",
    paymentTermsDays: 30,
    agreementClauses: [
      {
        section: "§2.1",
        text: "Monthly facilities-management retainer covers cleaning, security, and routine maintenance across the Singapore office.",
        relatesTo: "GL_CODING",
      },
    ],
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 7200, max: 8800 },
    },
  },
  {
    id: "vendor-raffles-legal-001",
    name: "Raffles Place Legal LLP",
    domain: "raffleslegal.sg",
    primaryContactName: "Geraldine Cheong",
    primaryContactEmail: "billing@raffleslegal.sg",
    jurisdiction: "SG",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 4500, max: 22000 },
    },
  },

  // ── UK vendors ─────────────────────────────────────────────────────────
  {
    id: "vendor-thames-print-001",
    name: "Thames Print Co Ltd",
    domain: "thamesprint.co.uk",
    primaryContactName: "Oliver Whitmore",
    primaryContactEmail: "ar@thamesprint.co.uk",
    jurisdiction: "GB",
    taxRegistration: {
      type: "VAT",
      id: "GB389472104",
      validatedAt: "2026-04-22T11:14:00Z",
      validatedSource: "HMRC VAT registry",
    },
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 1200, max: 8500 },
    },
  },
  {
    id: "vendor-mancunian-engineering-001",
    name: "Mancunian Engineering Ltd",
    domain: "mancunianeng.co.uk",
    primaryContactName: "Harriet Bramley",
    primaryContactEmail: "billing@mancunianeng.co.uk",
    jurisdiction: "GB",
    paymentTermsDays: 45,
    agreementClauses: [
      {
        section: "§5.3",
        text: "Spare-parts orders ship from Manchester warehouse; standard lead time is 5 working days.",
        relatesTo: "PRICING",
      },
    ],
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 6000, max: 32000 },
    },
  },
  {
    id: "vendor-london-couriers-001",
    name: "London Couriers Ltd",
    domain: "londoncouriers.co.uk",
    primaryContactName: "Ade Adebayo",
    primaryContactEmail: "ar@londoncouriers.co.uk",
    jurisdiction: "GB",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 4,
      typicalAmountRange: { min: 280, max: 2400 },
    },
  },

  // ── Australia vendors ──────────────────────────────────────────────────
  {
    id: "vendor-sydney-harbour-it-001",
    name: "Sydney Harbour IT Pty Ltd",
    domain: "sydharbourit.com.au",
    primaryContactName: "Lachlan Whitfield",
    primaryContactEmail: "billing@sydharbourit.com.au",
    jurisdiction: "AU",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 1,
      typicalAmountRange: { min: 4200, max: 12000 },
    },
  },
  {
    id: "vendor-melbourne-printworks-001",
    name: "Melbourne Printworks Pty Ltd",
    domain: "melbprintworks.com.au",
    primaryContactName: "Saoirse Mitchell",
    primaryContactEmail: "ar@melbprintworks.com.au",
    jurisdiction: "AU",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 800, max: 4800 },
    },
  },

  // ── Cross-workflow vendors (referenced from spend-analytics) ──────────
  // Minimal placeholder shapes so invoice-processing seed-invoices can render
  // rows whose IDs are also referenced by spend-analytics' deferral batch +
  // maverick switch heroes. Spend-analytics has its own richer Vendor seed
  // for these same IDs in lib/spend-analytics/seed-vendors.ts.
  {
    id: "vendor-pacific-logistics",
    name: "Pacific Logistics",
    domain: "pacificlogistics-corp.com",
    primaryContactName: "Marcus Reed",
    primaryContactEmail: "ar@pacificlogistics-corp.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 8,
      typicalAmountRange: { min: 80_000, max: 220_000 },
    },
  },
  {
    id: "vendor-sumitomo-heavy",
    name: "Sumitomo Heavy",
    domain: "sumitomoheavy.com",
    primaryContactName: "Kenji Sato",
    primaryContactEmail: "ar@sumitomoheavy.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 4,
      typicalAmountRange: { min: 60_000, max: 200_000 },
    },
  },
  {
    id: "vendor-coastal-print",
    name: "Coastal Print",
    domain: "coastalprint.com",
    primaryContactName: "Erica Vance",
    primaryContactEmail: "ar@coastalprint.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 6,
      typicalAmountRange: { min: 40_000, max: 180_000 },
    },
  },
  {
    id: "vendor-westside-logistics",
    name: "Westside Logistics",
    domain: "westsidelogistics.com",
    primaryContactName: "Janelle Foster",
    primaryContactEmail: "billing@westsidelogistics.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 5,
      typicalAmountRange: { min: 50_000, max: 160_000 },
    },
  },
  {
    id: "vendor-northeast-industrial-supply",
    name: "Northeast Industrial Supply",
    domain: "neindustrial-supply.com",
    primaryContactName: "Patricia Klein",
    primaryContactEmail: "billing@neindustrial-supply.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 6,
      typicalAmountRange: { min: 60_000, max: 180_000 },
    },
  },
  {
    id: "vendor-westpoint-industrial-tools",
    name: "Westpoint Industrial Tools",
    domain: "westpoint-itools.com",
    primaryContactName: "Hannah Bristow",
    primaryContactEmail: "ar@westpoint-itools.com",
    jurisdiction: "US",
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 3,
      typicalAmountRange: { min: 12_000, max: 32_000 },
    },
  },

  // ── Indonesia vendor (Faktur Pajak hero) ──────────────────────────────
  {
    id: "vendor-pt-nau-corp-001",
    name: "PT NAU CORP",
    domain: "naucorp.co.id",
    primaryContactName: "Budi Santoso",
    primaryContactEmail: "finance@naucorp.co.id",
    jurisdiction: "ID",
    taxRegistration: {
      type: "VAT",
      id: "01.234.567.8-901.000",
      validatedAt: "2026-05-15T03:28:00Z",
      validatedSource: "DJP Coretax registry",
    },
    paymentTermsDays: 30,
    behavior: {
      averageInvoicesPerMonth: 2,
      typicalAmountRange: { min: 40_000_000, max: 60_000_000 },
    },
  },
]

const VENDOR_INDEX: Map<VendorId, Vendor> = new Map(
  SEED_VENDORS.map((v) => [v.id, v])
)

export function getVendor(id: VendorId): Vendor | undefined {
  return VENDOR_INDEX.get(id)
}
