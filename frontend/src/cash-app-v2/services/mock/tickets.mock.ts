/**
 * Support Tickets - Mock Service Layer
 */

import { getMockTickets, getMockTicketComments } from '../../data/ticketsData'
import type { Ticket, TicketComment, TicketStats, TicketStatus, TicketCategory, TicketPriority } from '../../types/domain'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================================================
// FILTERS
// ============================================================================

interface TicketFilters {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  category?: TicketCategory[]
  pspId?: string[]
  assignee?: string[]
  slaBreach?: boolean
  search?: string
}

// ============================================================================
// SERVICE
// ============================================================================

export const ticketsService = {
  /**
   * Get tickets with optional filters
   */
  async getTickets(filters: TicketFilters = {}): Promise<Ticket[]> {
    await delay(200)

    let tickets = getMockTickets()

    if (filters.status && filters.status.length > 0) {
      tickets = tickets.filter(t => filters.status!.includes(t.status))
    }

    if (filters.priority && filters.priority.length > 0) {
      tickets = tickets.filter(t => filters.priority!.includes(t.priority))
    }

    if (filters.category && filters.category.length > 0) {
      tickets = tickets.filter(t => filters.category!.includes(t.category))
    }

    if (filters.pspId && filters.pspId.length > 0) {
      tickets = tickets.filter(t => filters.pspId!.includes(t.pspId))
    }

    if (filters.assignee && filters.assignee.length > 0) {
      tickets = tickets.filter(t => filters.assignee!.includes(t.assignee))
    }

    if (filters.slaBreach !== undefined) {
      tickets = tickets.filter(t => t.slaBreach === filters.slaBreach)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      tickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower) ||
        t.pspName.toLowerCase().includes(searchLower)
      )
    }

    return tickets
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(id: string): Promise<Ticket | null> {
    await delay(150)
    const tickets = getMockTickets()
    return tickets.find(t => t.id === id) || null
  },

  /**
   * Get ticket statistics
   */
  async getTicketStats(): Promise<TicketStats> {
    await delay(200)

    const tickets = getMockTickets()

    const byPsp: Record<string, number> = {}
    const byCategory: Record<string, number> = {}

    tickets.forEach(t => {
      byPsp[t.pspId] = (byPsp[t.pspId] || 0) + 1
      byCategory[t.category] = (byCategory[t.category] || 0) + 1
    })

    const openStatuses: TicketStatus[] = ['open', 'in_progress', 'pending_psp', 'escalated']
    const openTickets = tickets.filter(t => openStatuses.includes(t.status))

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      pendingPsp: tickets.filter(t => t.status === 'pending_psp').length,
      escalated: tickets.filter(t => t.status === 'escalated').length,
      slaBreach: tickets.filter(t => t.slaBreach).length,
      avgResolutionTime: '2.4 days',
      byPsp,
      byCategory,
    }
  },

  /**
   * Get comments for a ticket
   */
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    await delay(150)
    return getMockTicketComments(ticketId)
  },

  /**
   * Get open tickets (convenience method)
   */
  async getOpenTickets(): Promise<Ticket[]> {
    return this.getTickets({
      status: ['open', 'in_progress', 'pending_psp', 'escalated']
    })
  },

  /**
   * Get SLA breached tickets
   */
  async getSlaBreachedTickets(): Promise<Ticket[]> {
    return this.getTickets({ slaBreach: true })
  },
}
