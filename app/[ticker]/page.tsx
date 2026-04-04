import type { TickerInfo } from '@/entities/ticker';
import { buildHistory, buildLatestSignal, fetchCloses, calcMdd } from '@/entities/sigma';
import { PriceBlock } from '@/widgets/price-block';
import { SignalCards } from '@/widgets/signal-cards';
import { SigmaChart, DeclinePriceChart } from '@/widgets/sigma-chart';
import { HistoryTable } from '@/widgets/history-table';
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
  console.log({ closes5y, closesMax });

  const history = buildHistory(closes5y);
  const latestSignal = buildLatestSignal(closes5y);

  const mddResult = calcMdd(closesMax);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const watchlistSymbols = user ? await getWatchlistSymbols(user.id) : [];
  const isWatchlisted = watchlistSymbols.includes(ticker.symbol);
  const initialTrades = await getTrades(ticker.slug);

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 py-10 sm:px-6">
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
                <SignalCards latest={latestSignal} symbol={ticker.symbol} />
                <SigmaChart latest={latestSignal} symbol={ticker.symbol} />
                <DeclinePriceChart history={history} symbol={ticker.symbol} />
                <HistoryTable rows={[...history].reverse().slice(0, 30)} symbol={ticker.symbol} />
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
