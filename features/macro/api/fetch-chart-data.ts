import type { ChartPoint, IndicatorData, MacroDashboardData, DataSourceId } from '../types'
import { fetchAllYahooCharts } from './fetch-yahoo'
import { fetchHySpread } from './fetch-fred'
import { fetchAllEcos } from './fetch-ecos'
import { fetchFearGreed, emptyFearGreed } from './fetch-cnn'

const emptyData = (): IndicatorData => ({
  points: [],
  current: null,
  prevDay: null,
  prev3M: null,
})

const emptyYahoo = () => ({
  longRate: emptyData(), shortRate: emptyData(), dxy: emptyData(),
  krw: emptyData(), jpy: emptyData(), sp500: emptyData(),
  nasdaq: emptyData(), kospi: emptyData(), kosdaq: emptyData(),
  vix: emptyData(), oil: emptyData(), gold: emptyData(), copper: emptyData(),
})

const emptyEcos = () => ({
  krRate: emptyData(), krBond: emptyData(), krCpi: emptyData(),
})

// 두 시계열 날짜 기준 차이 계산
const computeSpread = (primary: IndicatorData, secondary: IndicatorData): IndicatorData => {
  const secMap = new Map(secondary.points.map((p) => [p.date, p.value]))
  const points: ChartPoint[] = primary.points
    .filter((p) => secMap.has(p.date))
    .map((p) => ({ date: p.date, value: p.value - secMap.get(p.date)! }))
  const n = points.length
  const current =
    primary.current !== null && secondary.current !== null
      ? primary.current - secondary.current
      : null
  // prevDay: 각 지표의 prevDay가 정확한 전일값이므로 직접 차이 계산
  const prevDay =
    primary.prevDay !== null && secondary.prevDay !== null
      ? +(primary.prevDay - secondary.prevDay).toFixed(4)
      : null
  return { points, current, prevDay, prev3M: n >= 13 ? points[n - 13].value : null }
}

// TNX 주봉 vs ECOS 일봉 — TNX 날짜 기준으로 가장 가까운 ECOS 값 매칭
const computeKrUsSpread = (longRate: IndicatorData, krBond: IndicatorData): IndicatorData => {
  const sortedBond = [...krBond.points].sort((a, b) => a.date.localeCompare(b.date))

  const findClosest = (targetDate: string): number | null => {
    if (sortedBond.length === 0) return null
    let closest = sortedBond[0]
    let minDiff = Math.abs(new Date(targetDate).getTime() - new Date(closest.date).getTime())
    for (const p of sortedBond) {
      const diff = Math.abs(new Date(targetDate).getTime() - new Date(p.date).getTime())
      if (diff < minDiff) { minDiff = diff; closest = p }
      if (p.date > targetDate) break
    }
    return minDiff <= 7 * 24 * 60 * 60 * 1000 ? closest.value : null
  }

  const points: ChartPoint[] = longRate.points
    .map((p) => {
      const bondVal = findClosest(p.date)
      if (bondVal === null) return null
      return { date: p.date, value: p.value - bondVal }
    })
    .filter(Boolean) as ChartPoint[]

  const n = points.length
  const current =
    longRate.current !== null && krBond.current !== null
      ? longRate.current - krBond.current
      : null
  // prevDay: TNX 전일(Yahoo meta 기반 일봉) - kr-bond 전일(ECOS 일봉)
  const prevDay =
    longRate.prevDay !== null && krBond.prevDay !== null
      ? +(longRate.prevDay - krBond.prevDay).toFixed(4)
      : null
  return { points, current, prevDay, prev3M: n >= 13 ? points[n - 13].value : null }
}

const errMsg = (reason: unknown): string => {
  if (reason instanceof Error) return reason.message
  return '알 수 없는 오류'
}

export const fetchAllChartData = async (): Promise<MacroDashboardData> => {
  // 4개 소스를 독립적으로 실행 — 하나가 느리거나 실패해도 나머지는 정상 반환
  const [yahooResult, hySpreadResult, ecosResult, fearGreedResult] = await Promise.allSettled([
    fetchAllYahooCharts(),
    fetchHySpread(),
    fetchAllEcos(),
    fetchFearGreed(),
  ])

  const sourceErrors: Partial<Record<DataSourceId, string>> = {}

  const yahoo = yahooResult.status === 'fulfilled'
    ? yahooResult.value
    : (sourceErrors.yahoo = errMsg(yahooResult.reason), emptyYahoo())

  const hySpread = hySpreadResult.status === 'fulfilled'
    ? hySpreadResult.value
    : (sourceErrors.fred = errMsg(hySpreadResult.reason), emptyData())

  const ecos = ecosResult.status === 'fulfilled'
    ? ecosResult.value
    : (sourceErrors.ecos = errMsg(ecosResult.reason), emptyEcos())

  const fearGreed = fearGreedResult.status === 'fulfilled'
    ? fearGreedResult.value
    : (sourceErrors.cnn = errMsg(fearGreedResult.reason), emptyFearGreed())

  const yieldSpread = computeSpread(yahoo.longRate, yahoo.shortRate)
  const krUsSpread = computeKrUsSpread(yahoo.longRate, ecos.krBond)

  return {
    fearGreed,
    sourceErrors,
    indicators: {
      'long-rate': yahoo.longRate,
      'short-rate': yahoo.shortRate,
      'yield-spread': yieldSpread,
      'hy-spread': hySpread,
      dxy: yahoo.dxy,
      krw: yahoo.krw,
      'kr-us-spread': krUsSpread,
      jpy: yahoo.jpy,
      sp500: yahoo.sp500,
      nasdaq: yahoo.nasdaq,
      kospi: yahoo.kospi,
      kosdaq: yahoo.kosdaq,
      vix: yahoo.vix,
      oil: yahoo.oil,
      gold: yahoo.gold,
      copper: yahoo.copper,
      'kr-cpi': ecos.krCpi,
      'kr-rate': ecos.krRate,
      'kr-bond': ecos.krBond,
    },
  }
}
