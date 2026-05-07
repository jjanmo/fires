import type { ClosePrice, SigmaResult, HistoryRow, SignalRow, RollingWindow } from './types';

/** 일간 등락률 배열 계산 (종가 기준) */
export const calcDailyReturns = (closes: ClosePrice[]): number[] => {
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const r = ((closes[i].price - closes[i - 1].price) / closes[i - 1].price) * 100;
    returns.push(r);
  }
  return returns;
}

/**
 * Rolling σ 계산
 * targetIndex: returns 배열 기준 인덱스 — 이 값은 window에 포함하지 않음
 * windowSize: 롤링 기간 (기본 252일)
 */
export const calcRolling252 = (returnsArr: number[], targetIndex: number, windowSize = 252): SigmaResult | null => {
  const start = Math.max(0, targetIndex - windowSize);
  const window = returnsArr.slice(start, targetIndex);

  if (window.length < 20) return null;

  const mu = window.reduce((a, b) => a + b, 0) / window.length;
  const variance = window.reduce((a, b) => a + (b - mu) ** 2, 0) / (window.length - 1);
  const sigma = Math.sqrt(variance);

  return {
    mu: +mu.toFixed(4),
    sigma: +sigma.toFixed(4),
    s2d: +(mu - 2 * sigma).toFixed(4),
    s2u: +(mu + 2 * sigma).toFixed(4),
    window,
  };
}


/** 종가 기준 지정가 계산 */
export const calcOrderPrices = (
  close: number,
  s: SigmaResult
): Pick<HistoryRow, 'buyPrice' | 'sellPrice' | 's1BuyPrice' | 's1SellPrice'> => ({
  buyPrice: +(close * (1 + s.s2d / 100)).toFixed(2),
  sellPrice: +(close * (1 + s.s2u / 100)).toFixed(2),
  s1BuyPrice: +(close * (1 + (s.mu - s.sigma) / 100)).toFixed(2),
  s1SellPrice: +(close * (1 + (s.mu + s.sigma) / 100)).toFixed(2),
})

/**
 * 전체 히스토리 빌드 — 각 행은 "실행일" 기준
 * windowSize: 롤링 기간 (기본 252일) — 윈도우별 triggered 계산에 사용
 */
export const buildHistory = (closes: ClosePrice[], windowSize: RollingWindow = 252): HistoryRow[] => {
  const returns = calcDailyReturns(closes);
  const rows: HistoryRow[] = [];

  closes.slice(1).forEach((today, i) => {
    const yesterday = closes[i];
    const s = calcRolling252(returns, i, windowSize);
    if (!s) return;

    const orders = calcOrderPrices(yesterday.price, s);
    const actualReturn: number | null = returns[i] ?? null;
    const lowReturn = ((today.low - yesterday.price) / yesterday.price) * 100;

    rows.push({
      date: today.date,
      open: today.open,
      high: today.high,
      low: today.low,
      close: today.price,
      baseClose: yesterday.price,
      ...s,
      ...orders,
      actualReturn,
      lowReturn: +lowReturn.toFixed(4),
      triggered:
        today.low <= orders.buyPrice
          ? 'buy-2s'
          : today.low <= orders.s1BuyPrice
          ? 'buy-1s'
          : today.high >= orders.sellPrice
          ? 'sell-2s'
          : today.high >= orders.s1SellPrice
          ? 'sell-1s'
          : null,
    });
  });

  return rows;
}

/**
 * 최근 N 거래일의 신호 분류용 데이터 빌드
 * 현재 σ 기준(latest)을 고정값으로 사용 — 각 날마다 재계산하지 않음
 */
export const buildSignalHistory = (
  closes: ClosePrice[],
  latest: HistoryRow,
  days = 30
): SignalRow[] => {
  if (closes.length < 2) return [];

  const returns = calcDailyReturns(closes);
  const totalRows = closes.length - 1;
  const startIdx = Math.max(0, totalRows - days);

  return Array.from({ length: totalRows - startIdx }, (_, k) => {
    const i = startIdx + k;
    return {
      date:         closes[i + 1].date,
      actualReturn: returns[i] ?? null,
      mu:           latest.mu,
      sigma:        latest.sigma,
      s2d:          latest.s2d,
      s2u:          latest.s2u,
    };
  });
}

/**
 * 최신 신호 계산 — 오늘 종가 기준 내일 지정가
 * windowSize: 롤링 기간 (기본 252일)
 */
export const buildLatestSignal = (closes: ClosePrice[], windowSize = 252): HistoryRow | null => {
  const returns = calcDailyReturns(closes);
  const N = closes.length;

  const s = calcRolling252(returns, N - 1, windowSize);
  if (!s) return null;

  const latest = closes[N - 1];
  const prev = closes[N - 2];
  const orders = calcOrderPrices(prev.price, s);
  const actualReturn: number | null = returns[N - 2] ?? null;
  const lowReturn = prev ? +((latest.low - prev.price) / prev.price * 100).toFixed(4) : 0;

  const triggered: HistoryRow['triggered'] =
    latest.low <= orders.buyPrice
      ? 'buy-2s'
      : latest.low <= orders.s1BuyPrice
      ? 'buy-1s'
      : latest.high >= orders.sellPrice
      ? 'sell-2s'
      : latest.high >= orders.s1SellPrice
      ? 'sell-1s'
      : null;

  return {
    date: latest.date,
    open: latest.open,
    high: latest.high,
    low: latest.low,
    close: latest.price,
    baseClose: prev.price,
    ...s,
    ...orders,
    actualReturn,
    lowReturn,
    triggered,
  };
}
