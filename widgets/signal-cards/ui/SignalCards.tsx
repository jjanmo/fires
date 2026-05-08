import type { HistoryRow } from '@/entities/sigma';
import { formatPrice, isKoreanTicker } from '@/shared/lib/ticker';


interface Props {
  latest: HistoryRow;
  symbol: string;
}

/**
 * 오늘 날짜(KST) 기준 장중 날짜 계산
 * 국내: 토/일 → 금요일 (마지막 거래일)
 * 해외: 토요일은 토요일 그대로, 일요일 → 토요일 (미국 금요일 장이 KST 토요일까지 열리므로)
 */
const orderDate = (symbol: string): string => {
  const now = new Date();
  const day = now.getDay();

  if (isKoreanTicker(symbol)) {
    if (day === 6) now.setDate(now.getDate() - 1); // 토 → 금
    if (day === 0) now.setDate(now.getDate() - 2); // 일 → 금
  } else {
    if (day === 0) now.setDate(now.getDate() - 1); // 일 → 토
  }

  return `${now.getMonth() + 1}월 ${now.getDate()}일`;
}

const SignalCards = ({ latest, symbol }: Props) => {
  const dateLabel = orderDate(symbol);
  const s1d = latest.mu - latest.sigma;
  const s1u = latest.mu + latest.sigma;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 매수 카드 */}
      <div className="rounded-2xl bg-buy-bg border border-buy-edge p-5">
        <p className="text-[11px] font-semibold text-buy-text uppercase tracking-widest mb-4">
          {dateLabel} · 매수 지정가
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-ink-4 mb-1">1<span className="normal-case">σ</span> 매수가</p>
            <p className="text-xl font-bold tabular-nums text-buy-val">{formatPrice(latest.s1BuyPrice, symbol)}</p>
            <p className="text-[10px] text-ink-4 mt-1 font-mono">{s1d.toFixed(2)}% (μ - 1<span className="normal-case">σ</span>)</p>
          </div>
          <div>
            <p className="text-[10px] text-ink-4 mb-1">2<span className="normal-case">σ</span> 매수가</p>
            <p className="text-xl font-bold tabular-nums text-buy-val">{formatPrice(latest.buyPrice, symbol)}</p>
            <p className="text-[10px] text-ink-4 mt-1 font-mono">{latest.s2d.toFixed(2)}% (μ - 2<span className="normal-case">σ</span>)</p>
          </div>
        </div>
      </div>

      {/* 매도 카드 */}
      <div className="rounded-2xl bg-sell-bg border border-sell-edge p-5">
        <p className="text-[11px] font-semibold text-sell-text uppercase tracking-widest mb-4">
          {dateLabel} · 매도 지정가
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-ink-4 mb-1">1<span className="normal-case">σ</span> 매도가</p>
            <p className="text-xl font-bold tabular-nums text-sell-val">{formatPrice(latest.s1SellPrice, symbol)}</p>
            <p className="text-[10px] text-ink-4 mt-1 font-mono">+{s1u.toFixed(2)}% (μ + 1<span className="normal-case">σ</span>)</p>
          </div>
          <div>
            <p className="text-[10px] text-ink-4 mb-1">2<span className="normal-case">σ</span> 매도가</p>
            <p className="text-xl font-bold tabular-nums text-sell-val">{formatPrice(latest.sellPrice, symbol)}</p>
            <p className="text-[10px] text-ink-4 mt-1 font-mono">+{latest.s2u.toFixed(2)}% (μ + 2<span className="normal-case">σ</span>)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalCards;
