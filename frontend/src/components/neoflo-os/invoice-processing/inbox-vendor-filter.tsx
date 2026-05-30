// components/invoice-processing/inbox-vendor-filter.tsx
//
// Vendor multiselect popover for the inbox filter row. Checkbox per
// seeded vendor. Trigger shows "Vendors: All" when empty selection,
// "Vendors: N" when N selected. "Clear all" link inside when active.

"use client"

import * as React from "react"
import { Buildings } from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { Checkbox } from "@/components/neoflo-os/ui/checkbox"
import { Label } from "@/components/neoflo-os/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/neoflo-os/ui/popover"
import { SEED_VENDORS } from "@/lib/neoflo-os/invoice-processing/seed-vendors"

export function InboxVendorFilter({
  vendorIds,
  onChange,
}: {
  vendorIds: string[]
  onChange: (ids: string[]) => void
}) {
  function toggle(id: string) {
    if (vendorIds.includes(id)) {
      onChange(vendorIds.filter((v) => v !== id))
    } else {
      onChange([...vendorIds, id])
    }
  }

  const label =
    vendorIds.length === 0 ? "Vendors: All" : `Vendors: ${vendorIds.length}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Buildings size={14} />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-80 w-64 overflow-auto" align="start">
        <div className="flex flex-col gap-2">
          {vendorIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="self-start"
            >
              Clear all
            </Button>
          )}
          {SEED_VENDORS.map((v) => (
            <div key={v.id} className="flex items-center gap-2">
              <Checkbox
                id={`inbox-vf-${v.id}`}
                checked={vendorIds.includes(v.id)}
                onCheckedChange={() => toggle(v.id)}
              />
              <Label
                htmlFor={`inbox-vf-${v.id}`}
                className="cursor-pointer text-sm font-normal"
              >
                {v.name}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
