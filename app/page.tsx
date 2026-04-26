import { Suspense } from 'react';
import { getWatchlistSymbols } from '@/features/watchlist';
import { createClient } from '@/shared/lib/supabase/server';
import WatchlistCard from './_components/WatchlistCard';
import WatchlistEmpty from './_components/WatchlistEmpty';
import { CardSkeleton } from './loading';

const HomePage = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const watchlistSymbols = user ? await getWatchlistSymbols(user.id) : [];

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        {user && (
          <div>
            <h2 className="text-base font-semibold text-ink-2 mb-1">관심종목</h2>
            <p className="text-xs text-ink-4 mb-3">★ 표시한 종목</p>

            {watchlistSymbols.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlistSymbols.map((symbol, index) => (
                  <Suspense key={symbol} fallback={<CardSkeleton />}>
                    <WatchlistCard symbol={symbol} index={index} />
                  </Suspense>
                ))}
              </div>
            ) : (
              <WatchlistEmpty />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default HomePage
