import { TICKERS } from '@/lib/tickers';
import { buildLatestSignal } from '@/lib/calc';
import { fetchCloses } from '@/lib/fetchCloses';
import type { HistoryRow } from '@/lib/types';
import TickerCard from '@/components/TickerCard';

async function fetchTickerData(slug: string): Promise<{ latest: HistoryRow | null; error?: string }> {
  try {
    const closes = await fetchCloses(slug);
    return { latest: buildLatestSignal(closes) ?? null };
  } catch {
    return { latest: null, error: '데이터 로드 실패' };
  }
}

export default async function HomePage() {
  const results = await Promise.all(
    TICKERS.map(async (ticker) => ({ ticker, ...(await fetchTickerData(ticker.slug)) }))
  );

  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-ink-1 tracking-tight">σ 매매 신호</h1>
          <p className="mt-2 text-sm text-ink-3">Rolling 252일 표준편차 기반 레버리지 ETF 지정가 매매 대시보드</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(({ ticker, latest, error }) => (
            <TickerCard key={ticker.slug} ticker={ticker} latest={latest} error={error} />
          ))}
        </div>
      </div>
    </main>
  );
}
