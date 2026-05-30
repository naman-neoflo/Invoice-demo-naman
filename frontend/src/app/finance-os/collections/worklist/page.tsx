// app/neoflo-workspace/collections/worklist/page.tsx
//
// Collections worklist surface — the full prioritized list of all 40 active
// cases, filterable + searchable. Per docs/handoff/collections/03-screen-specs.md
// § "Surface 2: Worklist".
//
// Chrome (WorkspaceHeader, CollectionsTabs, ChatThread) is owned by
// app/neoflo-workspace/collections/layout.tsx — this page renders only the body.
"use client"

import * as React from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"

import { FilterChip } from "@/components/neoflo-os/filter-chip"
import { PageHeader } from "@/components/neoflo-os/page-header"
import { WorklistRow } from "@/components/neoflo-os/collections/worklist-row"
import { Button } from "@/components/neoflo-os/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/neoflo-os/ui/input-group"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import { TooltipProvider } from "@/components/neoflo-os/ui/tooltip"
import { SEED_CASES } from "@/lib/neoflo-os/collections/seed-cases"
import { getOpenInvoice } from "@/lib/neoflo-os/collections/seed-open-invoices"
import { getWorklist } from "@/lib/neoflo-os/collections/derive"
import {
  useCollectionsStore,
  useHydratedCollectionsStore,
} from "@/lib/neoflo-os/collections/collections-store"
import type { CollectionsCase } from "@/lib/neoflo-os/collections/types"

// ════════════════════════════════════════════════════════════════════
// Filter definitions
// ════════════════════════════════════════════════════════════════════

type WorklistFilter =
  | "all"
  | "disputes"
  | "promises"
  | "escalations"
  | "current"
  | "1-30d"
  | "31-60d"
  | "61-90d"
  | "90+d"

const MAIN_FILTERS: { id: WorklistFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "disputes", label: "Disputes" },
  { id: "promises", label: "Promises" },
  { id: "escalations", label: "Escalations" },
]

const AGING_FILTERS: { id: WorklistFilter; label: string }[] = [
  { id: "current", label: "Current" },
  { id: "1-30d", label: "1-30d" },
  { id: "31-60d", label: "31-60d" },
  { id: "61-90d", label: "61-90d" },
  { id: "90+d", label: "90+d" },
]

// ════════════════════════════════════════════════════════════════════
// Counts — derived live from the SEED_CASES, independent of active filter
// ════════════════════════════════════════════════════════════════════

function bucketForAgingDays(days: number): WorklistFilter {
  if (days <= 0) return "current"
  if (days <= 30) return "1-30d"
  if (days <= 60) return "31-60d"
  if (days <= 90) return "61-90d"
  return "90+d"
}

function isEscalation(c: CollectionsCase): boolean {
  return (
    Boolean(c.caseFlags.accountHoldCandidate) ||
    c.recommendedTier === "hold" ||
    c.recommendedTier === 3 ||
    c.recommendedTier === 4
  )
}

function getCounts(): Record<WorklistFilter, number> {
  const counts: Record<WorklistFilter, number> = {
    all: 0,
    disputes: 0,
    promises: 0,
    escalations: 0,
    current: 0,
    "1-30d": 0,
    "31-60d": 0,
    "61-90d": 0,
    "90+d": 0,
  }
  for (const c of SEED_CASES) {
    counts.all += 1
    if (c.caseFlags.activeDispute) counts.disputes += 1
    if (c.caseFlags.promiseBroken) counts.promises += 1
    if (isEscalation(c)) counts.escalations += 1
    counts[bucketForAgingDays(c.oldestAgingDays)] += 1
  }
  return counts
}

// ════════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════════

export default function CollectionsWorklistPage() {
  // Persisted filter + search via the collections store (sessionStorage).
  const worklistFilter = useHydratedCollectionsStore((s) => s.worklistFilter)
  const worklistSearch = useHydratedCollectionsStore((s) => s.worklistSearch)

  // Local debounced search mirror so typing stays snappy.
  const [searchDraft, setSearchDraft] = React.useState(worklistSearch)

  React.useEffect(() => {
    setSearchDraft(worklistSearch)
  }, [worklistSearch])

  // 200ms debounce → push into the store.
  React.useEffect(() => {
    if (searchDraft === worklistSearch) return
    const t = window.setTimeout(() => {
      useCollectionsStore.getState().setWorklistSearch(searchDraft)
    }, 200)
    return () => window.clearTimeout(t)
  }, [searchDraft, worklistSearch])

  const counts = React.useMemo(() => getCounts(), [])

  const visibleCases = React.useMemo(
    () => getWorklist({ filter: worklistFilter, search: worklistSearch }),
    [worklistFilter, worklistSearch],
  )

  // Per-invoice aging lookup for each visible case so we can render a range
  // (e.g., "35-42d") in the Aging column — pure derived, no store reads.
  const agingByCase = React.useMemo(() => {
    const map: Record<string, number[]> = {}
    for (const c of visibleCases) {
      const days: number[] = []
      for (const id of c.invoiceIds) {
        const inv = getOpenInvoice(id)
        if (inv) days.push(inv.agingDays)
      }
      map[c.id] = days
    }
    return map
  }, [visibleCases])

  function setFilter(next: WorklistFilter) {
    useCollectionsStore.getState().setWorklistFilter(next)
  }

  function clearFilters() {
    useCollectionsStore.getState().setWorklistFilter("all")
    useCollectionsStore.getState().setWorklistSearch("")
    setSearchDraft("")
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-1 flex-col overflow-hidden">
        <PageHeader
          title={`Worklist · ${counts.all} cases`}
          subtitle="Ranked by risk × value × recoverability"
        />

        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-5">
            {/* Filter chips + search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {MAIN_FILTERS.map((f) => (
                  <FilterChip
                    key={f.id}
                    label={f.label}
                    count={counts[f.id]}
                    active={worklistFilter === f.id}
                    onClick={() => setFilter(f.id)}
                  />
                ))}
                <span className="bg-border mx-1 h-4 w-px shrink-0" aria-hidden />
                {AGING_FILTERS.map((f) => (
                  <FilterChip
                    key={f.id}
                    label={f.label}
                    count={counts[f.id]}
                    active={worklistFilter === f.id}
                    onClick={() => setFilter(f.id)}
                  />
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <InputGroup className="w-72">
                  <InputGroupAddon>
                    <MagnifyingGlass size={16} />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search customer / inv #"
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                  />
                </InputGroup>
              </div>
            </div>

            {/* Table */}
            <div className="bg-card overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cases</TableHead>
                    <TableHead>Total $</TableHead>
                    <TableHead>Aging</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead aria-label="Action" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleCases.map((c) => (
                    <WorklistRow
                      key={c.id}
                      case={c}
                      agingDaysByInvoice={agingByCase[c.id] ?? []}
                    />
                  ))}
                </TableBody>
              </Table>

              {visibleCases.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center gap-3 p-10 text-center text-sm">
                  <span>No cases match. Try clearing filters.</span>
                  <Button variant="link" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
