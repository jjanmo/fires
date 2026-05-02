import type { ChartPoint, IndicatorData } from '../types'

const ECOS_BASE = 'https://ecos.bok.or.kr/api'
const TIMEOUT_MS = 10_000

const emptyData = (): IndicatorData => ({
  points: [],
  current: null,
  prevDay: null,
  prev3M: null,
})

type EcosRow = {
  TIME: string
  DATA_VALUE: string
}

const fetchEcosData = async (
  statCode: string,
  cycle: 'D' | 'M',
  startDate: string,
  endDate: string,
  itemCode: string,
  limit = 1500,
): Promise<IndicatorData> => {
  const apiKey = process.env.ECOS_API_KEY
  if (!apiKey) return emptyData()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const url =
      `${ECOS_BASE}/StatisticSearch/${apiKey}/json/kr/1/${limit}` +
      `/${statCode}/${cycle}/${startDate}/${endDate}/${itemCode}`

    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: controller.signal,
    })
    if (!res.ok) return emptyData()

    const json = await res.json()
    if (json?.RESULT) return emptyData()

    const rows: EcosRow[] = json?.StatisticSearch?.row ?? []

    const points: ChartPoint[] = rows
      .filter((r) => r.DATA_VALUE && r.DATA_VALUE !== '-' && r.DATA_VALUE.trim() !== '')
      .map((r) => {
        const raw = r.TIME.trim()
        const date =
          raw.length === 8
            ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
            : `${raw.slice(0, 4)}-${raw.slice(4, 6)}-01`
        return { date, value: parseFloat(r.DATA_VALUE) }
      })
      .filter((p) => !isNaN(p.value))
      .sort((a, b) => a.date.localeCompare(b.date))

    const n = points.length
    if (n === 0) return emptyData()

    const current = points[n - 1].value

    if (cycle === 'M') {
      return {
        points,
        current,
        prevDay: n >= 2 ? points[n - 2].value : null,
        prev3M: n >= 4 ? points[n - 4].value : null,
      }
    }

    return {
      points,
      current,
      prevDay: n >= 2 ? points[n - 2].value : null,
      prev3M: n >= 66 ? points[n - 66].value : null,
    }
  } catch (err) {
    // AbortError(타임아웃)는 상위로 재전파 — fetchAllEcos에서 집계
    if (err instanceof Error && err.name === 'AbortError') throw err
    return emptyData()
  } finally {
    clearTimeout(timer)
  }
}

const dateStr = (d: Date, cycle: 'D' | 'M') => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return cycle === 'D' ? `${y}${m}${dd}` : `${y}${m}`
}

const yearsAgo = (n: number) => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - n)
  return d
}

const today = () => new Date()

export const fetchKrRate = () =>
  fetchEcosData('722Y001', 'D', dateStr(yearsAgo(5), 'D'), dateStr(today(), 'D'), '0101000')

export const fetchKrBond = () =>
  fetchEcosData('817Y002', 'D', dateStr(yearsAgo(5), 'D'), dateStr(today(), 'D'), '010210000')

// 절대지수를 전년동월비(YoY %) 로 변환
export const fetchKrCpi = async (): Promise<IndicatorData> => {
  // 12개월 YoY 계산을 위해 1년 여유분 추가
  const raw = await fetchEcosData('901Y009', 'M', dateStr(yearsAgo(11), 'M'), dateStr(today(), 'M'), '0')
  if (raw.points.length < 13) return raw

  const yoyPoints: ChartPoint[] = []
  for (let i = 12; i < raw.points.length; i++) {
    const prev = raw.points[i - 12].value
    if (prev === 0) continue
    yoyPoints.push({
      date: raw.points[i].date,
      value: +((raw.points[i].value - prev) / prev * 100).toFixed(2),
    })
  }

  const n = yoyPoints.length
  if (n === 0) return raw
  return {
    points: yoyPoints,
    current: yoyPoints[n - 1].value,
    prevDay: n >= 2 ? yoyPoints[n - 2].value : null,
    prev3M: n >= 4 ? yoyPoints[n - 4].value : null,
  }
}

export const fetchAllEcos = async () => {
  const results = await Promise.allSettled([
    fetchKrRate(),
    fetchKrBond(),
    fetchKrCpi(),
  ])

  // 전체가 타임아웃으로 실패하면 소스 장애로 상위에 전파
  const failCount = results.filter((r) => r.status === 'rejected').length
  if (failCount === results.length) {
    throw new Error('ECOS 연결 실패')
  }

  const get = (i: number): IndicatorData =>
    results[i].status === 'fulfilled' ? results[i].value : emptyData()

  return {
    krRate: get(0),
    krBond: get(1),
    krCpi: get(2),
  }
}
