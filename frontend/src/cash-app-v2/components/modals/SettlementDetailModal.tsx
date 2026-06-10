/**
 * Settlement Detail Modal
 * 3-Level Drill-Down: Bank Credit → PSP Settlements → Transaction Lines
 *
 * Shows:
 * - Bank credit summary
 * - Matched PSP settlements (expandable accordions)
 * - Gross-to-net waterfall for each settlement
 * - Transaction line items
 * - Reconciliation summary and variance analysis
 */

import React, { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronRight, AlertCircle, CheckCircle, TrendingDown, Ticket, MessageSquare, Clock, Table2, BookOpen } from 'lucide-react'
import { ticketsService } from '../../services'
import type { Ticket as TicketType, SettlementPayoutDetail } from '../../types/domain'
import type { BankCreditRecordDetail } from '../../types/domain'
import type { JournalEntry, ApprovalMetadata } from '../../types/exceptions'
import { Badge, type BadgeVariant } from '../ui/Badge'
import { WaterfallChart } from '../ui/WaterfallChart'
import { JournalEntryPreviewModal } from './JournalEntryPreviewModal'
import { TransactionLinesComparisonModal } from './TransactionLinesComparisonModal'
import { AccountingEntriesModal } from './AccountingEntriesModal'

interface SettlementDetailModalProps {
  credit: BankCreditRecordDetail | null
  isOpen: boolean
  onClose: () => void
  onAction: (action: string, creditId: string, data?: any) => void
}

export const SettlementDetailModal: React.FC<SettlementDetailModalProps> = ({
  credit,
  isOpen,
  onClose,
  onAction
}) => {
  const [expandedSettlements, setExpandedSettlements] = useState<Set<string>>(new Set())
  const [showTransactions, setShowTransactions] = useState<Set<string>>(new Set())
  const [relatedTickets, setRelatedTickets] = useState<TicketType[]>([])
  const [showVarianceJournalModal, setShowVarianceJournalModal] = useState(false)
  const [showL2ComparisonModal, setShowL2ComparisonModal] = useState(false)
  const [selectedSettlementForComparison, setSelectedSettlementForComparison] = useState<SettlementPayoutDetail | null>(null)
  const [showAccountingModal, setShowAccountingModal] = useState(false)
  const [loadingL2Modal, setLoadingL2Modal] = useState(false)
  const [loadingAccountingModal, setLoadingAccountingModal] = useState(false)

  // Check if accounting entries are available
  const hasAccountingEntries = credit?.accountingEntries && credit.accountingEntries.journalEntries.length > 0

  // Handler for opening L2 comparison modal with delay
  const handleOpenL2Modal = async (settlement: SettlementPayoutDetail) => {
    setLoadingL2Modal(true)
    setSelectedSettlementForComparison(settlement)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000)) // 2-3s delay
    setLoadingL2Modal(false)
    setShowL2ComparisonModal(true)
  }

  // Handler for opening accounting modal with delay
  const handleOpenAccountingModal = async () => {
    setLoadingAccountingModal(true)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000)) // 2-3s delay
    setLoadingAccountingModal(false)
    setShowAccountingModal(true)
  }

  // Fetch related tickets when modal opens
  useEffect(() => {
    const fetchRelatedTickets = async () => {
      if (isOpen && credit) {
        try {
          const allTickets = await ticketsService.getTickets({})
          // Filter tickets that reference this bank credit
          const related = allTickets.filter(t =>
            t.relatedRecordId === credit.id ||
            t.relatedRecordId?.includes(credit.id.split('-').slice(-1)[0]) // Match by credit number suffix
          )
          setRelatedTickets(related)
        } catch (error) {
          console.error('Failed to fetch related tickets:', error)
        }
      }
    }
    fetchRelatedTickets()
  }, [isOpen, credit])

  if (!isOpen || !credit) return null

  // Toggle settlement accordion
  const toggleSettlement = (payoutRef: string) => {
    const newExpanded = new Set(expandedSettlements)
    if (newExpanded.has(payoutRef)) {
      newExpanded.delete(payoutRef)
      // Also hide transactions when collapsing settlement
      const newShowTxn = new Set(showTransactions)
      newShowTxn.delete(payoutRef)
      setShowTransactions(newShowTxn)
    } else {
      newExpanded.add(payoutRef)
    }
    setExpandedSettlements(newExpanded)
  }

  // Toggle transaction table visibility
  const toggleTransactions = (payoutRef: string) => {
    const newShowTxn = new Set(showTransactions)
    if (newShowTxn.has(payoutRef)) {
      newShowTxn.delete(payoutRef)
    } else {
      newShowTxn.add(payoutRef)
    }
    setShowTransactions(newShowTxn)
  }

  // Calculate settlement totals
  const settlementSum = credit.matchedSettlements.reduce((sum, s) => sum + (s.settlementTotal || 0), 0)
  const variance = credit.amount - settlementSum
  const variancePercent = credit.amount > 0 ? (variance / credit.amount) * 100 : 0

  const formatCurrency = (amount: number, currency: string = credit.currency): string => {
    if (currency === 'IDR') {
      return `${currency} ${(amount / 1000000).toFixed(2)}M`
    }
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'reconciled':
        return 'matched'
      case 'matched_l1':
        return 'in_transit'
      case 'unmatched':
        return 'exception'
      case 'partial':
        return 'pending'
      default:
        return 'pending'
    }
  }

  const getMatchStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'matched':
        return 'matched'
      case 'unmatched':
        return 'exception'
      case 'mismatched':
        return 'pending'
      default:
        return 'pending'
    }
  }

  // Group settlements by PSP for better display
  const groupedSettlements = credit.matchedSettlements.reduce((acc, settlement) => {
    if (!acc[settlement.pspId]) {
      acc[settlement.pspId] = []
    }
    acc[settlement.pspId].push(settlement)
    return acc
  }, {} as Record<string, typeof credit.matchedSettlements>)

  const uniquePSPs = Object.keys(groupedSettlements)

  return (
    <div
      className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#101828', marginBottom: 2 }}>
              Bank Credit Detail
            </h2>
            <p style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>
              {credit.id} • {formatDate(credit.valueDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Bank Credit Summary Card */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                Bank Account
              </p>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#101828', fontFamily: 'monospace' }}>
                {credit.bankAccount}
              </p>
              <p style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>
                {formatDate(credit.valueDate)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                Credit Amount
              </p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', fontFamily: 'monospace' }}>
                {formatCurrency(credit.amount)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                PSP
              </p>
              <div className="flex items-center gap-1.5">
                {credit.mappedPSP ? (
                  <>
                    <Badge variant="in_transit">{credit.mappedPSP.toUpperCase()}</Badge>
                    <span style={{ fontSize: 9, color: '#64748b' }}>
                      {credit.mappingConfidence}%
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>—</span>
                )}
              </div>
              {uniquePSPs.length > 1 && (
                <p style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>
                  Multiple ({uniquePSPs.join(', ')})
                </p>
              )}
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                Status
              </p>
              <Badge variant={getStatusBadgeVariant(credit.reconciliationStatus)}>
                {credit.reconciliationStatus.toUpperCase().replace('_', ' ')}
              </Badge>
              <p style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>
                Age: {credit.age}
              </p>
            </div>
          </div>

          {/* Reconciliation Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <h3 style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase' }}>
              Reconciliation Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                  Bank Credit
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0369a1', fontFamily: 'monospace' }}>
                  {formatCurrency(credit.amount)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                  Settlement Total
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#475569', fontFamily: 'monospace' }}>
                  {formatCurrency(settlementSum)}
                </p>
                <p style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>
                  {credit.matchedSettlements.length} settlement{credit.matchedSettlements.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                  Variance
                </p>
                <p style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: Math.abs(variance) < 0.01 ? '#059669' : Math.abs(variancePercent) < 0.5 ? '#d97706' : '#dc2626',
                  fontFamily: 'monospace'
                }}>
                  {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                </p>
                <p style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>
                  {variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(2)}%
                  {Math.abs(variancePercent) < 0.5 && ' ✓ Within tolerance'}
                </p>
              </div>
            </div>
          </div>

          {/* Matched Settlements Section */}
          {credit.matchedSettlements.length > 0 ? (
            <div>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: '#101828', marginBottom: 8 }}>
                Matched Settlements ({credit.matchedSettlements.length})
              </h3>

              <div className="space-y-2">
                {credit.matchedSettlements.map((settlement) => {
                  const isExpanded = expandedSettlements.has(settlement.payoutRef)
                  const showTxn = showTransactions.has(settlement.payoutRef)

                  return (
                    <div key={settlement.payoutRef} className="border border-slate-200 rounded-lg overflow-hidden">
                      {/* Settlement Summary Row - Clickable */}
                      <div
                        className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => toggleSettlement(settlement.payoutRef)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {/* Expand/Collapse Icon */}
                          <div className="text-slate-400">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>

                          {/* PSP Badge */}
                          <Badge variant="in_transit">{settlement.pspName}</Badge>

                          {/* Payout Ref */}
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#0ea5e9', fontWeight: 600 }}>
                            {settlement.payoutRef}
                          </span>

                          {/* Order Count */}
                          {settlement.orderCount > 0 && (
                            <span style={{ fontSize: 9, color: '#64748b' }}>
                              • {settlement.orderCount.toLocaleString()} orders
                            </span>
                          )}

                          {/* Settlement Date */}
                          <span style={{ fontSize: 9, color: '#94a3b8' }}>
                            • {formatDate(settlement.date)}
                          </span>
                        </div>

                        {/* Net Amount */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>
                              Net Amount
                            </p>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', fontFamily: 'monospace' }}>
                              {formatCurrency(settlement.settlementTotal || 0, settlement.currency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content - Waterfall + Transactions */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-slate-50 p-3">
                          {/* Gross-to-Net Waterfall */}
                          <WaterfallChart
                            waterfall={settlement.grossToNet}
                            currency={settlement.currency}
                            compact={false}
                          />

                          {/* Transaction Lines Toggle */}
                          {settlement.orderLines && settlement.orderLines.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleTransactions(settlement.payoutRef)
                                }}
                                className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                                style={{ fontSize: 10, fontWeight: 600, color: '#475569' }}
                              >
                                {showTxn ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                {showTxn ? 'Hide' : 'View'} Transaction Lines ({settlement.orderLines.length})
                              </button>

                              {/* Transaction Table */}
                              {showTxn && (
                                <div className="mt-3 overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="border-b border-slate-300 bg-white">
                                        <th style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 8px' }}>
                                          PSP Txn ID
                                        </th>
                                        <th style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 8px' }}>
                                          Order ID
                                        </th>
                                        <th style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 8px', textAlign: 'right' }}>
                                          Gross
                                        </th>
                                        <th style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 8px', textAlign: 'right' }}>
                                          MDR
                                        </th>
                                        <th style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 8px', textAlign: 'right' }}>
                                          Net
                                        </th>
                                        <th style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 8px' }}>
                                          Status
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {settlement.orderLines.map((line, index) => {
                                        const isSummaryRow = line.pspTxnId.startsWith('...')
                                        return (
                                          <tr
                                            key={line.pspTxnId}
                                            className={`border-b border-slate-200 ${isSummaryRow ? 'bg-sky-50 font-semibold' : 'hover:bg-white'} transition-colors`}
                                          >
                                            <td style={{ fontSize: 9, fontFamily: 'monospace', color: isSummaryRow ? '#0369a1' : '#0ea5e9', padding: '6px 8px', fontWeight: isSummaryRow ? 600 : 400 }}>
                                              {line.pspTxnId}
                                            </td>
                                            <td style={{ fontSize: 9, fontFamily: 'monospace', color: '#475569', padding: '6px 8px', fontStyle: isSummaryRow ? 'italic' : 'normal' }}>
                                              {line.orderId || '—'}
                                            </td>
                                            <td style={{ fontSize: 9, fontFamily: 'monospace', color: '#475569', padding: '6px 8px', textAlign: 'right', fontWeight: isSummaryRow ? 700 : 400 }}>
                                              {formatCurrency(line.gross, settlement.currency)}
                                            </td>
                                            <td style={{ fontSize: 9, fontFamily: 'monospace', color: '#dc2626', padding: '6px 8px', textAlign: 'right', fontWeight: isSummaryRow ? 700 : 400 }}>
                                              {formatCurrency(line.mdr, settlement.currency)}
                                            </td>
                                            <td style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: isSummaryRow ? 700 : 600, color: '#0369a1', padding: '6px 8px', textAlign: 'right' }}>
                                              {formatCurrency(line.net, settlement.currency)}
                                            </td>
                                            <td style={{ padding: '6px 8px' }}>
                                              {!isSummaryRow && (
                                                <Badge variant={getMatchStatusBadgeVariant(line.matchStatus)}>
                                                  {line.matchStatus}
                                                </Badge>
                                              )}
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // No Settlements Found
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <AlertCircle size={24} className="text-amber-600 mx-auto mb-2" />
              <h3 style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                No Settlements Matched
              </h3>
              <p style={{ fontSize: 10, color: '#78350f' }}>
                This bank credit has not been matched to any settlement reports yet.
              </p>
            </div>
          )}

          {/* Related Exceptions (if any) */}
          {credit.exceptions && credit.exceptions.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 style={{ fontSize: 10, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>
                    🔗 Related Exceptions ({credit.exceptions.length})
                  </h3>
                  <div className="space-y-1.5">
                    {credit.exceptions.map((exception, index) => (
                      <a
                        key={index}
                        href={`/cash-app-v2/exceptions?exceptionId=${exception.id}`}
                        className="flex items-center justify-between p-2 bg-white rounded border border-red-300 hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer group"
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = `/cash-app-v2/exceptions?exceptionId=${exception.id}`
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                            <AlertCircle size={12} className="text-red-700" />
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 600, color: '#991b1b' }}>
                              {exception.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </p>
                            <p style={{ fontSize: 9, color: '#7f1d1d' }}>
                              Ref: {exception.referenceId}
                            </p>
                            <p style={{ fontSize: 9, color: '#991b1b', fontFamily: 'monospace', marginTop: 1 }}>
                              {exception.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={exception.status === 'open' ? 'exception' : exception.status === 'escalated' ? 'pending' : 'matched'}>
                            {exception.status.toUpperCase().replace('_', ' ')}
                          </Badge>
                          <span className="text-red-600 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <p style={{ fontSize: 9, color: '#7f1d1d' }}>
                      💡 Click to view full exception details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Tickets (if any) */}
          {relatedTickets.length > 0 && (
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Ticket size={14} className="text-sky-600 mt-0.5" />
                <div className="flex-1">
                  <h3 style={{ fontSize: 10, fontWeight: 700, color: '#0369a1', marginBottom: 8 }}>
                    🎫 Related Tickets ({relatedTickets.length})
                  </h3>
                  <div className="space-y-1.5">
                    {relatedTickets.map((ticket) => (
                      <a
                        key={ticket.id}
                        href={`/cash-app-v2/audit?tab=tickets&ticketId=${ticket.id}`}
                        className="flex items-center justify-between p-2 bg-white rounded border border-sky-300 hover:border-sky-500 hover:bg-sky-50 transition-all cursor-pointer group"
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = `/cash-app-v2/audit?tab=tickets&ticketId=${ticket.id}`
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-sky-100 flex items-center justify-center">
                            <MessageSquare size={12} className="text-sky-700" />
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 600, color: '#0369a1' }}>
                              {ticket.subject}
                            </p>
                            <p style={{ fontSize: 9, color: '#0c4a6e' }}>
                              {ticket.pspName} • {ticket.responseCount} messages
                            </p>
                            <p style={{ fontSize: 9, color: '#0369a1', fontFamily: 'monospace', marginTop: 1 }}>
                              {ticket.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 3,
                              backgroundColor: ticket.status === 'escalated' ? '#fee2e2' : ticket.status === 'in_progress' ? '#ffedd5' : ticket.status === 'pending_psp' ? '#ede9fe' : '#e0f2fe',
                              color: ticket.status === 'escalated' ? '#dc2626' : ticket.status === 'in_progress' ? '#c2410c' : ticket.status === 'pending_psp' ? '#7c3aed' : '#0369a1',
                              textTransform: 'uppercase',
                            }}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                          {ticket.slaBreach && (
                            <span style={{ fontSize: 8, fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Clock size={10} /> SLA BREACH
                            </span>
                          )}
                          <span className="text-sky-600 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-sky-200">
                    <p style={{ fontSize: 9, color: '#0c4a6e' }}>
                      💡 Click to view full ticket conversation and history
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex gap-2">
              {/* Context-Sensitive Actions */}
              {/* Reconciled credits: Show View Transaction Lines and Accounting Entries buttons */}
              {credit.reconciliationStatus === 'reconciled' && credit.matchedSettlements.length > 0 && (
                <>
                  <button
                    onClick={() => handleOpenL2Modal(credit.matchedSettlements[0])}
                    disabled={loadingL2Modal}
                    className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                      loadingL2Modal
                        ? 'bg-sky-400 text-white cursor-wait'
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                    style={{ fontSize: 10, fontWeight: 600 }}
                  >
                    {loadingL2Modal ? (
                      <>
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Table2 size={12} />
                        View Transaction Lines
                      </>
                    )}
                  </button>
                  {hasAccountingEntries && (
                    <button
                      onClick={handleOpenAccountingModal}
                      disabled={loadingAccountingModal}
                      className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                        loadingAccountingModal
                          ? 'bg-emerald-400 text-white cursor-wait'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                      style={{ fontSize: 10, fontWeight: 600 }}
                    >
                      {loadingAccountingModal ? (
                        <>
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <BookOpen size={12} />
                          View Accounting Entries
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              {credit.reconciliationStatus === 'matched_l1' && (
                <button
                  onClick={() => onAction('reconcile_l1', credit.id)}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  <CheckCircle size={12} className="inline mr-1.5" />
                  Reconcile L1
                </button>
              )}

              {credit.reconciliationStatus === 'unmatched_no_psp_file' && (
                <>
                  <button
                    onClick={() => onAction('internal_investigate', credit.id)}
                    className="px-3 py-1.5 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
                    style={{ fontSize: 10, fontWeight: 600 }}
                  >
                    Internal Investigate
                  </button>
                  <button
                    onClick={() => onAction('upload_psp_file', credit.id)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                    style={{ fontSize: 10, fontWeight: 600 }}
                  >
                    Upload PSP Settlement File
                  </button>
                </>
              )}

              {credit.reconciliationStatus === 'unmatched_variance' && (
                <>
                  <button
                    onClick={() => setShowVarianceJournalModal(true)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                    style={{ fontSize: 10, fontWeight: 600 }}
                  >
                    <CheckCircle size={12} className="inline mr-1.5" />
                    Accept Variance & Post
                  </button>
                  <button
                    onClick={() => onAction('raise_query', credit.id)}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                    style={{ fontSize: 10, fontWeight: 600 }}
                  >
                    Raise Query
                  </button>
                </>
              )}

              {credit.reconciliationStatus === 'partial' && (
                <button
                  onClick={() => onAction('resolve_partial', credit.id)}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  Resolve Partial Match
                </button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onAction('export', credit.id)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                Export Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* L1 Variance Journal Entry Modal */}
      {showVarianceJournalModal && credit.reconciliationStatus === 'unmatched_variance' && (
        <JournalEntryPreviewModal
          isOpen={showVarianceJournalModal}
          onClose={() => setShowVarianceJournalModal(false)}
          onConfirm={() => {
            setShowVarianceJournalModal(false)
            onAction('accept_l1_variance', credit.id, {
              variance: credit.l1Variance,
              journalEntries: getL1VarianceJournalEntries(credit),
              requiresApproval: true
            })
          }}
          actionLabel="Accept L1 Variance & Post to GL"
          exceptionId={credit.id}
          amount={Math.abs(credit.l1Variance)}
          currency={credit.currency}
          journalEntries={getL1VarianceJournalEntries(credit)}
          approval={{
            approvalRequired: true,
            approvalReason: 'L1 variance acceptance requires manager approval before GL posting',
            approvalThreshold: {
              rule: 'variance_acceptance',
              description: 'All L1 settlement variances require approval'
            },
            approvalLevel: 'manager'
          }}
        />
      )}

      {/* L2 Transaction Lines Comparison Modal */}
      {showL2ComparisonModal && selectedSettlementForComparison && (
        <TransactionLinesComparisonModal
          isOpen={showL2ComparisonModal}
          onClose={() => {
            setShowL2ComparisonModal(false)
            setSelectedSettlementForComparison(null)
          }}
          settlement={selectedSettlementForComparison}
          currency={credit.currency}
          credit={credit}
        />
      )}

      {/* Accounting Entries Modal */}
      {hasAccountingEntries && credit?.accountingEntries && (
        <AccountingEntriesModal
          isOpen={showAccountingModal}
          onClose={() => setShowAccountingModal(false)}
          creditId={credit.id}
          creditAmount={credit.amount}
          currency={credit.currency}
          journalEntries={credit.accountingEntries.journalEntries}
          postedDate={credit.accountingEntries.postedDate}
          postedBy={credit.accountingEntries.postedBy}
        />
      )}
    </div>
  )
}

/**
 * Generate journal entries for L1 variance booking
 * When Bank Credit > PSP Net: Book the difference as PSP Fee Recovery / Suspense
 * When Bank Credit < PSP Net: Book the difference as Settlement Variance Expense
 */
function getL1VarianceJournalEntries(credit: BankCreditRecordDetail): JournalEntry[] {
  const variance = credit.l1Variance
  const absVariance = Math.abs(variance)
  const today = new Date().toISOString().split('T')[0]

  if (variance > 0) {
    // Bank received MORE than PSP reported (positive variance)
    // This could be a fee recovery or PSP underpayment correction
    return [{
      entryNumber: 1,
      description: `L1 Variance - Bank Credit exceeds PSP Net for ${credit.id}`,
      postingDate: today,
      documentType: 'variance_adjustment',
      lines: [
        {
          lineNumber: 1,
          account: '1100',
          accountName: 'Bank - Settlement Account',
          debitCredit: 'debit',
          amount: absVariance,
          currency: credit.currency,
          reference: credit.id
        },
        {
          lineNumber: 2,
          account: '2150',
          accountName: 'PSP Settlement Suspense',
          debitCredit: 'credit',
          amount: absVariance,
          currency: credit.currency,
          reference: credit.id
        }
      ]
    }]
  } else {
    // Bank received LESS than PSP reported (negative variance)
    // This is a settlement shortfall that needs investigation or write-off
    return [{
      entryNumber: 1,
      description: `L1 Variance - PSP Net exceeds Bank Credit for ${credit.id}`,
      postingDate: today,
      documentType: 'variance_adjustment',
      lines: [
        {
          lineNumber: 1,
          account: '6500',
          accountName: 'Settlement Variance Expense',
          debitCredit: 'debit',
          amount: absVariance,
          currency: credit.currency,
          reference: credit.id
        },
        {
          lineNumber: 2,
          account: '1100',
          accountName: 'Bank - Settlement Account',
          debitCredit: 'credit',
          amount: absVariance,
          currency: credit.currency,
          reference: credit.id
        }
      ]
    }]
  }
}
