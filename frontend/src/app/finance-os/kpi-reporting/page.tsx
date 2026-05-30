// app/neoflo-workspace/kpi-reporting/page.tsx
import { WorkflowPlaceholder } from "@/components/neoflo-os/workspace/workflow-placeholder"

export default function KpiReportingPage() {
  return (
    <WorkflowPlaceholder
      workflowName="KPI Reporting & Flux"
      description="Auto-drafted month-over-month flux explanations sourced from underlying transactions. Built for FP&A teams who want narrative-quality variance commentary."
    />
  )
}
