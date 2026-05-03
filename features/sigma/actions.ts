'use server';

import { fetchCloses, buildLatestSignal } from '@/entities/sigma';
import type { HistoryRow } from '@/entities/sigma';
import { getTickerColor } from '@/entities/ticker';
import { getKrStockName } from '@/shared/lib/kr-stocks';

export type SigmaCardData = {
  slug: string;
  symbol: string;
  name: string;
  latest: HistoryRow | null;
  accentColor: string;
  borderColor: string;
};

export const fetchSigmaCards = async (slugs: string[]): Promise<SigmaCardData[]> => {
  const results = await Promise.all(
    slugs.map(async (slug, index): Promise<SigmaCardData> => {
      const symbol = slug.toUpperCase();
      const krName = getKrStockName(symbol);
      const name = krName ? `${krName}(${symbol})` : symbol;
      const { accentColor, borderColor } = getTickerColor(index);
      try {
        const closes = await fetchCloses(slug, '5y');
        const latest = buildLatestSignal(closes, 252);
        return { slug, symbol, name, latest: latest ?? null, accentColor, borderColor };
      } catch {
        return { slug, symbol, name, latest: null, accentColor, borderColor };
      }
    })
  );
  return results;
};
