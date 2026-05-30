// lib/workspace/workflow-icons.ts
"use client"

// Client-only mapping of PhosphorIconKey strings to phosphor icon components.
// Lives in its own file so that other lib/workspace/* modules can be imported by
// server components without pulling phosphor's createContext-at-module-load into
// the server bundle.

import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import {
  ShieldWarning,
  HandCoins,
  Calendar,
  ChatCircleText,
  PaperPlaneTilt,
  CheckCircle,
  Sparkle,
  ChartLineUp,
  FileMagnifyingGlass,
  Bank,
  ChartPieSlice,
  Receipt,
  ChartBar,
  CornersOut,
  Calculator,
} from "@phosphor-icons/react"

export type PhosphorIconKey =
  | "ShieldWarning"
  | "HandCoins"
  | "Calendar"
  | "ChatCircleText"
  | "PaperPlaneTilt"
  | "CheckCircle"
  | "Sparkle"
  | "ChartLineUp"
  | "FileMagnifyingGlass"
  | "Bank"
  | "ChartPieSlice"
  | "Receipt"
  | "ChartBar"
  | "CornersOut"
  | "Calculator"

const REGISTRY: Record<PhosphorIconKey, PhosphorIcon> = {
  ShieldWarning,
  HandCoins,
  Calendar,
  ChatCircleText,
  PaperPlaneTilt,
  CheckCircle,
  Sparkle,
  ChartLineUp,
  FileMagnifyingGlass,
  Bank,
  ChartPieSlice,
  Receipt,
  ChartBar,
  CornersOut,
  Calculator,
}

export function getIcon(key: PhosphorIconKey): PhosphorIcon {
  return REGISTRY[key]
}
