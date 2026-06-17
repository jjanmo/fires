import type { ClosePrice } from "../model/types";
import { isKoreanTicker, isKrxMarketHours, isNyseMarketHours } from "@/shared/lib/ticker";
import { AppError } from "@/shared/lib/app-error";

const isMarketHours = (symbol: string): boolean =>
  isKoreanTicker(symbol) ? isKrxMarketHours() : isNyseMarketHours();

export const fetchCloses = async (
  symbol: string,
  range: "1y" | "2y" | "5y" | "max" = "5y",
): Promise<ClosePrice[]> => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=${range}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/455.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://finance.yahoo.com",
      Origin: "https://finance.yahoo.com",
    },
    next: { revalidate: isMarketHours(symbol) ? 60 : 3600 },
  });

  if (!res.ok) {
    throw res.status === 404
      ? new AppError('SYMBOL_NOT_FOUND')
      : new AppError('FETCH_FAILED')
  }

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new AppError('SYMBOL_NOT_FOUND');

  const timestamps: number[] = result.timestamp;
  const quote = result.indicators.quote[0];
  const rawOpens: (number | null)[] = quote.open;
  const rawHighs: (number | null)[] = quote.high;
  const rawLows: (number | null)[] = quote.low;
  const rawCloses: (number | null)[] = quote.close;

  const raw = timestamps
    .map((t, i) => {
      const open  = rawOpens[i];
      const high  = rawHighs[i];
      const low   = rawLows[i];
      const price = rawCloses[i];

      if (price === null || price === 0) return null;
      if (open === null || high === null || low === null) return null;

      return {
        date: new Date(t * 1000).toISOString().slice(0, 10),
        open:  +open,
        high:  +high,
        low:   +low,
        price: +price,
      } satisfies ClosePrice;
    })
    .filter((r): r is ClosePrice => r !== null);

  // 같은 날짜 중복 시 마지막 항목(최신 데이터)만 유지
  const seen = new Map<string, ClosePrice>();
  for (const row of raw) seen.set(row.date, row);

  return Array.from(seen.values());
}
