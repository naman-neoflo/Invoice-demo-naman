"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/neoflo-os/utils"

const SECTIONS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "Get started",
    items: [{ label: "Overview", href: "/catalog" }],
  },
  {
    title: "Tokens",
    items: [
      { label: "Colors", href: "/tokens/colors" },
      { label: "Typography", href: "/tokens/typography" },
      { label: "Spacing", href: "/tokens/spacing" },
      { label: "Radius", href: "/tokens/radius" },
    ],
  },
  {
    title: "Shared (neoflo)",
    items: [
      { label: "AppSidebar", href: "/catalog/app-sidebar" },
      { label: "PageHeader", href: "/catalog/page-header" },
      { label: "StatusBadge", href: "/catalog/status-badge" },
      { label: "KpiCard", href: "/catalog/kpi-card" },
      { label: "FilterChip", href: "/catalog/filter-chip" },
    ],
  },
  {
    title: "Form & input",
    items: [
      { label: "Button", href: "/catalog/button" },
      { label: "Input", href: "/catalog/input" },
      { label: "InputGroup", href: "/catalog/input-group" },
      { label: "InputOTP", href: "/catalog/input-otp" },
      { label: "Label", href: "/catalog/label" },
      { label: "Textarea", href: "/catalog/textarea" },
      { label: "Select", href: "/catalog/select" },
      { label: "Checkbox", href: "/catalog/checkbox" },
      { label: "RadioGroup", href: "/catalog/radio-group" },
      { label: "Switch", href: "/catalog/switch" },
      { label: "Slider", href: "/catalog/slider" },
      { label: "Toggle", href: "/catalog/toggle" },
      { label: "ToggleGroup", href: "/catalog/toggle-group" },
      { label: "Calendar", href: "/catalog/calendar" },
    ],
  },
  {
    title: "Layout & surfaces",
    items: [
      { label: "Card", href: "/catalog/card" },
      { label: "Separator", href: "/catalog/separator" },
      { label: "AspectRatio", href: "/catalog/aspect-ratio" },
      { label: "Resizable", href: "/catalog/resizable" },
      { label: "ScrollArea", href: "/catalog/scroll-area" },
      { label: "Sheet", href: "/catalog/sheet" },
      { label: "Drawer", href: "/catalog/drawer" },
      { label: "Sidebar", href: "/catalog/sidebar" },
      { label: "Skeleton", href: "/catalog/skeleton" },
    ],
  },
  {
    title: "Data display",
    items: [
      { label: "Table", href: "/catalog/table" },
      { label: "Avatar", href: "/catalog/avatar" },
      { label: "Badge", href: "/catalog/badge" },
      { label: "Chart", href: "/catalog/chart" },
      { label: "Progress", href: "/catalog/progress" },
      { label: "Pagination", href: "/catalog/pagination" },
      { label: "Breadcrumb", href: "/catalog/breadcrumb" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Tabs", href: "/catalog/tabs" },
      { label: "Accordion", href: "/catalog/accordion" },
      { label: "Collapsible", href: "/catalog/collapsible" },
      { label: "NavigationMenu", href: "/catalog/navigation-menu" },
      { label: "Menubar", href: "/catalog/menubar" },
      { label: "Carousel", href: "/catalog/carousel" },
    ],
  },
  {
    title: "Overlays",
    items: [
      { label: "Dialog", href: "/catalog/dialog" },
      { label: "AlertDialog", href: "/catalog/alert-dialog" },
      { label: "Alert", href: "/catalog/alert" },
      { label: "Popover", href: "/catalog/popover" },
      { label: "HoverCard", href: "/catalog/hover-card" },
      { label: "Tooltip", href: "/catalog/tooltip" },
      { label: "DropdownMenu", href: "/catalog/dropdown-menu" },
      { label: "ContextMenu", href: "/catalog/context-menu" },
      { label: "Command", href: "/catalog/command" },
      { label: "Sonner (toast)", href: "/catalog/sonner" },
    ],
  },
]

export function CatalogNav() {
  const pathname = usePathname()

  return (
    <aside className="bg-background sticky top-0 hidden h-svh w-60 shrink-0 overflow-y-auto border-r lg:block">
      <div className="px-4 pb-8 pt-6">
        <Link
          href="/catalog"
          className="text-foreground block px-2 text-sm font-semibold tracking-tight"
        >
          Library
        </Link>
        <p className="text-muted-foreground mt-0.5 px-2 text-xs">
          neoflo design system
        </p>
      </div>

      <nav className="space-y-6 px-2 pb-12">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-muted-foreground mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider">
              {section.title}
            </h3>
            <ul className="space-y-px">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-md px-2 py-1 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
