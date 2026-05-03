import { getTrades, TradeJournal } from '@/features/trade-journal';

const JournalTabLoader = async ({
  slug,
  symbol,
  fallbackPrice,
}: {
  slug: string;
  symbol: string;
  fallbackPrice: number;
}) => {
  const initialTrades = await getTrades(slug);

  return (
    <TradeJournal
      ticker={slug}
      symbol={symbol}
      fallbackPrice={fallbackPrice}
      initialTrades={initialTrades}
    />
  );
}

export default JournalTabLoader
