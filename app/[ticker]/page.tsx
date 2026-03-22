import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTicker, TICKERS } from '@/entities/ticker';
import { buildHistory, buildLatestSignal, fetchCloses } from '@/entities/sigma';
import { PriceBlock } from '@/widgets/price-block';
import { SignalCards } from '@/widgets/signal-cards';
import { SigmaChart } from '@/widgets/sigma-chart';
import { HistoryTable } from '@/widgets/history-table';
import { TickerTabs } from '@/widgets/ticker-tabs';

interface Props {
  params: Promise<{ ticker: string }>;
}

export function generateStaticParams() {
  return TICKERS.map((t) => ({ ticker: t.slug }));
}
// @TODO 정적 페이지 생성 말고 다른 방법으로 처리하기
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker: slug } = await params;
  const ticker = getTicker(slug);
  if (!ticker) return {};
  return {
    title: ticker.symbol,
    description: ticker.description,
  };
}

export default async function TickerPage({ params }: Props) {
  const { ticker: slug } = await params;
  const ticker = getTicker(slug);
  if (!ticker) notFound();

  const closes = await fetchCloses(ticker.slug);
  const history = buildHistory(closes);
  const latestSignal = buildLatestSignal(closes);
  if (!latestSignal) throw new Error('σ 계산에 필요한 데이터가 부족합니다');

  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-5">
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
  );
}
