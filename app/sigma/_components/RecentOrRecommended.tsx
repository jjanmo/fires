'use client';

import { useEffect, useState } from 'react';
import { TickerCard, type TickerInfo } from '@/entities/ticker';
import { fetchSigmaCards, type SigmaCardData } from '@/features/sigma';
import { getRecentSlugs } from '../_lib/recent-search';
import RecommendedCard from './RecommendedCard';

const RECOMMENDED_SLUGS = ['soxl', 'tqqq', 'fngu', 'nvda'];

const SECTION_LABEL: Record<'recent' | 'recommended', string> = {
  recent: '최근 검색',
  recommended: '추천 종목',
};

type Mode = 'loading' | 'recent' | 'recommended';

const CardSkeleton = () => (
  <div className="rounded-2xl border border-edge bg-card p-3.5 h-44 animate-pulse" />
);


const RecentOrRecommended = () => {
  const [mode, setMode] = useState<Mode>('loading');
  const [cards, setCards] = useState<SigmaCardData[]>([]);

  useEffect(() => {
    const recentSlugs = getRecentSlugs();
    const isRecent = recentSlugs.length > 0;
    const slugs = isRecent ? recentSlugs : RECOMMENDED_SLUGS;

    fetchSigmaCards(slugs).then((data) => {
      setCards(data);
      setMode(isRecent ? 'recent' : 'recommended');
    });
  }, []);

  if (mode === 'loading') {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink-3">{SECTION_LABEL[mode]}</p>

      {mode === 'recent' && (
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
      )}

      {mode === 'recommended' && (
        <div className="flex flex-col gap-2">
          {cards.map((card) => <RecommendedCard key={card.slug} {...card} />)}
        </div>
      )}
    </div>
  );
};

export default RecentOrRecommended;
