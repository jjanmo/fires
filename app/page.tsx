import { TICKERS } from '@/lib/tickers';
import { buildLatestSignal } from '@/lib/calc';
import type { ClosePrice, HistoryRow } from '@/lib/types';
import TickerCard from '@/components/TickerCard';

async function fetchTickerData(slug: string): Promise<{ latest: HistoryRow | null; error?: string }> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/stock/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { latest: null, error: '데이터 로드 실패' };
    const { closes }: { closes: ClosePrice[] } = await res.json();
    return { latest: buildLatestSignal(closes) ?? null };
  } catch {
    return { latest: null, error: '네트워크 오류' };
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
          <p className="mt-2 text-sm text-ink-3">
            Rolling 252일 표준편차 기반 레버리지 ETF 지정가 매매 대시보드
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(({ ticker, latest, error }) => (
            <TickerCard key={ticker.slug} ticker={ticker} latest={latest} error={error} />
          ))}
        </div>

        <p className="mt-12 text-center text-[11px] text-ink-4">
          종가 기준 매일 갱신 · 투자 참고용 · 투자 손실에 대한 책임 없음
        </p>
      </div>
    </main>
  );
}
