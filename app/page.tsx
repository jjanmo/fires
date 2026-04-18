import { TickerCard, getTickerColor } from '@/entities/ticker';
import type { TickerInfo } from '@/entities/ticker';
import { buildLatestSignal, fetchCloses } from '@/entities/sigma';
import type { HistoryRow } from '@/entities/sigma';
import { getWatchlistSymbols } from '@/features/watchlist';
import { createClient } from '@/shared/lib/supabase/server';
import { getKrStockName } from '@/shared/lib/kr-stocks';

async function fetchTickerData(slug: string): Promise<{ latest: HistoryRow | null; error?: string }> {
  try {
    const closes = await fetchCloses(slug);
    return { latest: buildLatestSignal(closes) ?? null };
  } catch {
    return { latest: null, error: '데이터 로드 실패' };
  }
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const watchlistSymbols = user ? await getWatchlistSymbols(user.id) : [];

  const watchlistResults = await Promise.all(
    watchlistSymbols.map(async (symbol, index) => {
      const ticker: TickerInfo = {
        symbol:      symbol.toUpperCase(),
        name:        getKrStockName(symbol) ?? symbol.toUpperCase(),
        slug:        symbol.toLowerCase(),
        description: '',
        ...getTickerColor(index),
      };
      return { ticker, ...(await fetchTickerData(symbol.toLowerCase())) };
    })
  );

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">

        {user && (
          <div>
            <h2 className="text-base font-semibold text-ink-2 mb-1">관심종목</h2>
            <p className="text-xs text-ink-4 mb-3">★ 표시한 종목</p>

            {watchlistResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlistResults.map(({ ticker, latest, error }) => (
                  <TickerCard key={ticker.slug} ticker={ticker} latest={latest} error={error} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-edge bg-card p-8 text-center">
                <p className="text-2xl mb-3">☆</p>
                <p className="text-sm font-medium text-ink-2 mb-1">아직 추가된 종목이 없습니다</p>
                <p className="text-xs text-ink-4 leading-relaxed">
                  검색에서 종목을 찾은 뒤<br />
                  상세 페이지 우측 상단의 ★ 버튼을 눌러 추가하세요
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
