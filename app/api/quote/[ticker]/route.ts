import { NextResponse } from 'next/server'

type MarketState = 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'

function resolveMarketState(ctp: {
  pre:     { start: number; end: number }
  regular: { start: number; end: number }
  post:    { start: number; end: number }
}): MarketState {
  const now = Math.floor(Date.now() / 1000)
  if (now >= ctp.regular.start && now < ctp.regular.end) return 'REGULAR'
  if (now >= ctp.pre.start     && now < ctp.pre.end)     return 'PRE'
  if (now >= ctp.post.start    && now < ctp.post.end)    return 'POST'
  return 'CLOSED'
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'Yahoo Finance 요청 실패' }, { status: 502 })

    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) return NextResponse.json({ error: '데이터 파싱 실패' }, { status: 502 })

    const price     = meta.regularMarketPrice     ?? null
    const prevClose = meta.chartPreviousClose     ?? meta.previousClose ?? null
    const change    = price != null && prevClose != null ? price - prevClose : null
    const changePct = price != null && prevClose != null ? ((price - prevClose) / prevClose) * 100 : 0
    const marketState = meta.currentTradingPeriod
      ? resolveMarketState(meta.currentTradingPeriod)
      : 'CLOSED'

    return NextResponse.json({ price, change, changePct, prevClose, marketState })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
