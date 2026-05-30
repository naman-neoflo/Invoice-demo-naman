// Daily AP / AR / net working-capital time series for the spend-analytics workflow.
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md § "seed-spend.ts"
// + Bundle B brief in docs/plans/2026-05-16-spend-analytics-phase-1-implementation.md.
//
// Composition:
//   - HISTORICAL_SERIES: 730 days ending 2026-05-16 (today). Daily aggregated
//     AP + AR with weekday + monthly seasonality and ±10% deterministic noise.
//   - FORWARD_PROJECTIONS: 60 days starting 2026-05-17. Daily aggregated
//     forecast with the same seasonality on top of a trailing-30-day baseline
//     plus a horizon-widening uncertainty band on the net WC projection.
//
// Both arrays are generated once at module load using a deterministic
// Mulberry32 PRNG with a fixed seed — no rebuild per import.
//
// The 2026-05-30 anchor (day 14 of the forward window) is a softened
// daily override that nudges the chart toward the deferral-card narrative
// ("AP clumping around May 30") without producing an extreme spike when
// the daily value gets summed into the weekly bucket alongside the rest
// of the week's flows. The "-$2.1M dip" referenced in the deferral
// card + audit-trail copy is a narrative figure for the forecast model,
// not a literal day-30 chart value.

import type {
  RangePreset,
  TimeSeriesForecastPoint,
  TimeSeriesPoint,
} from "./types"

// ════════════════════════════════════════════════════════════════════════
// PRNG (Mulberry32, deterministic across machines)
// ════════════════════════════════════════════════════════════════════════

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RANDOM_SEED = 20260516

// ════════════════════════════════════════════════════════════════════════
// Date constants
// ════════════════════════════════════════════════════════════════════════

// "Today" anchor. Demo timeline pinned to 2026-05-16. Forward window is
// 2026-05-17 .. 2026-07-15 (60 days inclusive).
const TODAY = new Date(Date.UTC(2026, 4, 16))

const HISTORICAL_DAYS = 730
const FORWARD_DAYS = 60

// ════════════════════════════════════════════════════════════════════════
// Base daily averages (~$120M annual → $329K/day across AP and AR)
// ════════════════════════════════════════════════════════════════════════

const BASE_DAILY_PAYABLES = 329_000
const BASE_DAILY_RECEIVABLES = 329_000

// ════════════════════════════════════════════════════════════════════════
// Seasonality helpers
// ════════════════════════════════════════════════════════════════════════

// Mon-Wed run hot (1.15×), Thu-Fri cooler (0.85×), Sat-Sun zero.
// JS getUTCDay(): 0=Sun, 1=Mon, ..., 6=Sat.
function weekdayFactor(d: Date): number {
  const day = d.getUTCDay()
  if (day === 0 || day === 6) return 0
  if (day >= 1 && day <= 3) return 1.15
  return 0.85 // Thu/Fri
}

// Last 3 days of month: AP outflow spike (×1.4).
function isMonthEndAp(d: Date): boolean {
  // d is in the last 3 days of the month if d + 3 days lands in a different month.
  const threeDaysAhead = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 3),
  )
  return threeDaysAhead.getUTCMonth() !== d.getUTCMonth()
}

// Last 5 days of quarter (Mar/Jun/Sep/Dec): AR inflow spike (×1.3).
function isQuarterEndAr(d: Date): boolean {
  const month = d.getUTCMonth() // 0-indexed
  const isQuarterMonth = month === 2 || month === 5 || month === 8 || month === 11
  if (!isQuarterMonth) return false
  const fiveDaysAhead = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 5),
  )
  return fiveDaysAhead.getUTCMonth() !== d.getUTCMonth()
}

// Multi-week cycles that survive the daily→weekly aggregation. Without
// these, every weekday looks identical inside a month and the chart
// renders as a flat sawtooth. The cycles are deliberately phased
// differently for AP and AR so the lines don't move in lockstep.
//
// AP monthly cycle: peaks late in the month (vendor invoice cadence).
// AR annual cycle: peaks Q4 (seasonal sales), dips mid-summer.
// AR quarterly cycle: a smaller wave on top of annual for renewal cadences.

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0)
  return Math.floor((d.getTime() - start) / 86_400_000)
}

function payablesCycle(d: Date): number {
  // Month-phase 0..1 (early-month=0, end-of-month=1)
  const phase = (d.getUTCDate() - 1) / 30
  // ±10% sin wave, peaks at month end
  return 1 + 0.1 * Math.sin(2 * Math.PI * (phase - 0.25))
}

function receivablesCycle(d: Date): number {
  const doy = dayOfYear(d)
  // Annual ±12%, peak around day 320 (Nov–Dec)
  const annual = 0.12 * Math.sin(2 * Math.PI * ((doy - 50) / 365))
  // Quarterly ±5% — phase-shifted from annual
  const quarterly = 0.05 * Math.sin(2 * Math.PI * (doy / 91))
  return 1 + annual + quarterly
}

// Week-level multiplier — picked once per ISO week and applied to every
// weekday of that week. This is the dominant source of week-to-week
// wiggle because daily noise gets averaged into smoothness by the
// weekly aggregation, but a constant week-level multiplier survives the
// sum intact.
function weekIndex(d: Date): number {
  // Days since a fixed epoch, integer-divided by 7. Stable across the
  // historical + forward range.
  const EPOCH = Date.UTC(2024, 0, 1) // arbitrary fixed Monday-adjacent epoch
  const days = Math.floor((d.getTime() - EPOCH) / 86_400_000)
  return Math.floor(days / 7)
}

function weeklyNoiseAp(d: Date): number {
  // ±12% deterministic per-week scalar. Hash-style transform on the
  // week index for cheap pseudo-randomness without consuming the PRNG
  // stream (which is reserved for daily noise).
  const w = weekIndex(d)
  const h = Math.sin(w * 12.9898 + 78.233) * 43758.5453
  const frac = h - Math.floor(h)
  return 0.88 + frac * 0.24
}

function weeklyNoiseAr(d: Date): number {
  // Different hash constants → AR week-noise is uncorrelated with AP's.
  const w = weekIndex(d)
  const h = Math.sin(w * 91.345 + 17.21) * 31173.7
  const frac = h - Math.floor(h)
  return 0.88 + frac * 0.24
}

function payablesSeasonalityFactor(d: Date): number {
  let factor = weekdayFactor(d)
  if (factor === 0) return 0
  if (isMonthEndAp(d)) factor *= 1.4
  factor *= payablesCycle(d)
  factor *= weeklyNoiseAp(d)
  return factor
}

function receivablesSeasonalityFactor(d: Date): number {
  let factor = weekdayFactor(d)
  if (factor === 0) return 0
  if (isQuarterEndAr(d)) factor *= 1.3
  factor *= receivablesCycle(d)
  factor *= weeklyNoiseAr(d)
  return factor
}

// ════════════════════════════════════════════════════════════════════════
// Date / ISO helpers
// ════════════════════════════════════════════════════════════════════════

function isoDate(d: Date): string {
  // YYYY-MM-DD in UTC.
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function addDaysUtc(base: Date, days: number): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + days))
}

// ════════════════════════════════════════════════════════════════════════
// Historical generation: 730 days ending 2026-05-16
// ════════════════════════════════════════════════════════════════════════

function generateHistorical(): TimeSeriesPoint[] {
  const rng = mulberry32(RANDOM_SEED)
  const points: TimeSeriesPoint[] = []

  for (let i = HISTORICAL_DAYS - 1; i >= 0; i--) {
    const d = addDaysUtc(TODAY, -i)

    const apFactor = payablesSeasonalityFactor(d)
    const arFactor = receivablesSeasonalityFactor(d)

    // ±10% noise from PRNG (always consumed to keep stream alignment).
    const apNoise = 0.9 + rng() * 0.2
    const arNoise = 0.9 + rng() * 0.2

    const payables = Math.round(BASE_DAILY_PAYABLES * apFactor * apNoise)
    const receivables = Math.round(BASE_DAILY_RECEIVABLES * arFactor * arNoise)
    const netWorkingCapital = receivables - payables

    points.push({
      date: isoDate(d),
      payables,
      receivables,
      netWorkingCapital,
    })
  }

  return points
}

// ════════════════════════════════════════════════════════════════════════
// Forward generation: 60 days starting 2026-05-17
// ════════════════════════════════════════════════════════════════════════

// Uncertainty-band anchor points (day-from-today, band-percentage).
const UNCERTAINTY_ANCHORS: Array<readonly [number, number]> = [
  [1, 0.02],
  [7, 0.03],
  [14, 0.05],
  [21, 0.08],
  [30, 0.12],
  [45, 0.16],
  [60, 0.2],
]

function uncertaintyBandFor(dayOffset: number): number {
  if (dayOffset <= UNCERTAINTY_ANCHORS[0][0]) return UNCERTAINTY_ANCHORS[0][1]
  if (dayOffset >= UNCERTAINTY_ANCHORS[UNCERTAINTY_ANCHORS.length - 1][0]) {
    return UNCERTAINTY_ANCHORS[UNCERTAINTY_ANCHORS.length - 1][1]
  }
  for (let i = 0; i < UNCERTAINTY_ANCHORS.length - 1; i++) {
    const [d0, p0] = UNCERTAINTY_ANCHORS[i]
    const [d1, p1] = UNCERTAINTY_ANCHORS[i + 1]
    if (dayOffset >= d0 && dayOffset <= d1) {
      const t = (dayOffset - d0) / (d1 - d0)
      return p0 + (p1 - p0) * t
    }
  }
  return UNCERTAINTY_ANCHORS[UNCERTAINTY_ANCHORS.length - 1][1]
}

// Floor for the uncertainty band base when netWC sits near zero — keeps the
// band visible on the chart at ~$200K minimum amplitude.
const NET_WC_BAND_FLOOR = 200_000
// Same floor concept for AP/AR bands: at low-activity points (weekends,
// partial weeks) the band would collapse to zero and disappear visually.
const AP_AR_BAND_FLOOR = 75_000

function generateForward(historical: TimeSeriesPoint[]): TimeSeriesForecastPoint[] {
  // Trailing-30-day daily averages of AP and AR (raw, before seasonality
  // factors) — used as the per-day baseline for the forward projection.
  const trailing30 = historical.slice(-30)
  const trailingApAvg =
    trailing30.reduce((sum, p) => sum + p.payables, 0) / trailing30.length
  const trailingArAvg =
    trailing30.reduce((sum, p) => sum + p.receivables, 0) / trailing30.length

  // Approximate the raw-base mean by stripping the average seasonality:
  // historical sums are weekly-zero on weekends, so the trailing avg is lower
  // than the "active-day" base. We rebuild a base by dividing by the average
  // seasonality factor for the trailing window.
  const avgApFactor =
    trailing30.reduce((sum, p) => sum + payablesSeasonalityFactor(new Date(`${p.date}T00:00:00Z`)), 0) /
    trailing30.length
  const avgArFactor =
    trailing30.reduce((sum, p) => sum + receivablesSeasonalityFactor(new Date(`${p.date}T00:00:00Z`)), 0) /
    trailing30.length

  // Avoid divide-by-zero (won't happen in practice since trailing windows
  // include weekdays, but defensively floor).
  const apBase = avgApFactor > 0 ? trailingApAvg / avgApFactor : BASE_DAILY_PAYABLES
  const arBase = avgArFactor > 0 ? trailingArAvg / avgArFactor : BASE_DAILY_RECEIVABLES

  const points: TimeSeriesForecastPoint[] = []

  for (let offset = 1; offset <= FORWARD_DAYS; offset++) {
    const d = addDaysUtc(TODAY, offset)
    const dateStr = isoDate(d)

    let payables: number
    let receivables: number

    // ── May 30 anchor override (day 14) ────────────────────────────────
    // Softened from the original $3M / $0.9M to $1M / $0.3M (same 10:3
    // ratio so the narrative "AP outweighs receipts that day" still
    // reads). The original values produced a one-week spike >2× the
    // surrounding bucket sizes once aggregated to weekly. The deferral
    // card's "-$2.1M dip" is a separate forecast narrative; the chart
    // doesn't need to literally show it.
    if (dateStr === "2026-05-30") {
      payables = 1_000_000
      receivables = 300_000
    } else {
      const apFactor = payablesSeasonalityFactor(d)
      const arFactor = receivablesSeasonalityFactor(d)
      payables = Math.round(apBase * apFactor)
      receivables = Math.round(arBase * arFactor)
    }

    const netWorkingCapital = receivables - payables

    const bandPct = uncertaintyBandFor(offset)
    const netBandBase = Math.max(Math.abs(netWorkingCapital), NET_WC_BAND_FLOOR)
    const netBandAmount = netBandBase * bandPct
    const netWcLow = netWorkingCapital - netBandAmount
    const netWcHigh = netWorkingCapital + netBandAmount

    const apBandAmount = Math.max(payables, AP_AR_BAND_FLOOR) * bandPct
    const arBandAmount = Math.max(receivables, AP_AR_BAND_FLOOR) * bandPct

    points.push({
      date: dateStr,
      payables,
      receivables,
      netWorkingCapital,
      payablesLow: payables - apBandAmount,
      payablesHigh: payables + apBandAmount,
      receivablesLow: receivables - arBandAmount,
      receivablesHigh: receivables + arBandAmount,
      netWcLow,
      netWcHigh,
    })
  }

  return points
}

// ════════════════════════════════════════════════════════════════════════
// Module-load generation (cached)
// ════════════════════════════════════════════════════════════════════════

export const HISTORICAL_SERIES: TimeSeriesPoint[] = generateHistorical()
export const FORWARD_PROJECTIONS: TimeSeriesForecastPoint[] = generateForward(HISTORICAL_SERIES)

// ════════════════════════════════════════════════════════════════════════
// Weekly aggregation
// ════════════════════════════════════════════════════════════════════════
//
// CFOs think in pay-cycle weeks, not days. Daily AP/AR with weekend zeros
// produces a sawtooth chart that's hard to read AND turns the May 30
// anchor into a one-day vertical spike. Aggregating to weekly buckets
// smooths both problems while keeping the underlying signal (weekly
// outflows, weekly receipts, weekly net working-capital position).
//
// Bucketing: ISO week — Monday is the first day of the week. Each
// bucket is keyed by the Monday's ISO date and contains the sum of all
// daily values from that Monday through Sunday.

function startOfWeekMonday(d: Date): Date {
  const day = d.getUTCDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = day === 0 ? -6 : 1 - day
  return addDaysUtc(d, diff)
}

function aggregateHistoricalToWeekly(points: TimeSeriesPoint[]): TimeSeriesPoint[] {
  const buckets = new Map<string, { payables: number; receivables: number }>()
  for (const p of points) {
    const d = new Date(`${p.date}T00:00:00Z`)
    const weekStart = isoDate(startOfWeekMonday(d))
    const bucket = buckets.get(weekStart) ?? { payables: 0, receivables: 0 }
    bucket.payables += p.payables
    bucket.receivables += p.receivables
    buckets.set(weekStart, bucket)
  }
  return Array.from(buckets.entries())
    .map(([date, { payables, receivables }]) => ({
      date,
      payables,
      receivables,
      netWorkingCapital: receivables - payables,
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

function aggregateForwardToWeekly(
  points: TimeSeriesForecastPoint[],
): TimeSeriesForecastPoint[] {
  // The week containing today is split: weekdays before today live in the
  // historical bucket, days after today live here. If we keep the partial
  // forward week, its bucket sums only 1-2 weekend/forward days and the
  // dashed line starts at near-zero. Drop any forward bucket whose Monday
  // is at or before today's Monday — the chart connects the first full
  // forward week back to the last full historical week via the seam in
  // mergeSeriesIntoRows.
  const todayMonday = isoDate(startOfWeekMonday(TODAY))
  const buckets = new Map<
    string,
    {
      payables: number
      receivables: number
      payablesLow: number
      payablesHigh: number
      receivablesLow: number
      receivablesHigh: number
      netWcLow: number
      netWcHigh: number
    }
  >()
  for (const p of points) {
    const d = new Date(`${p.date}T00:00:00Z`)
    const weekStart = isoDate(startOfWeekMonday(d))
    if (weekStart <= todayMonday) continue
    const bucket = buckets.get(weekStart) ?? {
      payables: 0,
      receivables: 0,
      payablesLow: 0,
      payablesHigh: 0,
      receivablesLow: 0,
      receivablesHigh: 0,
      netWcLow: 0,
      netWcHigh: 0,
    }
    bucket.payables += p.payables
    bucket.receivables += p.receivables
    bucket.payablesLow += p.payablesLow
    bucket.payablesHigh += p.payablesHigh
    bucket.receivablesLow += p.receivablesLow
    bucket.receivablesHigh += p.receivablesHigh
    bucket.netWcLow += p.netWcLow
    bucket.netWcHigh += p.netWcHigh
    buckets.set(weekStart, bucket)
  }
  return Array.from(buckets.entries())
    .map(([date, b]) => ({
      date,
      payables: b.payables,
      receivables: b.receivables,
      netWorkingCapital: b.receivables - b.payables,
      payablesLow: b.payablesLow,
      payablesHigh: b.payablesHigh,
      receivablesLow: b.receivablesLow,
      receivablesHigh: b.receivablesHigh,
      netWcLow: b.netWcLow,
      netWcHigh: b.netWcHigh,
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

// ════════════════════════════════════════════════════════════════════════
// Range slicing
// ════════════════════════════════════════════════════════════════════════
//
// Returns weekly-bucketed series for the requested range. The chart
// renders weeks as data points, so a 90-day range yields ~13 historical
// + ~5 forward weeks instead of 90 + 30 jittery daily points.

const YTD_START = "2026-01-01"

export function getSeriesForRange(
  range: RangePreset,
  customRange?: { start: string; end: string },
): {
  historical: TimeSeriesPoint[]
  forward: TimeSeriesForecastPoint[]
} {
  let dailyHistorical: TimeSeriesPoint[]
  let dailyForward: TimeSeriesForecastPoint[]

  switch (range) {
    case "30d":
      dailyHistorical = HISTORICAL_SERIES.slice(-30)
      dailyForward = FORWARD_PROJECTIONS.slice(0, 14)
      break
    case "90d":
      dailyHistorical = HISTORICAL_SERIES.slice(-90)
      dailyForward = FORWARD_PROJECTIONS.slice(0, 30)
      break
    case "ytd":
      dailyHistorical = HISTORICAL_SERIES.filter((p) => p.date >= YTD_START)
      dailyForward = FORWARD_PROJECTIONS.slice(0, 30)
      break
    case "ttm":
      dailyHistorical = HISTORICAL_SERIES.slice(-365)
      dailyForward = FORWARD_PROJECTIONS.slice(0, 30)
      break
    case "custom": {
      if (!customRange) {
        dailyHistorical = HISTORICAL_SERIES
        dailyForward = FORWARD_PROJECTIONS
      } else {
        const { start, end } = customRange
        dailyHistorical = HISTORICAL_SERIES.filter(
          (p) => p.date >= start && p.date <= end,
        )
        dailyForward = FORWARD_PROJECTIONS.filter(
          (p) => p.date >= start && p.date <= end,
        )
      }
      break
    }
  }

  return {
    historical: aggregateHistoricalToWeekly(dailyHistorical),
    forward: aggregateForwardToWeekly(dailyForward),
  }
}
