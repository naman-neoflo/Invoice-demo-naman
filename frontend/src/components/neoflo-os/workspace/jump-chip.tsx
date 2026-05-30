// components/workspace/jump-chip.tsx
import * as React from "react"
import { Link } from "next-view-transitions"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/neoflo-os/utils"

interface JumpChipProps {
  icon: PhosphorIcon
  label: string
  iconText: string
  href: string
  className?: string
}

export function JumpChip({ icon: Icon, label, iconText, href, className }: JumpChipProps) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-card hover:border-primary/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        className
      )}
    >
      <Icon size={12} className={iconText} weight="regular" />
      {label}
    </Link>
  )
}
