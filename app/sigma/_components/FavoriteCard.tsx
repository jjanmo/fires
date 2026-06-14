import { TickerCard, getTickerColor } from '@/entities/ticker';
import type { TickerInfo } from '@/entities/ticker';
import { buildLatestSignal, fetchCloses } from '@/entities/sigma';
import { getKrStockName } from '@/shared/lib/kr-stocks';

const FavoriteCard = async ({ symbol, index }: { symbol: string; index: number }) => {
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

  // pt-9: 상단 36px 여백 → SortableItem의 DnD 핸들 영역
  // [&>div:first-child]:pr-8: 헤더 행 우측 32px 여백 확보 → CardMenu 버튼과 타이틀 겹침 방지
  return <TickerCard ticker={ticker} latest={latest} error={error} className="pt-9 [&>div:first-child]:pr-8" />;
};

export default FavoriteCard;
