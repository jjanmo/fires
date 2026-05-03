'use client';

import { useEffect, useState } from 'react';
import { TickerCard, type TickerInfo } from '@/entities/ticker';
import { fetchSigmaCards, type SigmaCardData } from '@/features/sigma';
import { getRecentSlugs } from '../_lib/recent-search';
import SigmaGuide from './SigmaGuide';

type Mode = 'loading' | 'recent' | 'recommended';

const CardSkeleton = () => (
  <div className="rounded-2xl border border-edge bg-card p-3.5 h-44 animate-pulse" />
);

const RecentOrRecommended = () => {
  const [mode, setMode] = useState<Mode>('loading');
  const [cards, setCards] = useState<SigmaCardData[]>([]);

  useEffect(() => {
    const recentSlugs = getRecentSlugs();
    if (recentSlugs.length > 0) {
      fetchSigmaCards(recentSlugs).then((data) => {
        setCards(data);
        setMode('recent');
      });
    } else {
      setMode('recommended');
    }
  }, []);

  if (mode === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (mode === 'recommended') {
    return <SigmaGuide />;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink-3">최근 검색</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const ticker: TickerInfo = {
            symbol: card.symbol,
            name: card.name,
            slug: card.slug,
            description: '',
            accentColor: card.accentColor,
            borderColor: card.borderColor,
          };
          return <TickerCard key={card.slug} ticker={ticker} latest={card.latest} compact />;
        })}
      </div>
    </div>
  );
};

export default RecentOrRecommended;
