import Link from 'next/link';
import type { SigmaCardData } from '@/features/sigma';
import { formatPrice, isKoreanTicker } from '@/shared/lib/ticker';

const RecommendedCard = ({ slug, symbol, name, latest }: SigmaCardData) => {
  const isKR = isKoreanTicker(symbol);
  const displayName = isKR ? name.replace(/\(.*\)$/, '') : symbol;
  const subLabel = isKR ? symbol : name;

  return (
    <Link
      href={`/sigma/${slug}`}
      className="flex items-center justify-between rounded-xl border border-edge bg-card px-4 py-3 hover:bg-inset hover:border-edge-hi transition-colors"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-1 truncate">{displayName}</p>
        <p className="text-xs text-ink-4 truncate">{subLabel}</p>
      </div>
      {latest ? (
        <div className="text-right shrink-0 ml-6">
          <p className="text-sm font-mono tabular-nums text-ink-1">{formatPrice(latest.close, symbol)}</p>
          <p className="text-xs font-mono tabular-nums text-buy-val">↓ {formatPrice(latest.buyPrice, symbol)}</p>
        </div>
      ) : (
        <p className="text-xs text-ink-4 ml-6">—</p>
      )}
    </Link>
  );
};

export default RecommendedCard;
