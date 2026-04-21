import { Suspense } from 'react';
import type { TickerInfo } from '@/entities/ticker';
import { getKrStockName } from '@/shared/lib/kr-stocks';
import TickerContent from './_components/TickerContent';
import { TickerInnerSkeleton } from './loading';

export default async function TickerPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: slug } = await params;

  const symbol = slug.toUpperCase();
  const krName = getKrStockName(symbol);

  const ticker: TickerInfo = {
    symbol,
    name: krName ? `${krName}(${symbol})` : symbol,
    slug: slug.toLowerCase(),
    description: '',
    accentColor: 'text-ink-2',
    borderColor: 'border-edge',
  };

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <Suspense fallback={<TickerInnerSkeleton />}>
          <TickerContent ticker={ticker} />
        </Suspense>
      </div>
    </main>
  );
}
