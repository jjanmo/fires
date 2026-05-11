import { Suspense } from 'react';
import { createClient } from '@/shared/lib/supabase/server';
import { getFavoriteSymbols } from '@/features/favorite';
import FavoriteCard from './FavoriteCard';
import DraggableGrid from './DraggableGrid';
import RecentOrRecommended from './RecentOrRecommended';
import CardSkeleton from './CardSkeleton';

const SigmaSection = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const symbols = await getFavoriteSymbols(user.id);
    if (symbols.length > 0) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-3">즐겨찾기</p>
          <DraggableGrid
            initialSymbols={symbols}
            cards={symbols.map((symbol, i) => (
              <Suspense key={symbol} fallback={<CardSkeleton />}>
                <FavoriteCard symbol={symbol} index={i} />
              </Suspense>
            ))}
          />
        </div>
      );
    }
  }

  return <RecentOrRecommended />;
};

export default SigmaSection;
