'use client';

import { useEffect, useState } from 'react';
import { TickerCard, type TickerInfo } from '@/entities/ticker';
import { fetchSigmaCards, type SigmaCardData } from '@/features/sigma';
import { getRecentSlugs } from '../_lib/recent-search';
import SigmaGuide from './SigmaGuide';

const RecentOrRecommended = () => {
  const [recentCards, setRecentCards] = useState<SigmaCardData[]>([]);

  useEffect(() => {
    const recentSlugs = getRecentSlugs();
    if (recentSlugs.length > 0) {
      fetchSigmaCards(recentSlugs).then(setRecentCards);
    }
  }, []);

  return (
    <div className="space-y-6">
      <SigmaGuide />
      {recentCards.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-3">최근 검색</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {recentCards.map((card) => {
              const ticker: TickerInfo = {
                symbol: card.symbol,
                name: card.name,
                slug: card.slug,
                description: '',
                accentColor: card.accentColor,
                borderColor: card.borderColor,
              };
              return <TickerCard key={card.slug} ticker={ticker} latest={card.latest} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrRecommended;
