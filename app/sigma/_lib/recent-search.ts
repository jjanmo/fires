const RECENT_KEY = 'sigma_recent';
const MAX_RECENT = 10;

type RecentItem = { symbol: string; slug: string; name: string; timestamp: number };

export const getRecentSlugs = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const items: RecentItem[] = raw ? JSON.parse(raw) : [];
    return items.map((i) => i.slug);
  } catch {
    return [];
  }
};

export const saveRecentSearch = (symbol: string, slug: string, name: string): void => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const items: RecentItem[] = raw ? JSON.parse(raw) : [];
    const filtered = items.filter((i) => i.slug !== slug);
    const next = [{ symbol, slug, name, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
};
