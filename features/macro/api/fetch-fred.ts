import type { ChartPoint, IndicatorData } from '../types'

const FRED_BASE = 'https://api.stlouisfed.org/fred'
const TIMEOUT_MS = 10_000

const emptyData = (): IndicatorData => ({
  points: [],
  current: null,
  prevDay: null,
  prev3M: null,
})

// try-catch 없음 — 타임아웃/네트워크 오류는 상위 Promise.allSettled로 전파
export const fetchHySpread = async (): Promise<IndicatorData> => {
  const apiKey = process.env.FRED_API_KEY
  if (!apiKey) return emptyData()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const url =
      `${FRED_BASE}/series/observations` +
      `?series_id=BAMLH0A0HYM2` +
      `&api_key=${apiKey}` +
      `&file_type=json` +
      `&sort_order=asc` +
      `&limit=1500`

    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`FRED HTTP ${res.status}`)

    const json = await res.json()
    const observations: Array<{ date: string; value: string }> = json?.observations ?? []

    const points: ChartPoint[] = observations
      .filter((o) => o.value !== '.' && o.value !== '')
      .map((o) => ({ date: o.date, value: parseFloat(o.value) }))
      .filter((p) => !isNaN(p.value))

    const n = points.length
    return {
      points,
      current: n > 0 ? points[n - 1].value : null,
      prevDay: n >= 2 ? points[n - 2].value : null,
      prev3M: n >= 66 ? points[n - 66].value : null,
    }
  } finally {
    clearTimeout(timer)
  }
}
