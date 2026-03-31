'use client';

import { useLivePrice } from '@/shared/hooks';
import type { HistoryRow } from '@/entities/sigma';
import type { TickerInfo } from '@/entities/ticker';
import { formatPrice, formatChange } from '@/shared/lib/ticker';

interface Props {
  ticker: TickerInfo;
  latest: HistoryRow;
}

const MARKET_BADGE: Record<string, { text: string; cls: string }> = {
  REGULAR: { text: '● 장중 실시간', cls: 'text-buy-text bg-buy-badge border-buy-edge' },
  PRE: { text: '장전 거래', cls: 'text-ink-3 bg-inset border-edge' },
  POST: { text: '장후 거래', cls: 'text-ink-3 bg-inset border-edge' },
  CLOSED: { text: '장 마감', cls: 'text-ink-4 bg-inset border-edge' },
};

export default function PriceBlock({ ticker, latest }: Props) {
  const { price, change, changePct, marketState, loading } = useLivePrice(ticker.symbol, latest.close);

  const isPositive = changePct >= 0;
  const badge = MARKET_BADGE[marketState] ?? MARKET_BADGE.CLOSED;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold tracking-widest uppercase ${ticker.accentColor}`}>
            {ticker.symbol}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.text}</span>
          {marketState === 'REGULAR' && (latest.triggered === 'buy-1s' || latest.triggered === 'buy-2s') && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-buy-badge text-buy-text border border-buy-edge">
              {latest.triggered === 'buy-2s' ? '2' : '1'}<span className="normal-case">σ</span> 매수 신호
            </span>
          )}
          {marketState === 'REGULAR' && latest.triggered === 'sell-2s' && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sell-badge text-sell-text border border-sell-edge">
              2<span className="normal-case">σ</span> 매도 신호
            </span>
          )}
        </div>

        <p
          className={`text-4xl sm:text-5xl font-bold tabular-nums text-ink-1 transition-opacity ${
            loading ? 'opacity-50' : ''
          }`}
        >
          {formatPrice(price, ticker.symbol)}
        </p>

        <p className={`mt-1 text-sm font-mono ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {isPositive ? '+' : ''}
          {changePct.toFixed(2)}%
          <span className="text-ink-4 ml-1.5">
            ({formatChange(change, ticker.symbol)})
          </span>
        </p>
      </div>

      <div className="text-right">
        <p className="text-[11px] text-ink-3 font-mono">{latest.date} 종가 기준</p>
      </div>
    </div>
  );
}
