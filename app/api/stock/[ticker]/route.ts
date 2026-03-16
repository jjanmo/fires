import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2y`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Yahoo Finance 요청 실패' }, { status: 502 })
    }

    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) {
      return NextResponse.json({ error: '데이터 파싱 실패' }, { status: 502 })
    }

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
        (r): r is { date: string; open: number; high: number; low: number; price: number } =>
          r.open !== null && r.high !== null && r.low !== null && r.price !== null
      )

    // 같은 날짜가 중복으로 올 경우 마지막 항목(최신 데이터)만 유지
    const seen = new Map<string, { date: string; open: number; high: number; low: number; price: number }>()
    for (const row of raw) seen.set(row.date, row)
    const data = Array.from(seen.values())

    return NextResponse.json({ closes: data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
