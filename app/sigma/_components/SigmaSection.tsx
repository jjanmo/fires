import { Suspense } from 'react';
import { createClient } from '@/shared/lib/supabase/server';
import { getWatchlistSymbols } from '@/features/watchlist';
import WatchlistCard from './WatchlistCard';
import RecentOrRecommended from './RecentOrRecommended';
import CardSkeleton from './CardSkeleton';

const SigmaSection = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const symbols = await getWatchlistSymbols(user.id);
    if (symbols.length > 0) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-3">즐겨찾기</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {symbols.map((symbol, i) => (
              <Suspense key={symbol} fallback={<CardSkeleton />}>
                <WatchlistCard symbol={symbol} index={i} />
              </Suspense>
            ))}
          </div>
        </div>
      );
    }
  }

  return <RecentOrRecommended />;
};

export default SigmaSection;
