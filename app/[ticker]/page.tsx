import type { TickerInfo } from '@/entities/ticker';
import { buildHistory, buildLatestSignal, fetchCloses, calcMdd } from '@/entities/sigma';
import { PriceBlock } from '@/widgets/price-block';
import { SignalCards } from '@/widgets/signal-cards';
import { SigmaChart } from '@/widgets/sigma-chart';
import { HistoryTable } from '@/widgets/history-table';
import { TickerTabs } from '@/widgets/ticker-tabs';
import { MddTab } from '@/widgets/mdd-tab';
import { WatchlistButton, getWatchlistSymbols } from '@/features/watchlist';
import { createClient } from '@/shared/lib/supabase/server';


export default async function TickerPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: slug } = await params;

  const ticker: TickerInfo = {
    symbol:      slug.toUpperCase(),
    name:        slug.toUpperCase(),
    slug:        slug.toLowerCase(),
    description: '',
    accentColor: 'text-ink-2',
    borderColor: 'border-edge',
  };

  const [closes5y, closesMax] = await Promise.all([
    fetchCloses(ticker.slug, '5y'),
    fetchCloses(ticker.slug, 'max'),
  ]);

  const history = buildHistory(closes5y);
  const latestSignal = buildLatestSignal(closes5y);
  if (!latestSignal) throw new Error('σ 계산에 필요한 데이터가 부족합니다');
  const mddResult = calcMdd(closesMax);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const watchlistSymbols = user ? await getWatchlistSymbols(user.id) : [];
  const isWatchlisted = watchlistSymbols.includes(ticker.symbol);

  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:px-6">
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
          currentPrice={latestSignal.close}
          sigmaContent={
            <div className="space-y-5">
              <SignalCards latest={latestSignal} />
              <SigmaChart latest={latestSignal} />
              <HistoryTable rows={[...history].reverse().slice(0, 30)} />
            </div>
          }
          mddContent={<MddTab mdd={mddResult} />}
        />
      </div>
    </main>
  );
}
