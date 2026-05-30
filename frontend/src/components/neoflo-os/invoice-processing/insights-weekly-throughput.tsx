// components/invoice-processing/insights-weekly-throughput.tsx
//
// Weekly throughput stacked-bar chart on the Insights page. Cohort
// view: invoices ingested per week, colored by current status.
//
// Recharts colors and axis styling follow the convention established
// in components/spend-analytics/trend-chart.tsx — rgb() literals
// instead of Tailwind tokens because recharts hands these straight to
// SVG attributes. Status tones inside chart marks are the documented
// data-viz exception to the house-style "no raw colors" rule.

"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card } from "@/components/neoflo-os/ui/card"
import { getWeeklyThroughput } from "@/lib/neoflo-os/invoice-processing/derive"

// Status palette — kept distinct from trend-chart's series colors so
// the two charts read as different concerns. Sky / violet / emerald /
// rose maps to extraction → in-review → approved → rejected, bottom
// to top in the stack.
const STATUS_COLORS = {
  extraction: "rgb(96, 165, 250)", // sky-400
  inReview: "rgb(167, 139, 250)", // violet-400
  approved: "rgb(16, 185, 129)", // emerald-500
  rejected: "rgb(244, 63, 94)", // rose-500
} as const

export function InsightsWeeklyThroughput({
  dateFrom,
  dateTo,
}: {
  dateFrom: string
  dateTo: string
}) {
  const data = React.useMemo(
    () => getWeeklyThroughput({ dateFrom, dateTo }),
    [dateFrom, dateTo]
  )

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-foreground text-sm font-semibold">
          Throughput by week
        </h3>
        <span className="text-muted-foreground text-xs">
          Invoices ingested · colored by current status
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgb(228, 228, 231)"
              strokeDasharray="2 4"
            />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11, fill: "rgb(115, 115, 115)" }}
              tickLine={false}
              axisLine={{ stroke: "rgb(228, 228, 231)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgb(115, 115, 115)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(115, 115, 115, 0.08)" }}
              contentStyle={{
                background: "white",
                border: "1px solid rgb(228, 228, 231)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar
              dataKey="extraction"
              stackId="a"
              fill={STATUS_COLORS.extraction}
              name="Extraction"
              isAnimationActive={false}
            />
            <Bar
              dataKey="inReview"
              stackId="a"
              fill={STATUS_COLORS.inReview}
              name="In review"
              isAnimationActive={false}
            />
            <Bar
              dataKey="approved"
              stackId="a"
              fill={STATUS_COLORS.approved}
              name="Approved"
              isAnimationActive={false}
            />
            <Bar
              dataKey="rejected"
              stackId="a"
              fill={STATUS_COLORS.rejected}
              name="Rejected"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
