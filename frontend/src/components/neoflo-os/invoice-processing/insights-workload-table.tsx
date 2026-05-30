// components/invoice-processing/insights-workload-table.tsx
//
// 3-row workload table on the Insights page. Always-Neo-on-top sorted
// by total actions. Humans render with persona-colored avatars and the
// action-type counts. Empty cells render "—" not "0".

"use client"

import * as React from "react"
import { Sparkle } from "@phosphor-icons/react"

import { Avatar, AvatarFallback } from "@/components/neoflo-os/ui/avatar"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import { getWorkloadByActor } from "@/lib/neoflo-os/invoice-processing/derive"
import { getPersona } from "@/lib/neoflo-os/neoflo-workspace/personas"
import { cn } from "@/lib/neoflo-os/utils"

export function InsightsWorkloadTable({
  dateFrom,
  dateTo,
}: {
  dateFrom: string
  dateTo: string
}) {
  const rows = React.useMemo(
    () => getWorkloadByActor({ dateFrom, dateTo }),
    [dateFrom, dateTo]
  )

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-foreground text-sm font-semibold">
          Workload by actor
        </h3>
        <span className="text-muted-foreground text-xs">
          Period totals · Neo + human contributors
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Actor</TableHead>
            <TableHead className="text-right">Auto-posted</TableHead>
            <TableHead className="text-right">Exception resolved</TableHead>
            <TableHead className="text-right">Duplicate confirmed</TableHead>
            <TableHead className="text-right">GL override</TableHead>
            <TableHead className="text-right">Classifier override</TableHead>
            <TableHead className="text-right">Avg cycle</TableHead>
            <TableHead className="text-right">Open queue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const isNeo = r.actorKey === "neo"
            const persona =
              r.actorKey === "neo" ? null : getPersona(r.actorKey)
            return (
              <TableRow key={r.actorKey}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {isNeo ? (
                      <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
                        <Sparkle size={14} weight="fill" />
                      </div>
                    ) : (
                      <Avatar className="size-8">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            persona?.id === "ap-manager" &&
                              "bg-violet-100 text-violet-900",
                            persona?.id === "controller" &&
                              "bg-emerald-100 text-emerald-900",
                            persona?.id === "cfo" &&
                              "bg-sky-100 text-sky-900",
                            persona?.id === "ar-manager" &&
                              "bg-rose-100 text-rose-900"
                          )}
                        >
                          {persona?.initials ?? "??"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-foreground font-medium">
                      {r.displayName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {r.autoPosted || "—"}
                </TableCell>
                <TableCell className="text-right">
                  {r.exceptionResolved || "—"}
                </TableCell>
                <TableCell className="text-right">
                  {r.duplicateConfirmed || "—"}
                </TableCell>
                <TableCell className="text-right">
                  {r.glOverride || "—"}
                </TableCell>
                <TableCell className="text-right">
                  {r.classifierOverride || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {r.avgCycle}
                </TableCell>
                <TableCell className="text-right">
                  {/* Use ?? not || so a real 0 ("no work queued") renders as
                      "0", not "—". The other action-count columns intentionally
                      collapse 0 → "—" since 0 actions of a type is the same as
                      empty in that UX. */}
                  {r.openQueue ?? "—"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
