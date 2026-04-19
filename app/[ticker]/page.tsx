import type { TickerInfo } from '@/entities/ticker';
import { buildHistory, buildLatestSignal, buildSignalHistory, fetchCloses, calcMdd, ROLLING_WINDOWS } from '@/entities/sigma';
import { PriceBlock } from '@/widgets/price-block';
import { SigmaTabContent, DeclinePriceChart } from '@/widgets/sigma-chart';
import { TickerTabs } from '@/widgets/ticker-tabs';
import { MddTab } from '@/widgets/mdd-tab';
import { WatchlistButton, getWatchlistSymbols } from '@/features/watchlist';
import { getTrades } from '@/features/trade-journal';
import { createClient } from '@/shared/lib/supabase/server';
import { getKrStockName } from '@/shared/lib/kr-stocks';

export default async function TickerPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: slug } = await params;

  const symbol = slug.toUpperCase();
  const krName = getKrStockName(symbol);

  const ticker: TickerInfo = {
    symbol,
    name: krName ? `${krName}(${symbol})` : symbol,
    slug: slug.toLowerCase(),
    description: '',
    accentColor: 'text-ink-2',
    borderColor: 'border-edge',
  };

  const [closes5y, closesMax] = await Promise.all([fetchCloses(ticker.slug, '5y'), fetchCloses(ticker.slug, 'max')]);

  const history = buildHistory(closes5y);

  // 4가지 롤링 기간별 최신 신호 — 서버에서 pre-compute
  const signalsByWindow = Object.fromEntries(
    ROLLING_WINDOWS.map((w) => [w, buildLatestSignal(closes5y, w)])
  ) as Record<(typeof ROLLING_WINDOWS)[number], ReturnType<typeof buildLatestSignal>>;

  const latestSignal = signalsByWindow[252];

  const signalHistoryByWindow = Object.fromEntries(
    ROLLING_WINDOWS.map((w) => [w, buildSignalHistory(closes5y, w, 30)])
  ) as Record<(typeof ROLLING_WINDOWS)[number], ReturnType<typeof buildSignalHistory>>;

  const mddResult = calcMdd(closesMax);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const watchlistSymbols = user ? await getWatchlistSymbols(user.id) : [];
  const isWatchlisted = watchlistSymbols.includes(ticker.symbol);
  const initialTrades = await getTrades(ticker.slug);

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-start justify-between gap-4">
          <PriceBlock ticker={ticker} latest={latestSignal} />
          {user && (
            <div className="pt-1">
              <WatchlistButton symbol={ticker.symbol} isWatchlisted={isWatchlisted} />
            </div>
          )}
        </div>

        <TickerTabs
          ticker={ticker.slug}
          symbol={ticker.symbol}
          currentPrice={latestSignal?.close ?? 0}
          sigmaContent={
            latestSignal == null ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <p className="text-[12px] text-amber-500 leading-relaxed">
                  σ 계산에 필요한 데이터가 부족합니다 (최소 20거래일).
                  신규 상장 종목이거나 거래 정지 상태일 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {closes5y.length < 60 && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                    <p className="text-[12px] text-amber-500 leading-relaxed">
                      거래 데이터가 {closes5y.length}일로 충분하지 않아 σ 통계가 불안정할 수 있습니다.
                      권장 기준(60거래일)에 도달하면 이 메시지는 사라집니다.
                    </p>
                  </div>
                )}
                <SigmaTabContent signalsByWindow={signalsByWindow} signalHistoryByWindow={signalHistoryByWindow} symbol={ticker.symbol} />
                <DeclinePriceChart history={history} symbol={ticker.symbol} />
              </div>
            )
          }
          mddContent={<MddTab mdd={mddResult} symbol={ticker.symbol} dataCount={closesMax.length} />}
          initialTrades={initialTrades}
        />
      </div>
    </main>
  );
}
