import * as React from "react"
import { cn } from "@/lib/neoflo-os/utils"

export function CatalogPage({
  title,
  description,
  children,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        )}
      </header>
      {children}
    </article>
  )
}

export function CatalogSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <h2 className="text-foreground text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

export function Showcase({
  preview,
  code,
  className,
  previewClassName,
}: {
  preview: React.ReactNode
  code?: string
  className?: string
  previewClassName?: string
}) {
  return (
    <div
      className={cn(
        "border-border bg-card overflow-hidden rounded-lg border",
        className
      )}
    >
      <div
        className={cn(
          "bg-muted/30 flex min-h-[140px] flex-wrap items-center justify-center gap-3 p-8",
          previewClassName
        )}
      >
        {preview}
      </div>
      {code && (
        <pre className="border-border bg-card text-foreground/80 overflow-x-auto border-t p-4 text-[12px] leading-relaxed">
          <code className="font-mono">{code}</code>
        </pre>
      )}
    </div>
  )
}

export function PropsTable({
  rows,
}: {
  rows: { name: string; type: string; default?: string; description: string }[]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b">
            <th className="text-foreground px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">
              Prop
            </th>
            <th className="text-foreground px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">
              Type
            </th>
            <th className="text-foreground px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">
              Default
            </th>
            <th className="text-foreground px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b last:border-0">
              <td className="text-foreground px-4 py-2 font-mono text-xs">
                {row.name}
              </td>
              <td className="text-muted-foreground px-4 py-2 font-mono text-xs">
                {row.type}
              </td>
              <td className="text-muted-foreground px-4 py-2 font-mono text-xs">
                {row.default ?? "—"}
              </td>
              <td className="text-foreground px-4 py-2 text-xs">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
