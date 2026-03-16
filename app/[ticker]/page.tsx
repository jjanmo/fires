import { notFound } from 'next/navigation'
import { getTicker } from '@/lib/tickers'
import { buildHistory, buildLatestSignal } from '@/lib/calc'
import type { ClosePrice } from '@/lib/types'
import PriceBlock from '@/components/PriceBlock'
import SignalCards from '@/components/SignalCards'
import SigmaChart from '@/components/SigmaChart'
import HistoryTable from '@/components/HistoryTable'
import TickerTabs from '@/components/TickerTabs'

interface Props {
  params: Promise<{ ticker: string }>
}

async function getCloses(slug: string): Promise<ClosePrice[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${base}/api/stock/${slug}`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`${slug.toUpperCase()} 데이터 로드 실패`)
  const { closes } = await res.json()
  return closes
}

export default async function TickerPage({ params }: Props) {
  const { ticker: slug } = await params
  const ticker = getTicker(slug)
  if (!ticker) notFound()

  const closes = await getCloses(ticker.slug)
  const history = buildHistory(closes)
  const latestSignal = buildLatestSignal(closes)
  if (!latestSignal) throw new Error('σ 계산에 필요한 데이터가 부족합니다')

  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* 항상 표시 — 현재 가격 + 신호 상태 */}
        <PriceBlock ticker={ticker} latest={latestSignal} />

        {/* 탭: 대시보드 | 매매일지 */}
        <TickerTabs ticker={ticker.slug} currentPrice={latestSignal.close}>
          <div className="space-y-5">
            <SignalCards latest={latestSignal} />
            <SigmaChart latest={latestSignal} />
            <HistoryTable rows={[...history].reverse().slice(0, 30)} />
          </div>
        </TickerTabs>
      </div>
    </main>
  )
}
