import { Suspense } from 'react';
import type { TickerInfo } from '@/entities/ticker';
import { buildLatestSignal, fetchCloses, ROLLING_WINDOWS } from '@/entities/sigma';
import type { RollingWindow } from '@/entities/sigma';
import { PriceBlock } from '@/widgets/price-block';
import { WatchlistButton, getWatchlistSymbols } from '@/features/watchlist';
import { createClient } from '@/shared/lib/supabase/server';
import SigmaDeferredCharts from './SigmaDeferredCharts';
import SigmaLowerChartsSkeleton from './SigmaLowerChartsSkeleton';
import SigmaWindowContextProvider from './SigmaWindowContextProvider';

const getUserContext = async (symbol: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const watchlistSymbols = user ? await getWatchlistSymbols(user.id) : [];
  return { user, isWatchlisted: watchlistSymbols.includes(symbol) };
};

const TickerContent = async ({ ticker }: { ticker: TickerInfo }) => {
  const [closes5y, userCtx] = await Promise.all([fetchCloses(ticker.slug, '5y'), getUserContext(ticker.symbol)]);

  const signalsByWindow = Object.fromEntries(ROLLING_WINDOWS.map((w) => [w, buildLatestSignal(closes5y, w)])) as Record<
    RollingWindow,
    ReturnType<typeof buildLatestSignal>
  >;

  const latestSignal = signalsByWindow[252];

  const high52w =
    closes5y.length >= 252
      ? Math.max(...closes5y.slice(-252).map((c) => c.price))
      : Math.max(...closes5y.map((c) => c.price));

  const availableDays = closes5y.length - 1;
  const insufficientData = latestSignal == null;
  const insufficientMsg = insufficientData
    ? 'σ 계산에 필요한 데이터가 부족합니다 (최소 20거래일). 신규 상장 종목이거나 거래 정지 상태일 수 있습니다.'
    : closes5y.length < 60
    ? `거래 데이터가 ${closes5y.length}일로 충분하지 않아 σ 통계가 불안정할 수 있습니다. 권장 기준(60거래일)에 도달하면 이 메시지는 사라집니다.`
    : undefined;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PriceBlock ticker={ticker} latest={latestSignal} high52w={high52w} />
        <div className="pt-1">
          <WatchlistButton symbol={ticker.symbol} isWatchlisted={userCtx.isWatchlisted} />
        </div>
      </div>

      <SigmaWindowContextProvider
        signalsByWindow={signalsByWindow}
        availableDays={availableDays}
        insufficientData={insufficientData}
        insufficientMsg={insufficientMsg}
        symbol={ticker.symbol}
      >
        {!insufficientData && (
          <Suspense fallback={<SigmaLowerChartsSkeleton />}>
            <SigmaDeferredCharts closes={closes5y} signalsByWindow={signalsByWindow} />
          </Suspense>
        )}
      </SigmaWindowContextProvider>
    </>
  );
};

export default TickerContent;
