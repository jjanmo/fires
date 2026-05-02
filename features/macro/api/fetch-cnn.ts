import type { ChartPoint, FearGreedData } from '../types'

const CNN_URL = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata'
const TIMEOUT_MS = 5_000

export const emptyFearGreed = (): FearGreedData => ({
  score: null,
  rating: null,
  previousClose: null,
  oneWeekAgo: null,
  oneMonthAgo: null,
  oneYearAgo: null,
  points: [],
})

// try-catch 없음 — 타임아웃/네트워크 오류는 상위 Promise.allSettled로 전파
export const fetchFearGreed = async (): Promise<FearGreedData> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(CNN_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
        Referer: 'https://edition.cnn.com/',
        Origin: 'https://edition.cnn.com',
      },
      next: { revalidate: 3600 },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`CNN HTTP ${res.status}`)

    const json = await res.json()
    const fg = json?.fear_and_greed
    if (!fg) throw new Error('CNN 응답 형식 오류')

    type HistoricalItem = { x: number; y: number; rating: string }
    const historical: HistoricalItem[] = json?.fear_and_greed_historical?.data ?? []
    const points: ChartPoint[] = historical
      .map(({ x, y }) => ({
        date: new Date(x).toISOString().split('T')[0],
        value: y,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      score: fg.score ?? null,
      rating: fg.rating ?? null,
      previousClose: fg.previous_close ?? null,
      oneWeekAgo: fg.previous_1_week ?? null,
      oneMonthAgo: fg.previous_1_month ?? null,
      oneYearAgo: fg.previous_1_year ?? null,
      points,
    }
  } finally {
    clearTimeout(timer)
  }
}
