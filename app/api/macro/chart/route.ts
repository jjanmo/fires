import { NextResponse } from 'next/server'
import type { ChartPoint } from '@/features/macro/types'

const YAHOO_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://finance.yahoo.com',
  Origin: 'https://finance.yahoo.com',
}

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const secondary = searchParams.get('secondary')
  const range = searchParams.get('range') ?? '1mo'
  const interval = searchParams.get('interval') ?? '1d'

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  const fetchChart = async (sym: string): Promise<ChartPoint[]> => {
    try {
      const encoded = encodeURIComponent(sym)
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=${interval}&range=${range}`
      const res = await fetch(url, { headers: YAHOO_HEADERS, cache: 'no-store' })
      if (!res.ok) return []
      const json = await res.json()
      const result = json?.chart?.result?.[0]
      if (!result) return []

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
      return points
    } catch {
      return []
    }
  }

  const [primaryPoints, secondaryPoints] = await Promise.all([
    fetchChart(symbol),
    secondary ? fetchChart(secondary) : Promise.resolve([] as ChartPoint[]),
  ])

  return NextResponse.json({ points: primaryPoints, secondaryPoints })
}
