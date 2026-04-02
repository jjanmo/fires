import { NextResponse } from 'next/server'
import { searchKrStocks } from '@/shared/lib/kr-stocks'

export interface SearchResult {
  symbol: string    // "005930.KS"
  name: string      // "삼성전자"
  exchange: string  // "KSC", "KOQ", "NMS", "NYQ" ...
  type: string      // "S" (stock), "E" (ETF)
}

const fetchYahoo = async (q: string): Promise<SearchResult[]> => {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0&enableFuzzyQuery=true&lang=ko-KR&region=KR`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/455.36',
      Accept: 'application/json',
    },
    next: { revalidate: 300 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json?.quotes ?? [])
    .filter((item: Record<string, unknown>) => item.quoteType === 'EQUITY' || item.quoteType === 'ETF')
    .map((item: Record<string, unknown>) => ({
      symbol:   item.symbol as string,
      name:     (item.shortname ?? item.longname ?? '') as string,
      exchange: (item.exchange ?? '') as string,
      type:     item.quoteType === 'ETF' ? 'E' : 'S',
    }))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] })
  }

  // 쿼리 종류와 무관하게 kr-stocks.json + Yahoo Finance 항상 병렬 검색
  const [krSettled, yahooSettled] = await Promise.allSettled([
    Promise.resolve(searchKrStocks(q)),
    fetchYahoo(q),
  ])

  const kr    = krSettled.status    === 'fulfilled' ? krSettled.value    : []
  const yahoo = yahooSettled.status === 'fulfilled' ? yahooSettled.value : []

  // kr-stocks 결과를 우선 배치, Yahoo에서 중복 심볼 제거 후 병합
  const seen = new Set(kr.map((r) => r.symbol))
  const merged = [...kr, ...yahoo.filter((r) => !seen.has(r.symbol))]

  return NextResponse.json({ results: merged.slice(0, 12) })
}
