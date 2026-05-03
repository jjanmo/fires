'use client';

import { useEffect } from 'react';
import { saveRecentSearch } from '../_lib/recent-search';

const SaveRecentSearch = ({ symbol, slug, name }: { symbol: string; slug: string; name: string }) => {
  useEffect(() => {
    saveRecentSearch(symbol, slug, name);
  }, [symbol, slug, name]);

  return null;
};

export default SaveRecentSearch;
