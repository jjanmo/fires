import type { ChartPoint, IndicatorData } from '../types'

const YAHOO_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://finance.yahoo.com',
  Origin: 'https://finance.yahoo.com',
}

const TIMEOUT_MS = 8_000

const emptyData = (): IndicatorData => ({
  points: [],
  current: null,
  prevDay: null,
  prev3M: null,
})

export const fetchYahooChart = async (
  symbol: string,
  range = '3y',
  interval = '1wk',
  revalidate = 900,
): Promise<IndicatorData> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const encoded = encodeURIComponent(symbol)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=${interval}&range=${range}`
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate },
      signal: controller.signal,
    })
    if (!res.ok) return emptyData()

    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return emptyData()

    const timestamps: number[] = result.timestamp ?? []
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? []

    const points: ChartPoint[] = []
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null) {
        points.push({
          date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          value: closes[i]!,
        })
      }
    }

    const n = points.length
    const price = result.meta?.regularMarketPrice ?? null
    const change = result.meta?.regularMarketChange ?? null
    // 전일 종가 = 현재가 - 당일 변화량 (Yahoo meta 기반, 정확한 전일 대비)
    // change === 0 또는 null 이면 휴장(주말/공휴일) — 주봉 points로 fallback
    const prevDayFromMeta =
      price !== null && change !== null && change !== 0
        ? +(price - change).toFixed(4)
        : null

    // 주봉 fallback: Yahoo가 주말에 현재가와 동일한 미완성 캔들을 추가하는 경우가 있어
    // price와 거의 같은 캔들(0.01% 이내)은 건너뛰고 실제 이전 주봉을 찾음
    const isNearlyEqual = (a: number, b: number) => Math.abs(a - b) / Math.abs(b || 1) < 0.0001
    const prevFromPoints = (() => {
      if (price === null) return n >= 2 ? points[n - 2].value : null
      let i = n - 2
      while (i >= 0 && isNearlyEqual(points[i].value, price)) i--
      return i >= 0 ? points[i].value : null
    })()

    return {
      points,
      current: price,
      prevDay: prevDayFromMeta ?? prevFromPoints,
      prev3M: n >= 13 ? points[n - 13].value : null,
    }
  } catch (err) {
    // AbortError(타임아웃)는 상위로 재전파 — fetchAllYahooCharts에서 집계
    if (err instanceof Error && err.name === 'AbortError') throw err
    return emptyData()
  } finally {
    clearTimeout(timer)
  }
}

export const fetchAllYahooCharts = async (): Promise<
  Record<
    | 'longRate'
    | 'shortRate'
    | 'dxy'
    | 'krw'
    | 'jpy'
    | 'sp500'
    | 'nasdaq'
    | 'kospi'
    | 'kosdaq'
    | 'vix'
    | 'oil'
    | 'gold'
    | 'copper',
    IndicatorData
  >
> => {
  const results = await Promise.allSettled([
    fetchYahooChart('^TNX'),
    fetchYahooChart('^IRX'),
    fetchYahooChart('DX-Y.NYB'),
    fetchYahooChart('KRW=X'),
    fetchYahooChart('JPY=X'),
    fetchYahooChart('^GSPC'),
    fetchYahooChart('^IXIC'),
    fetchYahooChart('^KS11'),
    fetchYahooChart('^KQ11'),
    fetchYahooChart('^VIX'),
    fetchYahooChart('CL=F'),
    fetchYahooChart('GC=F'),
    fetchYahooChart('HG=F'),
  ])

  // 전체 심볼이 타임아웃으로 실패하면 소스 장애로 상위에 전파
  const failCount = results.filter((r) => r.status === 'rejected').length
  if (failCount === results.length) {
    throw new Error('Yahoo Finance 연결 실패')
  }

  const get = (i: number): IndicatorData =>
    results[i].status === 'fulfilled' ? results[i].value : emptyData()

  return {
    longRate: get(0),
    shortRate: get(1),
    dxy: get(2),
    krw: get(3),
    jpy: get(4),
    sp500: get(5),
    nasdaq: get(6),
    kospi: get(7),
    kosdaq: get(8),
    vix: get(9),
    oil: get(10),
    gold: get(11),
    copper: get(12),
  }
}
