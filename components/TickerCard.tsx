import Link from 'next/link';
import type { HistoryRow, TickerInfo } from '@/lib/types';

interface Props {
  ticker: TickerInfo;
  latest: HistoryRow | null;
  error?: string;
}

export default function TickerCard({ ticker, latest, error }: Props) {
  const returnSign = latest?.actualReturn != null ? (latest.actualReturn >= 0 ? '+' : '') : '';

  return (
    <Link
      href={`/${ticker.slug}`}
      className={`group block rounded-2xl border bg-card p-6 transition-all duration-200 hover:bg-inset hover:scale-[1.01] ${ticker.borderColor}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`text-xs font-semibold tracking-widest uppercase ${ticker.accentColor}`}>
            {ticker.symbol}
          </span>
          <p className="mt-1 text-[11px] text-ink-3 leading-snug max-w-[180px]">{ticker.description}</p>
        </div>
        {latest && (
          <span
            className={`text-xs font-mono px-2 py-1 rounded-md ${
              latest.actualReturn == null
                ? 'text-ink-3 bg-inset'
                : latest.actualReturn < latest.s2d
                ? 'text-buy-val bg-buy-badge'
                : latest.actualReturn > latest.s2u
                ? 'text-sell-val bg-sell-badge'
                : 'text-ink-3 bg-inset'
            }`}
          >
            {latest.actualReturn != null ? `${returnSign}${latest.actualReturn.toFixed(2)}%` : '—'}
          </span>
        )}
      </div>

      {error || !latest ? (
        <p className="text-ink-3 text-sm">{error ?? '데이터 없음'}</p>
      ) : (
        <>
          <div className="mb-5">
            <p className="text-[11px] text-ink-3 mb-1">최근 종가</p>
            <p className="text-3xl font-semibold tabular-nums text-ink-1">${latest.close.toFixed(2)}</p>
            <p className="text-[11px] text-ink-4 mt-1 font-mono">{latest.date}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-buy-bg border border-buy-edge p-3">
              <p className="text-[10px] text-buy-text uppercase tracking-wider mb-1">
                2<span className="normal-case">σ</span> 매수가
              </p>
              <p className="text-lg font-semibold tabular-nums text-buy-val">${latest.buyPrice.toFixed(2)}</p>
              <p className="text-[10px] text-ink-3 font-mono mt-0.5">{latest.s2d.toFixed(2)}%</p>
            </div>
            <div className="rounded-xl bg-sell-bg border border-sell-edge p-3">
              <p className="text-[10px] text-sell-text uppercase tracking-wider mb-1">
                2<span className="normal-case">σ</span> 매도가
              </p>
              <p className="text-lg font-semibold tabular-nums text-sell-val">${latest.sellPrice.toFixed(2)}</p>
              <p className="text-[10px] text-ink-3 font-mono mt-0.5">+{latest.s2u.toFixed(2)}%</p>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 flex justify-end">
        <span className="text-ink-4 group-hover:text-ink-2 transition-colors text-sm">→</span>
      </div>
    </Link>
  );
}
