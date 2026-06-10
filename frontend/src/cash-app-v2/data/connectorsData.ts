/**
 * Connector Studio - Mock Data
 * Realistic connector configurations for demo purposes
 */

import type { ConnectorConfig, ExecutionRun, ExecutionStatus, TriggerType } from '../types/domain'

// Helper to generate dates
const now = new Date()
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

// ============================================================================
// BANK CONNECTORS
// ============================================================================

export const mockConnectors: ConnectorConfig[] = [
  // BANK 1: DBS Singapore
  {
    id: 'conn-dbs-sgd-001',
    name: 'DBS Bank - SGD Account',
    type: 'bank',
    subType: 'dbs_bank',
    description: 'DBS ****4521 • Daily bank statement downloads',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD'],
    connection: {
      host: 'sftp.dbs.com.sg',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['06:00', '18:00'],
      timezone: 'Asia/Singapore',
      runOnWeekends: true,
    },
    lastRunAt: hoursAgo(2),
    lastRunStatus: 'success',
    lastRunDuration: 125,
    successRate: 99.2,
    createdAt: daysAgo(180),
    updatedAt: hoursAgo(2),
    createdBy: 'admin@company.com',
  },

  // BANK 2: OCBC Singapore
  {
    id: 'conn-ocbc-sgd-001',
    name: 'OCBC Bank - SGD Account',
    type: 'bank',
    subType: 'ocbc_bank',
    description: 'OCBC ****7821 • Daily bank statement downloads',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD'],
    connection: {
      host: 'sftp.ocbc.com.sg',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['05:30', '17:30'],
      timezone: 'Asia/Singapore',
      runOnWeekends: true,
    },
    lastRunAt: hoursAgo(3),
    lastRunStatus: 'success',
    lastRunDuration: 98,
    successRate: 98.5,
    createdAt: daysAgo(180),
    updatedAt: hoursAgo(3),
    createdBy: 'admin@company.com',
  },

  // BANK 3: BCA Indonesia (Warning)
  {
    id: 'conn-bca-idr-001',
    name: 'BCA Bank - IDR Account',
    type: 'bank',
    subType: 'bca_bank',
    description: 'BCA ****1234 • Daily bank statement downloads',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-id-001',
    currencies: ['IDR'],
    connection: {
      host: 'sftp.bca.co.id',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['08:00'],
      timezone: 'Asia/Jakarta',
      runOnWeekends: false,
    },
    lastRunAt: hoursAgo(4),
    lastRunStatus: 'partial',
    lastRunDuration: 156,
    successRate: 94.8,
    createdAt: daysAgo(120),
    updatedAt: hoursAgo(4),
    createdBy: 'admin@company.com',
  },

  // BANK 4: Mandiri Indonesia (Error)
  {
    id: 'conn-mandiri-idr-001',
    name: 'Mandiri Bank - IDR Account',
    type: 'bank',
    subType: 'mandiri_bank',
    description: 'Mandiri ****5678 • Daily bank statement downloads',
    status: 'error',
    protocol: 'sftp',
    legalEntityId: 'entity-id-001',
    currencies: ['IDR'],
    connection: {
      host: 'sftp.bankmandiri.co.id',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['08:00'],
      timezone: 'Asia/Jakarta',
      runOnWeekends: false,
    },
    lastRunAt: daysAgo(2),
    lastRunStatus: 'failed',
    lastRunDuration: 0,
    successRate: 92.1,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(2),
    createdBy: 'admin@company.com',
  },

  // BANK 5: UOB Singapore
  {
    id: 'conn-uob-sgd-001',
    name: 'UOB Bank - SGD Account',
    type: 'bank',
    subType: 'uob_bank',
    description: 'UOB ****3456 • Daily bank statement downloads',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD'],
    connection: {
      host: 'sftp.uob.com.sg',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['06:30', '18:30'],
      timezone: 'Asia/Singapore',
      runOnWeekends: true,
    },
    lastRunAt: hoursAgo(2.5),
    lastRunStatus: 'success',
    lastRunDuration: 110,
    successRate: 98.8,
    createdAt: daysAgo(150),
    updatedAt: hoursAgo(2.5),
    createdBy: 'admin@company.com',
  },

  // BANK 6: Maybank Malaysia
  {
    id: 'conn-maybank-myr-001',
    name: 'Maybank - MYR Account',
    type: 'bank',
    subType: 'maybank',
    description: 'Maybank ****8901 • Daily bank statement downloads',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-my-001',
    currencies: ['MYR'],
    connection: {
      host: 'sftp.maybank.com.my',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['07:00'],
      timezone: 'Asia/Kuala_Lumpur',
      runOnWeekends: false,
    },
    lastRunAt: hoursAgo(5),
    lastRunStatus: 'success',
    lastRunDuration: 145,
    successRate: 97.6,
    createdAt: daysAgo(90),
    updatedAt: hoursAgo(5),
    createdBy: 'admin@company.com',
  },

  // BANK 7: CIMB Malaysia
  {
    id: 'conn-cimb-myr-001',
    name: 'CIMB Bank - MYR Account',
    type: 'bank',
    subType: 'cimb_bank',
    description: 'CIMB ****2345 • Daily bank statement downloads',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-my-001',
    currencies: ['MYR'],
    connection: {
      host: 'sftp.cimb.com.my',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['07:30'],
      timezone: 'Asia/Kuala_Lumpur',
      runOnWeekends: false,
    },
    lastRunAt: hoursAgo(4.5),
    lastRunStatus: 'success',
    lastRunDuration: 132,
    successRate: 96.9,
    createdAt: daysAgo(90),
    updatedAt: hoursAgo(4.5),
    createdBy: 'admin@company.com',
  },

  // ============================================================================
  // PSP CONNECTORS
  // ============================================================================

  // PSP 1: GrabPay Singapore
  {
    id: 'conn-grabpay-sg-001',
    name: 'GrabPay Singapore',
    type: 'psp',
    subType: 'grabpay',
    description: 'Daily Settlement Files • 06:00',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD'],
    connection: {
      host: 'sftp.grabpay.com',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['06:00'],
      timezone: 'Asia/Singapore',
      runOnWeekends: true,
    },
    lastRunAt: hoursAgo(2),
    lastRunStatus: 'success',
    lastRunDuration: 134,
    successRate: 98.7,
    createdAt: daysAgo(360),
    updatedAt: hoursAgo(2),
    createdBy: 'admin@company.com',
  },

  // PSP 2: Adyen Singapore
  {
    id: 'conn-adyen-sg-001',
    name: 'Adyen Singapore',
    type: 'psp',
    subType: 'adyen',
    description: 'Settlement Reports • Daily 06:00',
    status: 'active',
    protocol: 'rest',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD'],
    connection: {
      baseUrl: 'https://cal-live.adyen.com/cal/services/Reports/v1',
      authMethod: 'api_key',
      timeout: 30000,
      rateLimit: { requests: 1000, per: 'hour' },
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['06:00'],
      timezone: 'Asia/Singapore',
      runOnWeekends: true,
    },
    lastRunAt: hoursAgo(1),
    lastRunStatus: 'success',
    lastRunDuration: 87,
    successRate: 99.8,
    createdAt: daysAgo(240),
    updatedAt: hoursAgo(1),
    createdBy: 'admin@company.com',
  },

  // PSP 3: Stripe
  {
    id: 'conn-stripe-sg-001',
    name: 'Stripe',
    type: 'psp',
    subType: 'stripe',
    description: 'Balance Transactions • Hourly',
    status: 'active',
    protocol: 'rest',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD', 'USD'],
    connection: {
      baseUrl: 'https://api.stripe.com/v1',
      authMethod: 'bearer_token',
      timeout: 30000,
      rateLimit: { requests: 100, per: 'second' },
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'hourly',
      runTimes: ['00', '15', '30', '45'], // Every 15 minutes
      timezone: 'Asia/Singapore',
      runOnWeekends: true,
    },
    lastRunAt: hoursAgo(0.25), // 15 minutes ago
    lastRunStatus: 'success',
    lastRunDuration: 42,
    successRate: 99.9,
    createdAt: daysAgo(300),
    updatedAt: hoursAgo(0.25),
    createdBy: 'admin@company.com',
  },

  // PSP 4: OVO Indonesia
  {
    id: 'conn-ovo-id-001',
    name: 'OVO Indonesia',
    type: 'psp',
    subType: 'ovo',
    description: 'Daily Settlement Files • 08:00',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-id-001',
    currencies: ['IDR'],
    connection: {
      host: 'sftp.ovo.id',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['08:00'],
      timezone: 'Asia/Jakarta',
      runOnWeekends: false,
    },
    lastRunAt: hoursAgo(4),
    lastRunStatus: 'success',
    lastRunDuration: 156,
    successRate: 97.3,
    createdAt: daysAgo(180),
    updatedAt: hoursAgo(4),
    createdBy: 'admin@company.com',
  },

  // PSP 5: GoPay Indonesia
  {
    id: 'conn-gopay-id-001',
    name: 'GoPay Indonesia',
    type: 'psp',
    subType: 'gopay',
    description: 'Daily Settlement Files • 08:00',
    status: 'active',
    protocol: 'sftp',
    legalEntityId: 'entity-id-001',
    currencies: ['IDR'],
    connection: {
      host: 'sftp.gopay.co.id',
      port: 22,
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['08:00'],
      timezone: 'Asia/Jakarta',
      runOnWeekends: false,
    },
    lastRunAt: hoursAgo(4),
    lastRunStatus: 'success',
    lastRunDuration: 112,
    successRate: 98.1,
    createdAt: daysAgo(180),
    updatedAt: hoursAgo(4),
    createdBy: 'admin@company.com',
  },

  // PSP 6: DOKU Indonesia
  {
    id: 'conn-doku-id-001',
    name: 'DOKU Indonesia',
    type: 'psp',
    subType: 'doku',
    description: 'Daily Settlement Files • 09:00',
    status: 'active',
    protocol: 'rest',
    legalEntityId: 'entity-id-001',
    currencies: ['IDR'],
    connection: {
      baseUrl: 'https://api.doku.com/v1',
      authMethod: 'api_key',
      timeout: 30000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['09:00'],
      timezone: 'Asia/Jakarta',
      runOnWeekends: false,
    },
    lastRunAt: hoursAgo(3),
    lastRunStatus: 'success',
    lastRunDuration: 78,
    successRate: 96.5,
    createdAt: daysAgo(90),
    updatedAt: hoursAgo(3),
    createdBy: 'admin@company.com',
  },

  // PSP 7: PayPal
  {
    id: 'conn-paypal-001',
    name: 'PayPal',
    type: 'psp',
    subType: 'paypal',
    description: 'Transaction Search API • Daily 07:00',
    status: 'inactive',
    protocol: 'rest',
    legalEntityId: 'entity-sg-001',
    currencies: ['USD', 'SGD'],
    connection: {
      baseUrl: 'https://api.paypal.com/v1',
      authMethod: 'oauth2',
      timeout: 30000,
    },
    schedule: {
      mode: 'manual',
      timezone: 'Asia/Singapore',
    },
    lastRunAt: daysAgo(15),
    lastRunStatus: 'success',
    lastRunDuration: 234,
    successRate: 95.2,
    createdAt: daysAgo(400),
    updatedAt: daysAgo(15),
    createdBy: 'admin@company.com',
  },

  // ============================================================================
  // INTERNAL SYSTEMS
  // ============================================================================

  // INTERNAL 1: OMS (Order Management System)
  {
    id: 'conn-oms-001',
    name: 'OMS (Order Management)',
    type: 'internal',
    subType: 'oms',
    description: 'Order lookup • Real-time',
    status: 'active',
    protocol: 'rest',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD', 'IDR', 'MYR'],
    connection: {
      baseUrl: 'https://oms.internal.company.com/api/v2',
      authMethod: 'bearer_token',
      timeout: 5000,
      rateLimit: { requests: 1000, per: 'minute' },
    },
    schedule: {
      mode: 'realtime',
      timezone: 'Asia/Singapore',
    },
    lastRunAt: hoursAgo(0.01), // Just now
    lastRunStatus: 'success',
    lastRunDuration: 2,
    successRate: 99.9,
    createdAt: daysAgo(500),
    updatedAt: hoursAgo(0.01),
    createdBy: 'system@company.com',
  },

  // INTERNAL 2: Data Lake (S3)
  {
    id: 'conn-datalake-001',
    name: 'Data Lake (S3)',
    type: 'internal',
    subType: 'data_lake',
    description: 'Archive settlements • Daily 23:00',
    status: 'active',
    protocol: 's3',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD', 'IDR', 'MYR'],
    connection: {
      baseUrl: 's3://company-datalake-prod',
      timeout: 60000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['23:00'],
      timezone: 'Asia/Singapore',
      runOnWeekends: true,
    },
    lastRunAt: hoursAgo(12),
    lastRunStatus: 'success',
    lastRunDuration: 456,
    successRate: 100.0,
    createdAt: daysAgo(500),
    updatedAt: hoursAgo(12),
    createdBy: 'system@company.com',
  },

  // INTERNAL 3: Ledger Service
  {
    id: 'conn-ledger-001',
    name: 'Ledger Service',
    type: 'internal',
    subType: 'ledger',
    description: 'Journal entries • Real-time',
    status: 'active',
    protocol: 'graphql',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD', 'IDR', 'MYR'],
    connection: {
      baseUrl: 'https://ledger.internal.company.com/graphql',
      authMethod: 'api_key',
      timeout: 10000,
    },
    schedule: {
      mode: 'realtime',
      timezone: 'Asia/Singapore',
    },
    lastRunAt: hoursAgo(0.01),
    lastRunStatus: 'success',
    lastRunDuration: 3,
    successRate: 99.8,
    createdAt: daysAgo(500),
    updatedAt: hoursAgo(0.01),
    createdBy: 'system@company.com',
  },

  // INTERNAL 4: Sales Service
  {
    id: 'conn-sales-001',
    name: 'Sales Service',
    type: 'internal',
    subType: 'sales',
    description: 'Fee schedules • Daily 00:00',
    status: 'active',
    protocol: 'rest',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD', 'IDR', 'MYR'],
    connection: {
      baseUrl: 'https://sales.internal.company.com/api/v1',
      authMethod: 'api_key',
      timeout: 15000,
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['00:00'],
      timezone: 'Asia/Singapore',
      runOnWeekends: false,
    },
    lastRunAt: hoursAgo(8),
    lastRunStatus: 'success',
    lastRunDuration: 23,
    successRate: 99.5,
    createdAt: daysAgo(400),
    updatedAt: hoursAgo(8),
    createdBy: 'admin@company.com',
  },

  // ============================================================================
  // ERP SYSTEMS
  // ============================================================================

  // ERP 1: Oracle Fusion Cloud
  {
    id: 'conn-oracle-001',
    name: 'Oracle Fusion Cloud',
    type: 'erp',
    subType: 'oracle_fusion',
    description: 'GL, PO, Invoices • Daily 07:00, 19:00',
    status: 'active',
    protocol: 'rest',
    legalEntityId: 'entity-sg-001',
    currencies: ['SGD', 'IDR', 'MYR', 'USD'],
    connection: {
      baseUrl: 'https://company.fa.us2.oraclecloud.com/fscmRestApi/resources/11.13.18.05',
      authMethod: 'oauth2',
      timeout: 60000,
      rateLimit: { requests: 500, per: 'hour' },
    },
    schedule: {
      mode: 'scheduled',
      frequency: 'daily',
      runTimes: ['07:00', '19:00'],
      timezone: 'Asia/Singapore',
      runOnWeekends: false,
    },
    lastRunAt: hoursAgo(0.5),
    lastRunStatus: 'success',
    lastRunDuration: 342,
    successRate: 98.9,
    createdAt: daysAgo(600),
    updatedAt: hoursAgo(0.5),
    createdBy: 'admin@company.com',
  },
]

// ============================================================================
// EXECUTION RUNS HISTORY
// ============================================================================

// Helper to generate run IDs
let runCounter = 12345
const generateRunId = () => `RUN-${runCounter++}`

export const mockExecutionRuns: ExecutionRun[] = [
  // Stripe - Recent successful run (15 min ago)
  {
    id: generateRunId(),
    connectorId: 'conn-stripe-sg-001',
    connectorName: 'Stripe',
    status: 'success',
    startTime: hoursAgo(0.25),
    endTime: hoursAgo(0.249),
    duration: 42,
    trigger: {
      type: 'scheduled',
    },
    stats: {
      totalRecords: 1247,
      successfulRecords: 1247,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 2.3,
      apiCalls: 13,
      avgResponseTime: 1200,
    },
  },

  // Stripe - Hour ago
  {
    id: generateRunId(),
    connectorId: 'conn-stripe-sg-001',
    connectorName: 'Stripe',
    status: 'success',
    startTime: hoursAgo(1),
    endTime: hoursAgo(0.999),
    duration: 38,
    trigger: {
      type: 'scheduled',
    },
    stats: {
      totalRecords: 1189,
      successfulRecords: 1189,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 2.1,
      apiCalls: 12,
      avgResponseTime: 1150,
    },
  },

  // DBS Bank - 2 hours ago (Success)
  {
    id: generateRunId(),
    connectorId: 'conn-dbs-sgd-001',
    connectorName: 'DBS Bank - SGD Account',
    status: 'success',
    startTime: hoursAgo(2),
    endTime: hoursAgo(1.98),
    duration: 125,
    trigger: {
      type: 'scheduled',
    },
    stats: {
      totalRecords: 1,
      successfulRecords: 1,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 0.05,
    },
  },

  // OCBC Bank - 3 hours ago (Success)
  {
    id: generateRunId(),
    connectorId: 'conn-ocbc-sgd-001',
    connectorName: 'OCBC Bank - SGD Account',
    status: 'success',
    startTime: hoursAgo(3),
    endTime: hoursAgo(2.98),
    duration: 98,
    trigger: {
      type: 'scheduled',
    },
    stats: {
      totalRecords: 1,
      successfulRecords: 1,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 0.03,
    },
  },

  // BCA Bank - 4 hours ago (Partial)
  {
    id: generateRunId(),
    connectorId: 'conn-bca-idr-001',
    connectorName: 'BCA Bank - IDR Account',
    status: 'partial',
    startTime: hoursAgo(4),
    endTime: hoursAgo(3.96),
    duration: 156,
    trigger: {
      type: 'scheduled',
    },
    stats: {
      totalRecords: 1523,
      successfulRecords: 1485,
      failedRecords: 38,
      skippedRecords: 0,
      dataVolumeMB: 3.2,
      apiCalls: 15,
      avgResponseTime: 1247,
    },
    errors: [
      {
        errorType: 'Invalid currency code',
        errorMessage: 'Currency code "XXX" is not valid',
        count: 24,
      },
      {
        errorType: 'Missing required field',
        errorMessage: 'Field "amount" is required but missing',
        count: 10,
      },
      {
        errorType: 'Duplicate record',
        errorMessage: 'Settlement reference already exists',
        count: 4,
      },
    ],
    logs: [
      { timestamp: hoursAgo(4), level: 'info', message: 'Starting connector execution' },
      { timestamp: hoursAgo(4), level: 'info', message: 'Authentication successful' },
      { timestamp: hoursAgo(4), level: 'info', message: 'Fetched 1,523 transactions' },
      { timestamp: hoursAgo(4), level: 'warn', message: '38 validation errors found' },
      { timestamp: hoursAgo(3.96), level: 'info', message: 'Run completed with warnings' },
    ],
  },

  // Mandiri Bank - 2 days ago (Failed)
  {
    id: generateRunId(),
    connectorId: 'conn-mandiri-idr-001',
    connectorName: 'Mandiri Bank - IDR Account',
    status: 'failed',
    startTime: daysAgo(2),
    endTime: daysAgo(2),
    duration: 0,
    trigger: {
      type: 'scheduled',
    },
    stats: {
      totalRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 0,
    },
    errors: [
      {
        errorType: 'Connection timeout',
        errorMessage: 'SFTP connection timeout after 30 seconds',
        count: 1,
      },
    ],
    logs: [
      { timestamp: daysAgo(2), level: 'info', message: 'Starting connector execution' },
      { timestamp: daysAgo(2), level: 'error', message: 'Connection timeout after 30s' },
      { timestamp: daysAgo(2), level: 'info', message: 'Auto-retry scheduled in 15 minutes' },
    ],
  },

  // Oracle Fusion - 30 min ago (Success)
  {
    id: generateRunId(),
    connectorId: 'conn-oracle-001',
    connectorName: 'Oracle Fusion Cloud',
    status: 'success',
    startTime: hoursAgo(0.5),
    endTime: hoursAgo(0.494),
    duration: 342,
    trigger: {
      type: 'manual',
      userId: 'user-123',
      userName: 'Sarah Chen',
    },
    stats: {
      totalRecords: 150,
      successfulRecords: 150,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 0.8,
      apiCalls: 5,
      avgResponseTime: 2300,
    },
  },

  // More historical runs for Stripe (last 7 days)
  ...Array.from({ length: 48 }, (_, i) => ({
    id: generateRunId(),
    connectorId: 'conn-stripe-sg-001',
    connectorName: 'Stripe',
    status: 'success' as ExecutionStatus,
    startTime: hoursAgo(2 + i),
    endTime: hoursAgo(2 + i - 0.001),
    duration: 35 + Math.floor(Math.random() * 20),
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 1100 + Math.floor(Math.random() * 300),
      successfulRecords: 1100 + Math.floor(Math.random() * 300),
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 2 + Math.random(),
      apiCalls: 10 + Math.floor(Math.random() * 5),
      avgResponseTime: 1000 + Math.floor(Math.random() * 500),
    },
  })),

  // Historical runs for DBS Bank (daily for 30 days)
  ...Array.from({ length: 30 }, (_, i) => ({
    id: generateRunId(),
    connectorId: 'conn-dbs-sgd-001',
    connectorName: 'DBS Bank - SGD Account',
    status: 'success' as ExecutionStatus,
    startTime: daysAgo(i + 1),
    endTime: daysAgo(i + 0.999),
    duration: 100 + Math.floor(Math.random() * 50),
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 1,
      successfulRecords: 1,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 0.05,
    },
  })),

  // Running jobs (current)
  {
    id: generateRunId(),
    connectorId: 'conn-adyen-sg-001',
    connectorName: 'Adyen',
    status: 'running' as ExecutionStatus,
    startTime: hoursAgo(0.05), // Started 3 minutes ago
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 4500,
      successfulRecords: 3200,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 8.2,
      apiCalls: 45,
      avgResponseTime: 1200,
    },
  },
  {
    id: generateRunId(),
    connectorId: 'conn-oracle-fusion-001',
    connectorName: 'Oracle Fusion Cloud ERP',
    status: 'running' as ExecutionStatus,
    startTime: hoursAgo(0.15), // Started 9 minutes ago
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 8200,
      successfulRecords: 7100,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 15.4,
      apiCalls: 82,
      avgResponseTime: 2100,
    },
  },
  {
    id: generateRunId(),
    connectorId: 'conn-grabpay-sg-001',
    connectorName: 'GrabPay',
    status: 'running' as ExecutionStatus,
    startTime: hoursAgo(0.02), // Started 1 minute ago
    trigger: {
      type: 'manual' as TriggerType,
      userId: 'user-001',
      userName: 'John Doe',
    },
    stats: {
      totalRecords: 1200,
      successfulRecords: 850,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 2.8,
      apiCalls: 12,
      avgResponseTime: 980,
    },
  },

  // Failed jobs (recent)
  {
    id: generateRunId(),
    connectorId: 'conn-ovo-id-001',
    connectorName: 'OVO',
    status: 'failed' as ExecutionStatus,
    startTime: hoursAgo(1.5),
    endTime: hoursAgo(1.45),
    duration: 180,
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 2400,
      successfulRecords: 0,
      failedRecords: 2400,
      skippedRecords: 0,
      dataVolumeMB: 0,
      apiCalls: 1,
      avgResponseTime: 30000,
    },
    errors: [
      {
        errorType: 'ConnectionTimeout',
        errorMessage: 'Connection to OVO API timed out after 30s',
        count: 1,
      },
    ],
  },
  {
    id: generateRunId(),
    connectorId: 'conn-gopay-id-001',
    connectorName: 'GoPay',
    status: 'failed' as ExecutionStatus,
    startTime: hoursAgo(3.2),
    endTime: hoursAgo(3.15),
    duration: 240,
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 0,
      apiCalls: 0,
    },
    errors: [
      {
        errorType: 'AuthenticationError',
        errorMessage: 'API key expired or invalid',
        count: 1,
      },
    ],
  },
  {
    id: generateRunId(),
    connectorId: 'conn-ocbc-sgd-001',
    connectorName: 'OCBC Bank - SGD Account',
    status: 'failed' as ExecutionStatus,
    startTime: daysAgo(0.5),
    endTime: daysAgo(0.499),
    duration: 45,
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      skippedRecords: 0,
      dataVolumeMB: 0,
    },
    errors: [
      {
        errorType: 'FileNotFound',
        errorMessage: 'MT940 file not found on SFTP server for date 2026-06-08',
        count: 1,
      },
    ],
  },
  {
    id: generateRunId(),
    connectorId: 'conn-doku-id-001',
    connectorName: 'DOKU',
    status: 'failed' as ExecutionStatus,
    startTime: daysAgo(1),
    endTime: daysAgo(0.999),
    duration: 52,
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 3200,
      successfulRecords: 1100,
      failedRecords: 2100,
      skippedRecords: 0,
      dataVolumeMB: 2.1,
      apiCalls: 32,
      avgResponseTime: 1400,
    },
    errors: [
      {
        errorType: 'DataValidationError',
        errorMessage: 'Invalid transaction date format in 2100 records',
        count: 2100,
        affectedRecords: ['TXN-DOK-001', 'TXN-DOK-002', '...'],
      },
    ],
  },

  // Partial success jobs
  {
    id: generateRunId(),
    connectorId: 'conn-paypal-sg-001',
    connectorName: 'PayPal',
    status: 'partial' as ExecutionStatus,
    startTime: hoursAgo(2),
    endTime: hoursAgo(1.95),
    duration: 180,
    trigger: {
      type: 'scheduled' as TriggerType,
    },
    stats: {
      totalRecords: 850,
      successfulRecords: 782,
      failedRecords: 68,
      skippedRecords: 0,
      dataVolumeMB: 1.5,
      apiCalls: 9,
      avgResponseTime: 1100,
    },
    errors: [
      {
        errorType: 'RateLimitExceeded',
        errorMessage: 'API rate limit exceeded, 68 records skipped',
        count: 68,
      },
    ],
  },
  {
    id: generateRunId(),
    connectorId: 'conn-sales-service-001',
    connectorName: 'Sales Service',
    status: 'partial' as ExecutionStatus,
    startTime: hoursAgo(5),
    endTime: hoursAgo(4.95),
    duration: 215,
    trigger: {
      type: 'webhook' as TriggerType,
    },
    stats: {
      totalRecords: 1500,
      successfulRecords: 1345,
      failedRecords: 155,
      skippedRecords: 0,
      dataVolumeMB: 3.2,
      apiCalls: 15,
      avgResponseTime: 890,
    },
    errors: [
      {
        errorType: 'MissingField',
        errorMessage: 'Customer ID missing in 155 records',
        count: 155,
      },
    ],
  },
]
