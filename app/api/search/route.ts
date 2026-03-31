import { NextResponse } from 'next/server'

export interface SearchResult {
  symbol: string    // "005930.KS"
  name: string      // "Samsung Electronics Co., Ltd."
  exchange: string  // "KSE", "KOQ", "NMS", "NYQ" ...
  type: string      // "S" (stock), "E" (ETF)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] })
  }

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0&enableFuzzyQuery=true&lang=ko-KR&region=KR`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/455.36',
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ results: [] })
    }

    const json = await res.json()
    const quotes = json?.quotes ?? []

    const results: SearchResult[] = quotes
      .filter((q: Record<string, unknown>) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map((q: Record<string, unknown>) => ({
        symbol: q.symbol as string,
        name: (q.shortname ?? q.longname ?? '') as string,
        exchange: (q.exchange ?? '') as string,
        type: q.quoteType === 'ETF' ? 'E' : 'S',
      }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
