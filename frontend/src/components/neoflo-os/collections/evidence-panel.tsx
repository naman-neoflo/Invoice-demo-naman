// components/collections/evidence-panel.tsx
//
// Renders Neo's 4-source evidence panel for the dispute-detail surface —
// PO record, GRN record, POD record, and the original quote — each as a
// checkmark row with the relevant metadata. Footer line summarizes the
// discrepancy + a strong "Customer is correct." conclusion when the
// recommendation action is "issue-credit-memo".
//
// Spec: docs/handoff/collections/03-screen-specs.md § "Surface 4 — C hero".
import * as React from "react"
import { CheckCircle, Files } from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import type { Dispute } from "@/lib/neoflo-os/collections/types"

interface EvidencePanelProps {
  evidence: Dispute["evidence"]
  /** Drives the closing line — only show "Customer is correct" if Neo recommends a credit memo. */
  recommendationAction?: Dispute["recommendation"] extends infer R
    ? R extends { action: infer A }
      ? A
      : never
    : never
}

function fmtDate(iso?: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  return `${month} ${d.getUTCDate()}`
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

interface EvidenceRowProps {
  title: string
  details: React.ReactNode
}

function EvidenceRow({ title, details }: EvidenceRowProps) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle
        size={16}
        weight="fill"
        className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-foreground text-sm font-medium">{title}</div>
        <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
          {details}
        </div>
      </div>
    </li>
  )
}

export function EvidencePanel({
  evidence,
  recommendationAction,
}: EvidencePanelProps) {
  if (!evidence) {
    return (
      <Card className="bg-card text-muted-foreground p-6 text-sm">
        No evidence pulled yet.
      </Card>
    )
  }

  const customerIsCorrect = recommendationAction === "issue-credit-memo"

  return (
    <Card className="bg-card flex flex-col gap-4 p-6">
      <header className="flex items-center gap-2">
        <Files size={16} weight="regular" className="text-primary" />
        <h2 className="text-foreground text-sm font-semibold">
          Evidence (4 sources)
        </h2>
      </header>

      <ul className="flex flex-col gap-3">
        {evidence.poRecord ? (
          <EvidenceRow
            title={evidence.poRecord.number}
            details={
              <>
                <span>
                  {evidence.poRecord.quantity} ×{" "}
                  {fmtMoney(evidence.poRecord.unitPrice)} ={" "}
                  <span className="text-foreground tabular-nums">
                    {fmtMoney(
                      evidence.poRecord.quantity *
                        evidence.poRecord.unitPrice,
                    )}
                  </span>
                </span>
                <span>
                  Approver: {evidence.poRecord.approver} &middot; issued{" "}
                  {fmtDate(evidence.poRecord.issuedAt)}
                </span>
              </>
            }
          />
        ) : null}

        {evidence.grnRecord ? (
          <EvidenceRow
            title={evidence.grnRecord.number}
            details={
              <>
                <span>
                  Received{" "}
                  <span className="text-foreground tabular-nums">
                    {evidence.grnRecord.receivedQty}
                  </span>{" "}
                  units &middot; condition {evidence.grnRecord.condition}
                </span>
                <span>
                  Verified by {evidence.grnRecord.verifiedBy} &middot;{" "}
                  {fmtDate(evidence.grnRecord.receivedAt)}
                </span>
              </>
            }
          />
        ) : null}

        {evidence.podRecord ? (
          <EvidenceRow
            title="POD (proof of delivery)"
            details={
              <>
                <span>
                  Signed {fmtDate(evidence.podRecord.signedAt)} by{" "}
                  {evidence.podRecord.signedBy}
                </span>
                <span>
                  Carrier: {evidence.podRecord.carrierName} &middot;{" "}
                  <span className="text-foreground tabular-nums">
                    {evidence.podRecord.quantityDelivered}
                  </span>{" "}
                  delivered &middot; condition {evidence.podRecord.condition}
                </span>
              </>
            }
          />
        ) : null}

        {evidence.originalQuote ? (
          <EvidenceRow
            title="Original quote"
            details={
              <span>
                {fmtMoney(evidence.originalQuote.unitPrice)} ×{" "}
                {evidence.originalQuote.quantity} ={" "}
                <span className="text-foreground tabular-nums">
                  {fmtMoney(evidence.originalQuote.total)}
                </span>{" "}
                (matches invoice)
              </span>
            }
          />
        ) : null}
      </ul>

      {evidence.discrepancySummary ? (
        <div className="border-border/60 flex flex-col gap-1 border-t pt-3 text-sm">
          <div className="text-foreground/85">
            {evidence.discrepancySummary}
          </div>
          {customerIsCorrect ? (
            <div className="text-emerald-700 font-semibold dark:text-emerald-300">
              Customer is correct.
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
