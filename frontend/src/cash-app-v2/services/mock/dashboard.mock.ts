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
  mockPSPReconciliationStatus,
  mockTransactionStatusDistribution,
  mockExceptionAgingData,
  mockUnsettledAgingBuckets,
} from '../../data/mockData'

// Simulate API latency
const delay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms))

export const dashboardService = {
  getKPIs: async (entityId?: string, date?: string): Promise<DashboardKPIs> => {
    await delay(300)
    return mockDashboardKPIs
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
    return mockPSPReconciliationStatus
  },

  getTransactionStatusDistribution: async (
    entityId?: string
  ): Promise<TransactionStatusDistribution> => {
    await delay(200)
    return mockTransactionStatusDistribution
  },

  getExceptionAgingData: async (entityId?: string): Promise<ExceptionAgingData[]> => {
    await delay(200)
    return mockExceptionAgingData
  },

  getUnsettledAgingBuckets: async (entityId?: string): Promise<UnsettledAgingBucket[]> => {
    await delay(250)
    return mockUnsettledAgingBuckets
  },
}
