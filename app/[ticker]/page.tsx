import { Suspense } from 'react';
import type { TickerInfo } from '@/entities/ticker';
import { buildHistory, buildLatestSignal, buildSignalHistory, fetchCloses, ROLLING_WINDOWS } from '@/entities/sigma';
import { PriceBlock } from '@/widgets/price-block';
import { SigmaTabContent, DeclinePriceChart } from '@/widgets/sigma-chart';
import { TickerTabs } from '@/widgets/ticker-tabs';
import { WatchlistButton, getWatchlistSymbols } from '@/features/watchlist';
import { createClient } from '@/shared/lib/supabase/server';
import { getKrStockName } from '@/shared/lib/kr-stocks';
import MddTabLoader from './_components/MddTabLoader';
import JournalTabLoader from './_components/JournalTabLoader';

function TabSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-card border border-edge p-5 animate-pulse">
        <div className="h-4 w-24 bg-inset rounded mb-4" />
        <div className="h-40 bg-inset rounded" />
      </div>
    </div>
  );
}

async function getUserContext(symbol: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const watchlistSymbols = user ? await getWatchlistSymbols(user.id) : [];
  return { user, isWatchlisted: watchlistSymbols.includes(symbol) };
}

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

  // 시그마 탭과 헤더(PriceBlock, WatchlistButton)에 필요한 데이터만 await.
  // MDD(closesMax), 매매일지(getTrades)는 Suspense 경계 안에서 스트리밍.
  const [closes5y, userCtx] = await Promise.all([
    fetchCloses(ticker.slug, '5y'),
    getUserContext(ticker.symbol),
  ]);

  const history = buildHistory(closes5y);

  const signalsByWindow = Object.fromEntries(
    ROLLING_WINDOWS.map((w) => [w, buildLatestSignal(closes5y, w)])
  ) as Record<(typeof ROLLING_WINDOWS)[number], ReturnType<typeof buildLatestSignal>>;

  const latestSignal = signalsByWindow[252];

  const signalHistoryByWindow = Object.fromEntries(
    ROLLING_WINDOWS.map((w) => [w, signalsByWindow[w] ? buildSignalHistory(closes5y, signalsByWindow[w]!, 30) : []])
  ) as Record<(typeof ROLLING_WINDOWS)[number], ReturnType<typeof buildSignalHistory>>;

  const fallbackPrice = latestSignal?.close ?? 0;

  const sigmaContent = latestSignal == null ? (
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
      <SigmaTabContent signalsByWindow={signalsByWindow} signalHistoryByWindow={signalHistoryByWindow} symbol={ticker.symbol} availableDays={closes5y.length - 1} />
      <DeclinePriceChart history={history} symbol={ticker.symbol} />
    </div>
  );

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-start justify-between gap-4">
          <PriceBlock ticker={ticker} latest={latestSignal} />
          {userCtx.user && (
            <div className="pt-1">
              <WatchlistButton symbol={ticker.symbol} isWatchlisted={userCtx.isWatchlisted} />
            </div>
          )}
        </div>

        <TickerTabs
          sigmaContent={sigmaContent}
          mddContent={
            <Suspense fallback={<TabSkeleton />}>
              <MddTabLoader slug={ticker.slug} symbol={ticker.symbol} />
            </Suspense>
          }
          journalContent={
            <Suspense fallback={<TabSkeleton />}>
              <JournalTabLoader slug={ticker.slug} symbol={ticker.symbol} fallbackPrice={fallbackPrice} />
            </Suspense>
          }
        />
      </div>
    </main>
  );
}
