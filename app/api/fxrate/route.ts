import { NextResponse } from 'next/server'

const URL = 'https://query1.finance.yahoo.com/v8/finance/chart/KRW=X?interval=1d&range=1d'

export async function GET() {
  try {
    const res = await fetch(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com',
        'Origin': 'https://finance.yahoo.com',
      },
      next: { revalidate: 300 },
    })

    if (!res.ok) return NextResponse.json({ error: '환율 로드 실패' }, { status: 502 })

    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) return NextResponse.json({ error: '파싱 실패' }, { status: 502 })

    return NextResponse.json({
      rate: meta.regularMarketPrice as number,
      updatedAt: new Date(meta.regularMarketTime * 1000).toISOString(),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
