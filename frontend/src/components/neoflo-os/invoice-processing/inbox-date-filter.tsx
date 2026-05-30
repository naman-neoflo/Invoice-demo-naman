// components/invoice-processing/inbox-date-filter.tsx
//
// Date-range popover for the inbox filter row. Two ISO date inputs +
// Apply / Clear. The trigger button shows the active range or
// "Date: All" when unset.

"use client"

import * as React from "react"
import { CalendarBlank } from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { Input } from "@/components/neoflo-os/ui/input"
import { Label } from "@/components/neoflo-os/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/neoflo-os/ui/popover"

export function InboxDateFilter({
  from,
  to,
  onChange,
}: {
  from: string | null
  to: string | null
  onChange: (from: string | null, to: string | null) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [draftFrom, setDraftFrom] = React.useState(from ?? "")
  const [draftTo, setDraftTo] = React.useState(to ?? "")

  // Keep local draft in sync if the store value mutates from another source.
  React.useEffect(() => {
    setDraftFrom(from ?? "")
    setDraftTo(to ?? "")
  }, [from, to])

  const label =
    from && to
      ? `${from} → ${to}`
      : from
      ? `from ${from}`
      : to
      ? `to ${to}`
      : "Date: All"

  function apply() {
    onChange(draftFrom || null, draftTo || null)
    setOpen(false)
  }

  function clear() {
    setDraftFrom("")
    setDraftTo("")
    onChange(null, null)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <CalendarBlank size={14} />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-72 flex-col gap-3" align="start">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inbox-date-from">From</Label>
          <Input
            id="inbox-date-from"
            type="date"
            value={draftFrom}
            onChange={(e) => setDraftFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inbox-date-to">To</Label>
          <Input
            id="inbox-date-to"
            type="date"
            value={draftTo}
            onChange={(e) => setDraftTo(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
