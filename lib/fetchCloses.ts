import type { ClosePrice } from './types'

export async function fetchCloses(symbol: string): Promise<ClosePrice[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=2y`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Yahoo Finance 요청 실패 (${res.status})`)

  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('Yahoo Finance 데이터 파싱 실패')

  const timestamps: number[] = result.timestamp
  const quote = result.indicators.quote[0]
  const opens:  (number | null)[] = quote.open
  const highs:  (number | null)[] = quote.high
  const lows:   (number | null)[] = quote.low
  const closes: (number | null)[] = quote.close

  const raw = timestamps
    .map((t, i) => ({
      date:  new Date(t * 1000).toISOString().slice(0, 10),
      open:  opens[i],
      high:  highs[i],
      low:   lows[i],
      price: closes[i],
    }))
    .filter(
      (r): r is ClosePrice =>
        r.open !== null && r.high !== null && r.low !== null && r.price !== null
    )

  // 같은 날짜 중복 시 마지막 항목(최신 데이터)만 유지
  const seen = new Map<string, ClosePrice>()
  for (const row of raw) seen.set(row.date, row)

  return Array.from(seen.values())
}
