import type { ClosePrice } from "../model/types";

/**
 * 현재 시각이 NYSE 정규장 시간인지 판단 (평일 09:30~16:00 ET)
 * > 미국 3대 거래소 모두 정규장 시간이 동일
 * DST 여부를 정확히 처리하기 위해 Intl.DateTimeFormat으로 ET 현지시각을 구함 (서머타임 고려됨)
 */
function isMarketHours(): boolean {
  const now = new Date();
  // 주말 제외
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
  }).format(now);
  if (weekday === "Sun" || weekday === "Sat") return false;

  const timeET = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(now);

  const [h, m] = timeET.split(":").map(Number);
  const minutes = h * 60 + m;

  // 09:30 ~ 16:00 ET
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

export async function fetchCloses(
  symbol: string,
  range: "1y" | "2y" | "5y" | "max" = "5y",
): Promise<ClosePrice[]> {
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
    next: { revalidate: isMarketHours() ? 60 : 3600 },
  });

  if (!res.ok) throw new Error(`Yahoo Finance 요청 실패 (${res.status})`);

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error("Yahoo Finance 데이터 파싱 실패");

  const timestamps: number[] = result.timestamp;
  const quote = result.indicators.quote[0];
  const rawOpens: (number | null)[] = quote.open;
  const rawHighs: (number | null)[] = quote.high;
  const rawLows: (number | null)[] = quote.low;
  const rawCloses: (number | null)[] = quote.close;
  // adjclose: split + 배당 보정된 종가 (기준값)
  const adjCloses: (number | null)[] =
    result.indicators.adjclose?.[0]?.adjclose ?? [];

  const raw = timestamps
    .map((t, i) => {
      const rawClose = rawCloses[i];
      const adjClose = adjCloses[i] ?? null;

      // adjclose가 없거나 rawClose가 0이면 제외
      if (rawClose === null || rawClose === 0 || adjClose === null) return null;

      // 조정 비율: split/배당을 반영해 OHLC 전체를 동일한 스케일로 맞춤
      const factor = adjClose / rawClose;

      const open = rawOpens[i];
      const high = rawHighs[i];
      const low = rawLows[i];
      if (open === null || high === null || low === null) return null;

      return {
        date: new Date(t * 1000).toISOString().slice(0, 10),
        open: +(open * factor),
        high: +(high * factor),
        low: +(low * factor),
        price: adjClose, // 이미 보정된 값
      } satisfies ClosePrice;
    })
    .filter((r): r is ClosePrice => r !== null);

  // 같은 날짜 중복 시 마지막 항목(최신 데이터)만 유지
  const seen = new Map<string, ClosePrice>();
  for (const row of raw) seen.set(row.date, row);

  return Array.from(seen.values());
}
