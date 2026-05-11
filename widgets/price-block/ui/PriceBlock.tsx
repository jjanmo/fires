'use client';

import type { ReactNode } from 'react';
import { useLivePrice } from '@/shared/hooks';
import type { HistoryRow } from '@/entities/sigma';
import type { TickerInfo } from '@/entities/ticker';
import { formatPrice, formatChange } from '@/shared/lib/ticker';
import { cn } from '@/shared/lib/cn';

interface Props {
  ticker: TickerInfo;
  latest: HistoryRow | null;
  high52w?: number;
  action?: ReactNode;
}

const MARKET_BADGE: Record<string, { text: string; cls: string }> = {
  REGULAR: { text: '● 정규장', cls: 'text-buy-text bg-buy-badge border-buy-edge' },
  PRE: { text: '장전 거래', cls: 'text-ink-3 bg-inset border-edge' },
  POST: { text: '장후 거래', cls: 'text-ink-3 bg-inset border-edge' },
  CLOSED: { text: '장 마감', cls: 'text-ink-4 bg-inset border-edge' },
};

const PriceBlock = ({ ticker, latest, high52w, action }: Props) => {
  const { price, change, changePct, marketState, loading } = useLivePrice(ticker.symbol, latest?.close ?? 0);
  const pct52w = high52w && high52w > 0 ? +((price / high52w - 1) * 100).toFixed(1) : null;

  const isPositive = changePct >= 0;
  const badge = MARKET_BADGE[marketState] ?? MARKET_BADGE.CLOSED;

  return (
    <div className="flex justify-between gap-4 w-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('text-xs font-semibold tracking-widest uppercase', ticker.accentColor)}>{ticker.name}</span>
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', badge.cls)}>{badge.text}</span>
        </div>

        <p className={cn('text-4xl sm:text-5xl font-bold tabular-nums text-ink-1 transition-opacity', loading && 'opacity-50')}>
          {formatPrice(price, ticker.symbol)}
        </p>

        <p className={cn('mt-1 text-sm font-mono', isPositive ? 'text-gain' : 'text-loss')}>
          {isPositive ? '+' : ''}
          {changePct.toFixed(2)}%<span className="text-ink-4 ml-1.5">({formatChange(change, ticker.symbol)})</span>
        </p>
        {pct52w !== null && (
          <p className="mt-0.5 text-xs font-mono text-ink-4">
            52주 고가 대비{' '}
            <span className={pct52w >= 0 ? 'text-gain' : 'text-loss'}>
              {pct52w >= 0 ? '+' : ''}
              {pct52w}%
            </span>
          </p>
        )}
      </div>

      <div className="shrink-0">
        {action}
      </div>
    </div>
  );
};

export default PriceBlock;
