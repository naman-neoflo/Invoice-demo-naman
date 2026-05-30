export type HelpdeskPrefix = "/workspace" | "/neoflo-workspace" | "/demo"

export function helpdeskInboxUrl(prefix: HelpdeskPrefix): string {
  return `${prefix}/helpdesk`
}

export function helpdeskInquiryUrl(
  prefix: HelpdeskPrefix,
  id: string
): string {
  return `${prefix}/helpdesk/inbox/${id}`
}

export function helpdeskAuditUrl(
  prefix: HelpdeskPrefix,
  id: string
): string {
  return `${prefix}/helpdesk/audit/${id}`
}

export function helpdeskIntegrationsUrl(prefix: HelpdeskPrefix): string {
  return `${prefix}/helpdesk/integrations`
}
