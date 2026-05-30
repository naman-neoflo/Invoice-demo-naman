"use client"

import * as React from "react"
import Link from "next/link"
import {
  MagnifyingGlass,
  Warning,
  CaretRight,
  ShieldCheck,
} from "@phosphor-icons/react"
import { formatDistanceToNowStrict } from "date-fns"

import { KpiCard } from "@/components/neoflo-os/kpi-card"
import { FilterChip } from "@/components/neoflo-os/filter-chip"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Avatar, AvatarFallback } from "@/components/neoflo-os/ui/avatar"
import { Button } from "@/components/neoflo-os/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/neoflo-os/ui/tooltip"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/neoflo-os/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import {
  ALL_INQUIRIES,
  DEMO_KPIS,
  getReceivedDate,
  type InquirySeed,
} from "@/lib/neoflo-os/demo-data"
import { useHydratedDemoStore, type InquiryStatus } from "@/lib/neoflo-os/demo-store"
import { ClassifierLabelPicker } from "./classifier-label-picker"
import { cn } from "@/lib/neoflo-os/utils"
import {
  helpdeskAuditUrl,
  helpdeskInquiryUrl,
  type HelpdeskPrefix,
} from "@/lib/neoflo-os/workspace/helpdesk-routes"

type FilterId = "all" | "unread" | "auto" | "queued"

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "auto", label: "Auto-resolved" },
  { id: "queued", label: "Queued for human" },
]

function statusTone(
  status: InquiryStatus
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "unread":
      return "info"
    case "processing":
      return "info"
    case "auto-resolved":
      return "success"
    case "sent":
      return "success"
    case "queued":
      return "warning"
    case "verifying":
      return "warning"
  }
}

function statusLabel(status: InquiryStatus): string {
  switch (status) {
    case "unread":
      return "Unread"
    case "processing":
      return "Processing"
    case "auto-resolved":
      return "Auto-resolved"
    case "sent":
      return "Sent"
    case "queued":
      return "Queued for human"
    case "verifying":
      return "Verifying"
  }
}

function inquiryMatchesFilter(
  inq: InquirySeed,
  status: InquiryStatus,
  filter: FilterId
): boolean {
  if (filter === "all") return true
  if (filter === "unread") return status === "unread" || status === "processing"
  if (filter === "auto")
    return status === "auto-resolved" || status === "sent"
  if (filter === "queued") return status === "queued" || status === "verifying"
  return true
}

function isViewable(seed: InquirySeed): boolean {
  // Any inquiry with full reasoning + audit data can be opened to inspect the resolution.
  return Boolean(seed.dataSources && seed.dataSources.length > 0)
}

function hasAuditTrail(seed: InquirySeed): boolean {
  return Boolean(seed.auditEvents && seed.auditEvents.length > 0)
}

// Lower priority sorts first → unread/processing on top, then queued, then resolved.
function statusSortPriority(status: InquiryStatus): number {
  if (status === "unread" || status === "processing") return 0
  if (status === "queued" || status === "verifying") return 1
  return 2
}

export function HelpdeskInbox({
  prefix = "/demo",
}: {
  prefix?: HelpdeskPrefix
} = {}) {
  const [activeFilter, setActiveFilter] = React.useState<FilterId>("all")
  const [search, setSearch] = React.useState("")
  const inquiriesState = useHydratedDemoStore((s) => s.inquiries)

  const counts = React.useMemo(() => {
    const map: Record<FilterId, number> = {
      all: 0,
      unread: 0,
      auto: 0,
      queued: 0,
    }
    for (const seed of ALL_INQUIRIES) {
      const status = inquiriesState[seed.id]?.status ?? seed.defaultStatus
      map.all += 1
      if (status === "unread" || status === "processing") map.unread += 1
      if (status === "auto-resolved" || status === "sent") map.auto += 1
      if (status === "queued" || status === "verifying") map.queued += 1
    }
    return map
  }, [inquiriesState])

  const visibleInquiries = React.useMemo(() => {
    const sorted = [...ALL_INQUIRIES].sort((a, b) => {
      const aStatus = inquiriesState[a.id]?.status ?? a.defaultStatus
      const bStatus = inquiriesState[b.id]?.status ?? b.defaultStatus
      const aP = statusSortPriority(aStatus)
      const bP = statusSortPriority(bStatus)
      if (aP !== bP) return aP - bP
      return a.receivedOffsetMinutes - b.receivedOffsetMinutes
    })
    return sorted.filter((seed) => {
      const status = inquiriesState[seed.id]?.status ?? seed.defaultStatus
      if (!inquiryMatchesFilter(seed, status, activeFilter)) return false
      if (search.trim().length > 0) {
        const q = search.trim().toLowerCase()
        return (
          seed.supplier.toLowerCase().includes(q) ||
          seed.subject.toLowerCase().includes(q) ||
          seed.contactEmail.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [inquiriesState, activeFilter, search])

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Supplier inquiries
          </h1>
          <span className="text-muted-foreground text-sm">
            May 1 – May 6, 2026 · 1,247 inbound inquiries this month
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Inquiries this month"
            value={DEMO_KPIS.inquiriesThisMonth.toLocaleString("en-US")}
            delta="+8.4%"
            direction="up"
            intent="good"
            hint="vs April 2026"
          />
          <KpiCard
            label="Auto-resolved"
            value={`${DEMO_KPIS.autoResolvedPct}%`}
            delta="+3.1pp"
            direction="up"
            intent="good"
            hint="rolling 30-day"
          />
          <KpiCard
            label="Avg response time"
            value={`${DEMO_KPIS.avgResponseTimeSec} sec`}
            delta="-94%"
            direction="down"
            intent="good"
            hint="vs prior baseline 18h"
          />
          <KpiCard
            label="Active suppliers"
            value={DEMO_KPIS.activeSuppliers.toLocaleString("en-US")}
            hint="across 4 business units"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <FilterChip
                key={f.id}
                label={f.label}
                count={counts[f.id]}
                active={activeFilter === f.id}
                onClick={() => setActiveFilter(f.id)}
              />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <InputGroup className="w-72">
              <InputGroupAddon>
                <MagnifyingGlass size={16} />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search supplier or subject"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px] pl-6">Supplier</TableHead>
                <TableHead className="max-w-[280px]">Subject</TableHead>
                <TableHead className="w-[240px]">Classifier</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[110px] text-right">
                  Received
                </TableHead>
                <TableHead className="w-[72px] pr-6 text-right">
                  Audit
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleInquiries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-10 text-center text-sm"
                  >
                    No inquiries match your filters.
                  </TableCell>
                </TableRow>
              )}
              {visibleInquiries.map((seed) => {
                const status =
                  inquiriesState[seed.id]?.status ?? seed.defaultStatus
                const isInteractive = isViewable(seed)
                const receivedRel = formatDistanceToNowStrict(
                  getReceivedDate(seed),
                  { addSuffix: true }
                )
                return (
                  <TableRow
                    key={seed.id}
                    className={cn(
                      "group",
                      !isInteractive &&
                        "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <TableCell className="pl-6">
                      <Link
                        href={
                          isInteractive
                            ? helpdeskInquiryUrl(prefix, seed.id)
                            : "/demo"
                        }
                        className="flex items-center gap-3"
                        aria-disabled={!isInteractive}
                      >
                        <Avatar className="size-8">
                          <AvatarFallback
                            className={cn(
                              "text-xs font-semibold",
                              seed.supplierTone
                            )}
                          >
                            {seed.supplierInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span
                            className={cn(
                              "truncate text-sm font-medium",
                              isInteractive
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {seed.supplier}
                          </span>
                          <span className="text-muted-foreground truncate text-xs">
                            {seed.contactEmail}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <Link
                        href={
                          isInteractive
                            ? helpdeskInquiryUrl(prefix, seed.id)
                            : "/demo"
                        }
                        className="flex min-w-0 items-center gap-2"
                        aria-disabled={!isInteractive}
                        title={seed.subject}
                      >
                        {seed.riskLabel && (
                          <Warning
                            size={14}
                            weight="fill"
                            className="text-rose-500 shrink-0"
                          />
                        )}
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-sm",
                            isInteractive && status === "unread"
                              ? "text-foreground font-semibold"
                              : ""
                          )}
                        >
                          {seed.subject}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ClassifierLabelPicker
                        inquiryId={seed.id}
                        seedLabel={seed.classifierLabel}
                        seedTone={
                          seed.classifierTone === "danger" ? "danger" : "info"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={statusTone(status)}>
                        {statusLabel(status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="text-muted-foreground inline-flex items-center gap-1 text-xs"
                        suppressHydrationWarning
                      >
                        {receivedRel}
                        {isInteractive && (
                          <CaretRight
                            size={12}
                            className="opacity-0 transition-opacity group-hover:opacity-60"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {hasAuditTrail(seed) ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-primary size-8"
                            >
                              <Link
                                href={helpdeskAuditUrl(prefix, seed.id)}
                                aria-label={`View audit log for ${seed.supplier}`}
                              >
                                <ShieldCheck size={16} />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            View audit log
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">
                          —
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>

        <div className="text-muted-foreground text-xs">
          Click any clickable row to inspect the data sources, reasoning, and
          audit trail behind the resolution.
        </div>
      </div>
    </div>
  )
}
