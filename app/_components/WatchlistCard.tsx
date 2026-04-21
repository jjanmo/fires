import { TickerCard, getTickerColor } from '@/entities/ticker';
import type { TickerInfo } from '@/entities/ticker';
import { buildLatestSignal, fetchCloses } from '@/entities/sigma';
import { getKrStockName } from '@/shared/lib/kr-stocks';

export default async function WatchlistCard({ symbol, index }: { symbol: string; index: number }) {
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

  return <TickerCard ticker={ticker} latest={latest} error={error} />;
}
