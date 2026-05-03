import { TickerCard, getTickerColor } from '@/entities/ticker';
import type { TickerInfo } from '@/entities/ticker';
import { buildLatestSignal, fetchCloses } from '@/entities/sigma';
import { getKrStockName } from '@/shared/lib/kr-stocks';

const WatchlistCard = async ({ symbol, index, compact }: { symbol: string; index: number; compact?: boolean }) => {
  const ticker: TickerInfo = {
    symbol: symbol.toUpperCase(),
    name: getKrStockName(symbol) ?? symbol.toUpperCase(),
    slug: symbol.toLowerCase(),
    description: '',
    ...getTickerColor(index),
  };

  let latest = null;
  let error: string | undefined;

  try {
    const closes = await fetchCloses(symbol.toLowerCase());
    latest = buildLatestSignal(closes) ?? null;
  } catch {
    error = '데이터 로드 실패';
  }

  return <TickerCard ticker={ticker} latest={latest} error={error} compact={compact} />;
}

export default WatchlistCard
