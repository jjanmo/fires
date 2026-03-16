import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'Yahoo Finance 요청 실패' }, { status: 502 })

    const json = await res.json()
    const p = json?.quoteSummary?.result?.[0]?.price
    if (!p) return NextResponse.json({ error: '데이터 파싱 실패' }, { status: 502 })

    return NextResponse.json({
      price:       p.regularMarketPrice?.raw               ?? null,
      change:      p.regularMarketChange?.raw               ?? null,
      changePct:   (p.regularMarketChangePercent?.raw ?? 0) * 100,
      prevClose:   p.regularMarketPreviousClose?.raw        ?? null,
      marketState: p.marketState                            ?? 'CLOSED',
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
