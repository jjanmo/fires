import Link from 'next/link';
import type { HistoryRow } from '@/entities/sigma';
import type { TickerInfo } from '../model/types';
import { formatPrice, isKoreanTicker } from '@/shared/lib/ticker';
import { cn } from '@/shared/lib/cn';

interface Props {
  ticker: TickerInfo;
  latest: HistoryRow | null;
  error?: string;
  compact?: boolean;
}

const getReturnBadgeClass = (latest: HistoryRow) => {
  const s1d = latest.mu - latest.sigma;
  if (latest.actualReturn == null)          return 'text-ink-3 bg-inset';
  if (latest.actualReturn < latest.s2d)     return 'text-buy-val bg-buy-badge';
  if (latest.actualReturn < s1d)            return 'text-buy-val bg-buy-badge';
  if (latest.actualReturn > latest.s2u)     return 'text-sell-val bg-sell-badge';
  return 'text-ink-3 bg-inset';
}

const TickerCard = ({ ticker, latest, error, compact = false }: Props) => {
  const returnSign = latest?.actualReturn != null ? (latest.actualReturn >= 0 ? '+' : '') : '';
  const s1d = latest ? latest.mu - latest.sigma : 0;
  const s1u = latest ? latest.mu + latest.sigma : 0;

  return (
    <Link
      href={`/sigma/${ticker.slug}`}
      className={cn(
        'group block rounded-2xl border bg-card transition-colors duration-200 hover:bg-white/5',
        compact ? 'p-3.5' : 'p-5',
        ticker.borderColor
      )}
    >
      <div className={cn('flex items-start justify-between', compact ? 'mb-3' : 'mb-4')}>
        <div>
          <span className={cn('text-xs font-semibold tracking-widest uppercase', compact && 'truncate block', ticker.accentColor)}>
            {isKoreanTicker(ticker.symbol) ? ticker.name.replace(/\(.*\)$/, '') : ticker.symbol}
          </span>
          <p className="mt-1 text-[11px] text-ink-3 leading-snug max-w-[180px]">{ticker.description}</p>
        </div>
        {latest && (
          <span className={cn('text-xs font-mono px-2 py-1 rounded-md', getReturnBadgeClass(latest))}>
            {latest.actualReturn != null ? `${returnSign}${latest.actualReturn.toFixed(2)}%` : '—'}
          </span>
        )}
      </div>

      {error || !latest ? (
        <p className="text-ink-3 text-sm">{error ?? '데이터 없음'}</p>
      ) : (
        <>
          <div className={compact ? 'mb-3' : 'mb-5'}>
            <p className="text-[11px] text-ink-3 mb-1">최근 종가</p>
            <p className={cn('font-semibold tabular-nums text-ink-1', compact ? 'text-xl' : 'text-3xl')}>
              {formatPrice(latest.close, ticker.symbol)}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-ink-4 font-mono">{latest.date}</p>
              <span className={cn('text-[10px] text-ink-4 font-mono', compact && 'hidden sm:inline')}>Rolling 252일</span>
            </div>
          </div>

          <div className={cn('grid grid-cols-2', compact ? 'gap-2 mb-2' : 'gap-3 mb-3')}>
            <div className={cn('rounded-xl bg-buy-bg border border-buy-edge', compact ? 'p-2' : 'p-3')}>
              <p className="text-[10px] text-buy-text uppercase tracking-wider mb-1">
                1<span className="normal-case">σ</span> 매수가
              </p>
              <p className={cn('font-semibold tabular-nums text-buy-val', compact ? 'text-sm' : 'text-lg')}>
                {formatPrice(latest.s1BuyPrice, ticker.symbol)}
              </p>
              <p className="text-[10px] text-ink-3 font-mono mt-0.5">{s1d.toFixed(2)}%</p>
            </div>
            <div className={cn('rounded-xl bg-buy-bg border border-buy-edge', compact ? 'p-2' : 'p-3')}>
              <p className="text-[10px] text-buy-text uppercase tracking-wider mb-1">
                2<span className="normal-case">σ</span> 매수가
              </p>
              <p className={cn('font-semibold tabular-nums text-buy-val', compact ? 'text-sm' : 'text-lg')}>
                {formatPrice(latest.buyPrice, ticker.symbol)}
              </p>
              <p className="text-[10px] text-ink-3 font-mono mt-0.5">{latest.s2d.toFixed(2)}%</p>
            </div>
          </div>

          <div className={cn('grid grid-cols-2', compact ? 'gap-2' : 'gap-3')}>
            <div className={cn('rounded-xl bg-sell-bg border border-sell-edge', compact ? 'p-2' : 'p-3')}>
              <p className="text-[10px] text-sell-text uppercase tracking-wider mb-1">
                1<span className="normal-case">σ</span> 매도가
              </p>
              <p className={cn('font-semibold tabular-nums text-sell-val', compact ? 'text-sm' : 'text-lg')}>
                {formatPrice(latest.s1SellPrice, ticker.symbol)}
              </p>
              <p className="text-[10px] text-ink-3 font-mono mt-0.5">+{s1u.toFixed(2)}%</p>
            </div>
            <div className={cn('rounded-xl bg-sell-bg border border-sell-edge', compact ? 'p-2' : 'p-3')}>
              <p className="text-[10px] text-sell-text uppercase tracking-wider mb-1">
                2<span className="normal-case">σ</span> 매도가
              </p>
              <p className={cn('font-semibold tabular-nums text-sell-val', compact ? 'text-sm' : 'text-lg')}>
                {formatPrice(latest.sellPrice, ticker.symbol)}
              </p>
              <p className="text-[10px] text-ink-3 font-mono mt-0.5">+{latest.s2u.toFixed(2)}%</p>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}

export default TickerCard
