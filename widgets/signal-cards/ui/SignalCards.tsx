import type { HistoryRow } from '@/entities/sigma';


interface Props {
  latest: HistoryRow;
}

/** 주말을 건너뛴 다음 거래일 — "M월 D일" 형식 */
function nextTradingDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // 토 → 월
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // 일 → 월
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function SignalCards({ latest }: Props) {
  const dateLabel = nextTradingDate(latest.date);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-buy-bg border border-buy-edge p-5">
        <p className="text-[11px] font-semibold text-buy-text uppercase tracking-widest mb-3">
          {dateLabel} · 2<span className="normal-case">σ</span> 매수 지정가
        </p>
        <p className="text-3xl font-bold tabular-nums text-buy-val">${latest.buyPrice.toFixed(2)}</p>
        <p className="text-xs text-ink-3 mt-2 font-mono">기준 등락률 {latest.s2d.toFixed(2)}% (평균 - 2<span className="normal-case">σ</span>)</p>
        <div className="mt-4 pt-4 border-t border-buy-edge">
          <p className="text-[11px] text-ink-3">1<span className="normal-case">σ</span> 참고 매수가</p>
          <p className="text-sm text-ink-2 font-mono mt-0.5">${latest.s1BuyPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-sell-bg border border-sell-edge p-5">
        <p className="text-[11px] font-semibold text-sell-text uppercase tracking-widest mb-3">
          {dateLabel} · 2<span className="normal-case">σ</span> 매도 지정가
        </p>
        <p className="text-3xl font-bold tabular-nums text-sell-val">${latest.sellPrice.toFixed(2)}</p>
        <p className="text-xs text-ink-3 mt-2 font-mono">기준 등락률 +{latest.s2u.toFixed(2)}% (평균 + 2<span className="normal-case">σ</span>)</p>
        <div className="mt-4 pt-4 border-t border-sell-edge">
          <p className="text-[11px] text-ink-3">쿼터 매도 권장(25%)</p>
        </div>
      </div>
    </div>
  );
}
