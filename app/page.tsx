import { TICKERS, TickerCard } from '@/entities/ticker';
import { buildLatestSignal, fetchCloses } from '@/entities/sigma';
import type { HistoryRow } from '@/entities/sigma';

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
        <div className="mb-6">
          <h2 className="text-base font-semibold text-ink-2">
            2<span className="normal-case">σ</span> 전략
          </h2>
          <p className="mt-1 text-xs text-ink-4">Rolling 252일 표준편차 기반 레버리지 ETF 지정가 매매</p>
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
