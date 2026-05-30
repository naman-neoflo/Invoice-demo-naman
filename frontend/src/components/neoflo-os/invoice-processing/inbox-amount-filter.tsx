// components/invoice-processing/inbox-amount-filter.tsx
//
// Amount-bucket dropdown for the inbox filter row. 5 mutually exclusive
// quick chips. Lives in a DropdownMenu (not a Popover) because the
// choices are pre-defined — no inputs needed.

"use client"

import * as React from "react"
import { CurrencyDollar } from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/neoflo-os/ui/dropdown-menu"

export type AmountBucket = "all" | "lt-1k" | "1k-10k" | "10k-50k" | "gt-50k"

const LABELS: Record<AmountBucket, string> = {
  all: "All amounts",
  "lt-1k": "< $1K",
  "1k-10k": "$1K – $10K",
  "10k-50k": "$10K – $50K",
  "gt-50k": "$50K +",
}

const ORDER: AmountBucket[] = ["all", "lt-1k", "1k-10k", "10k-50k", "gt-50k"]

export function InboxAmountFilter({
  value,
  onChange,
}: {
  value: AmountBucket
  onChange: (b: AmountBucket) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <CurrencyDollar size={14} />
          {value === "all" ? "Amount: All" : LABELS[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {ORDER.map((b) => (
          <DropdownMenuItem key={b} onSelect={() => onChange(b)}>
            {LABELS[b]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
