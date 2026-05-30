"use client"

// Client-only mapping of WorkflowIconKey strings to phosphor icon components.
// Lives in its own file so that lib/workflow-catalog.ts can be imported by server
// components without pulling phosphor's createContext-at-module-load into the
// server bundle.

import {
  ChatCircleText,
  FileMagnifyingGlass,
  ChartLineUp,
  Bank,
  HandCoins,
  Calculator,
  ChartPieSlice,
  Receipt,
  ClipboardText,
  ChartBar,
  UserCirclePlus,
  ShoppingCart,
  Airplane,
  ShieldCheck,
  Calendar,
  Stack,
  Newspaper,
  type Icon,
} from "@phosphor-icons/react"

import type { WorkflowIconKey } from "./workflow-catalog"

const ICONS: Record<WorkflowIconKey, Icon> = {
  ChatCircleText,
  FileMagnifyingGlass,
  ChartLineUp,
  Bank,
  HandCoins,
  Calculator,
  ChartPieSlice,
  Receipt,
  ClipboardText,
  ChartBar,
  UserCirclePlus,
  ShoppingCart,
  Airplane,
  ShieldCheck,
  Calendar,
  Stack,
  Newspaper,
}

export function getWorkflowIcon(key: WorkflowIconKey): Icon {
  return ICONS[key]
}
