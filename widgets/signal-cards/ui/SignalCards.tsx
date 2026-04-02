import type { HistoryRow } from '@/entities/sigma';
import { formatPrice } from '@/shared/lib/ticker';


interface Props {
  latest: HistoryRow;
  symbol: string;
}

/** 주말을 건너뛴 다음 거래일 — "M월 D일" 형식 */
function nextTradingDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // 토 → 월
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // 일 → 월
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function SignalCards({ latest, symbol }: Props) {
  const dateLabel = nextTradingDate(latest.date);
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
}
