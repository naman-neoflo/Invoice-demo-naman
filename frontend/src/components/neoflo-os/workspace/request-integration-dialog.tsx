// components/workspace/request-integration-dialog.tsx
//
// Modal form behind the "Request integration" CTA on the integrations
// pages (both /workspace and /neoflo-workspace). Captures the integration
// the user wants Neoflo to build next + their use case, then mock-sends
// to integrations@neoflo.ai (toast confirmation; no actual mail).
//
// Demo-quality: no real backend, no validation library — just native
// HTML required attrs + a toast on submit.
"use client"

import * as React from "react"
import { CheckCircle, EnvelopeSimple, PaperPlaneTilt } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/neoflo-os/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Input } from "@/components/neoflo-os/ui/input"
import { Label } from "@/components/neoflo-os/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/neoflo-os/ui/select"
import { Textarea } from "@/components/neoflo-os/ui/textarea"

const REQUEST_EMAIL = "integrations@neoflo.ai"

const CATEGORY_OPTIONS = [
  { value: "erp", label: "ERP" },
  { value: "procurement", label: "Procurement" },
  { value: "banks", label: "Banks" },
  { value: "payments", label: "Payments" },
  { value: "crm", label: "CRM" },
  { value: "tax-compliance", label: "Tax & Compliance" },
  { value: "communications", label: "Communications" },
  { value: "other", label: "Other / not sure" },
]

interface RequestIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestIntegrationDialog({
  open,
  onOpenChange,
}: RequestIntegrationDialogProps) {
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState<string>("")
  const [useCase, setUseCase] = React.useState("")
  const [requesterName, setRequesterName] = React.useState("Jamie Doe")
  const [requesterEmail, setRequesterEmail] = React.useState(
    "jamie@acmeco.com",
  )
  const [submitting, setSubmitting] = React.useState(false)

  // Clear the form whenever the dialog re-opens so we start fresh.
  React.useEffect(() => {
    if (!open) return
    setName("")
    setCategory("")
    setUseCase("")
    setSubmitting(false)
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!name.trim() || !useCase.trim() || !category) return

    setSubmitting(true)
    // Mock the network send. ~700ms feels like a real submit, not instant.
    window.setTimeout(() => {
      toast.success(`Request sent to ${REQUEST_EMAIL}`, {
        description: `We'll reach out to ${requesterEmail} within 2 business days about ${name}.`,
        icon: <CheckCircle size={16} weight="fill" className="text-emerald-500" />,
      })
      onOpenChange(false)
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EnvelopeSimple size={18} weight="regular" className="text-primary" />
            Request integration
          </DialogTitle>
          <DialogDescription>
            Tell us what you need Neoflo to connect to and we&apos;ll get
            back to you. Sends to{" "}
            <span className="text-foreground font-medium">{REQUEST_EMAIL}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-integration-name">
              Integration name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="request-integration-name"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stripe, Adyen, Workday"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-integration-category">
              Category <span className="text-rose-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="request-integration-category">
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-integration-usecase">
              Use case <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="request-integration-usecase"
              required
              rows={3}
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="What workflow needs it? What would Neoflo read or post?"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="request-integration-name-you">Your name</Label>
              <Input
                id="request-integration-name-you"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="request-integration-email-you">Your email</Label>
              <Input
                id="request-integration-email-you"
                type="email"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting || !name.trim() || !useCase.trim() || !category
              }
            >
              <PaperPlaneTilt size={14} weight="bold" />
              {submitting ? "Sending…" : `Send to ${REQUEST_EMAIL}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
