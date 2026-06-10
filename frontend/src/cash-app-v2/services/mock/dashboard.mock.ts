/**
 * Dashboard Mock Service
 */

import type {
  DashboardKPIs,
  ExceptionSummary,
  PSPReconciliationStatus,
  TransactionStatusDistribution,
  ExceptionAgingData,
  UnsettledAgingBucket,
} from '../../types/domain'

import {
  mockDashboardKPIs,
  mockExceptionSummary,
  mockTransactionStatusDistribution,
} from '../../data/mockData'
import { exceptionsService } from './exceptions.mock'
import { settlementsService } from './settlements.mock'

// Simulate API latency
const delay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms))

export const dashboardService = {
  getKPIs: async (entityId?: string, date?: string): Promise<DashboardKPIs> => {
    await delay(300)
    // Dynamically compute pastSLAExceptions from exception service
    // so dashboard stays in sync with the Exception Workspace
    const stats = await exceptionsService.getExceptionStats()

    // Dynamically compute totalBankCreditSGD from yesterday's bank credits
    // so Dashboard stays in sync with Settlement Explorer
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const credits = await settlementsService.getBankCredits({
      dateFrom: yesterdayStr,
      dateTo: yesterdayStr,
    })
    const totalBankCreditSGD = Math.round(
      credits
        .filter(c => c.currency === 'SGD')
        .reduce((sum, c) => sum + c.amount, 0) * 100
    ) / 100

    return {
      ...mockDashboardKPIs,
      pastSLAExceptions: stats.pastSLA,
      totalBankCreditSGD,
    }
  },

  getExceptionSummary: async (entityId?: string): Promise<ExceptionSummary[]> => {
    await delay(200)
    return mockExceptionSummary
  },

  getPSPReconciliationStatus: async (
    entityId?: string,
    date?: string
  ): Promise<PSPReconciliationStatus[]> => {
    await delay(250)

    // Dynamically compute from YESTERDAY's bank credits only
    // so Dashboard stays in sync with the Settlement Explorer screen
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const credits = await settlementsService.getBankCredits({
      dateFrom: yesterdayStr,
      dateTo: yesterdayStr,
    })

    // Group by PSP
    const pspMap: Record<string, {
      pspId: string; pspName: string; currency: string;
      totalAmount: number; matchedAmount: number; exceptionCount: number
    }> = {}

    for (const credit of credits) {
      const pspId = credit.mappedPSP || 'unknown'
      const pspName = pspId === 'grabpay' ? 'GrabPay' : pspId === 'stripe' ? 'Stripe' : pspId.charAt(0).toUpperCase() + pspId.slice(1)

      if (!pspMap[pspId]) {
        pspMap[pspId] = { pspId, pspName, currency: credit.currency, totalAmount: 0, matchedAmount: 0, exceptionCount: 0 }
      }

      pspMap[pspId].totalAmount += credit.amount

      // "matched" = credits where L1 variance is zero or near-zero (reconciled or matched_l1)
      if (credit.reconciliationStatus === 'reconciled' || credit.reconciliationStatus === 'matched_l1') {
        pspMap[pspId].matchedAmount += credit.amount
      }

      // Count L2 exceptions + settlement-level exceptions for this credit
      pspMap[pspId].exceptionCount += credit.l2ExceptionCount

      // Count credit-level exceptions (unmatched_variance, unmatched_no_psp_file are L1 exceptions)
      if (credit.reconciliationStatus === 'unmatched_variance' || credit.reconciliationStatus === 'unmatched_no_psp_file') {
        pspMap[pspId].exceptionCount += 1
      }
    }

    return Object.values(pspMap).map(psp => {
      const coveragePct = psp.totalAmount > 0
        ? Math.round((psp.matchedAmount / psp.totalAmount) * 1000) / 10
        : 0
      return {
        pspId: psp.pspId,
        pspName: psp.pspName,
        currency: psp.currency,
        todayCredits: Math.round(psp.totalAmount * 100) / 100,
        matched: Math.round(psp.matchedAmount * 100) / 100,
        exceptions: psp.exceptionCount,
        coveragePct,
        status: coveragePct >= 95 ? 'healthy' as const : coveragePct >= 85 ? 'attention' as const : 'warning' as const,
      }
    })
  },

  getTransactionStatusDistribution: async (
    entityId?: string
  ): Promise<TransactionStatusDistribution> => {
    await delay(200)
    return mockTransactionStatusDistribution
  },

  getExceptionAgingData: async (entityId?: string): Promise<ExceptionAgingData[]> => {
    await delay(200)

    // Dynamically compute from actual open exceptions
    // so Dashboard stays in sync with Exception Workspace
    const openExceptions = await exceptionsService.getExceptions({ status: 'open' })

    // Group by PSP and bucket by age
    const pspMap: Record<string, ExceptionAgingData> = {}

    const now = new Date()

    for (const exc of openExceptions) {
      const pspId = exc.psp || 'unknown'
      const pspName = exc.pspName || 'Unknown'

      // Skip "Unknown" PSP in the chart (no actionable PSP to show)
      if (pspId === 'unknown' || pspId === '' || pspName === 'Unknown') continue

      if (!pspMap[pspId]) {
        pspMap[pspId] = {
          pspId,
          pspName,
          age0to7Days: 0,
          age8to30Days: 0,
          age1to3Months: 0,
          ageOver3Months: 0,
        }
      }

      // Calculate age in days from createdAt
      const createdAt = new Date(exc.createdAt)
      const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

      if (ageDays <= 7) {
        pspMap[pspId].age0to7Days++
      } else if (ageDays <= 30) {
        pspMap[pspId].age8to30Days++
      } else if (ageDays <= 90) {
        pspMap[pspId].age1to3Months++
      } else {
        pspMap[pspId].ageOver3Months++
      }
    }

    // Sort by total exceptions descending (most problematic PSP first)
    return Object.values(pspMap).sort((a, b) => {
      const totalA = a.age0to7Days + a.age8to30Days + a.age1to3Months + a.ageOver3Months
      const totalB = b.age0to7Days + b.age8to30Days + b.age1to3Months + b.ageOver3Months
      return totalB - totalA
    })
  },

  getUnsettledAgingBuckets: async (entityId?: string): Promise<UnsettledAgingBucket[]> => {
    await delay(250)

    // Dynamically compute from ALL bank credits that are NOT fully reconciled
    // "In-transit" = cash received in bank but not yet posted/reconciled
    // This includes: matched_l1, unmatched_variance, unmatched_no_psp_file, partial
    const allCredits = await settlementsService.getBankCredits({})

    const now = new Date()

    // Group by PSP and bucket by age since value date
    const pspMap: Record<string, {
      pspId: string; pspName: string; currency: string;
      bucket0to1: number; bucket2to3: number; bucket4to7: number; bucket8plus: number
    }> = {}

    for (const credit of allCredits) {
      // Skip fully reconciled credits — they are no longer "in transit"
      if (credit.reconciliationStatus === 'reconciled') continue

      const pspId = credit.mappedPSP || 'unknown'
      const pspName = pspId === 'grabpay' ? 'GrabPay' : pspId === 'stripe' ? 'Stripe' : pspId.charAt(0).toUpperCase() + pspId.slice(1)

      if (!pspMap[pspId]) {
        pspMap[pspId] = { pspId, pspName, currency: credit.currency, bucket0to1: 0, bucket2to3: 0, bucket4to7: 0, bucket8plus: 0 }
      }

      // Calculate age in days from value date
      const valueDate = new Date(credit.valueDate)
      const ageDays = Math.floor((now.getTime() - valueDate.getTime()) / (1000 * 60 * 60 * 24))

      if (ageDays <= 1) {
        pspMap[pspId].bucket0to1 += credit.amount
      } else if (ageDays <= 3) {
        pspMap[pspId].bucket2to3 += credit.amount
      } else if (ageDays <= 7) {
        pspMap[pspId].bucket4to7 += credit.amount
      } else {
        pspMap[pspId].bucket8plus += credit.amount
      }
    }

    // Build result with totals, rounded for display
    return Object.values(pspMap)
      .map(psp => ({
        pspId: psp.pspId,
        pspName: psp.pspName,
        currency: psp.currency,
        bucket0to1: Math.round(psp.bucket0to1 * 100) / 100,
        bucket2to3: Math.round(psp.bucket2to3 * 100) / 100,
        bucket4to7: Math.round(psp.bucket4to7 * 100) / 100,
        bucket8plus: Math.round(psp.bucket8plus * 100) / 100,
        total: Math.round((psp.bucket0to1 + psp.bucket2to3 + psp.bucket4to7 + psp.bucket8plus) * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total) // Largest exposure first
  },
}
