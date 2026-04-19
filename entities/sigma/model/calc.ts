import type { ClosePrice, SigmaResult, HistoryRow, SignalRow, MddResult, MddPoint, RollingWindow } from './types';

/** 일간 등락률 배열 계산 (종가 기준) */
export function calcDailyReturns(closes: ClosePrice[]): number[] {
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
export function calcRolling252(returnsArr: number[], targetIndex: number, windowSize = 252): SigmaResult | null {
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

/** MDD + 수중 곡선 계산 (종가 기준, max range 데이터 권장) */
export function calcMdd(closes: ClosePrice[]): MddResult | null {
  if (!closes.length) return null;

  // ── 1. ATH ──────────────────────────────────────────────────────
  let athPrice = closes[0].price;
  let athHighPrice = closes[0].high;
  for (const c of closes) {
    if (c.price > athPrice) athPrice = c.price;
    if (c.high > athHighPrice) athHighPrice = c.high;
  }

  // ── 2. 수중 곡선 & MDD ──────────────────────────────────────────
  let rollingMax = closes[0].price;
  let mdd = 0;
  const series: MddPoint[] = closes.map((c) => {
    if (c.price > rollingMax) rollingMax = c.price;
    const dd = +(((c.price - rollingMax) / rollingMax) * 100).toFixed(2);
    if (dd < mdd) mdd = dd;
    return { date: c.date, dd };
  });

  const currentDD = series[series.length - 1].dd;
  const mddRatio = mdd !== 0 ? +((currentDD / mdd) * 100).toFixed(1) : 0;

  return {
    mdd: +mdd.toFixed(2),
    currentDD: +currentDD.toFixed(2),
    mddRatio,
    athPrice: +athPrice.toFixed(2),
    athHighPrice: +athHighPrice.toFixed(2),
    series,
  };
}

/** 종가 기준 지정가 계산 */
export function calcOrderPrices(
  close: number,
  s: SigmaResult
): Pick<HistoryRow, 'buyPrice' | 'sellPrice' | 's1BuyPrice' | 's1SellPrice'> {
  return {
    buyPrice: +(close * (1 + s.s2d / 100)).toFixed(2),
    sellPrice: +(close * (1 + s.s2u / 100)).toFixed(2),
    s1BuyPrice: +(close * (1 + (s.mu - s.sigma) / 100)).toFixed(2),
    s1SellPrice: +(close * (1 + (s.mu + s.sigma) / 100)).toFixed(2),
  };
}

/**
 * 전체 히스토리 빌드 — 각 행은 "실행일" 기준
 */
export function buildHistory(closes: ClosePrice[]): HistoryRow[] {
  const returns = calcDailyReturns(closes);
  const rows: HistoryRow[] = [];

  closes.slice(1).forEach((today, i) => {
    const yesterday = closes[i];
    const s = calcRolling252(returns, i);
    if (!s) return;

    const orders = calcOrderPrices(yesterday.price, s);
    const actualReturn: number | null = returns[i] ?? null;

    rows.push({
      date: today.date,
      open: today.open,
      high: today.high,
      low: today.low,
      close: today.price,
      ...s,
      ...orders,
      actualReturn,
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
 * actualReturn vs σ 기준으로 신호 판단: window 배열 제외(직렬화 비용 절감)
 */
export function buildSignalHistory(
  closes: ClosePrice[],
  windowSize: RollingWindow = 252,
  days = 30
): SignalRow[] {
  if (closes.length < 2) return [];

  const returns = calcDailyReturns(closes);
  const rows: SignalRow[] = [];

  const totalRows = closes.length - 1;
  const startIdx = Math.max(0, totalRows - days);

  for (let i = startIdx; i < totalRows; i++) {
    const today = closes[i + 1];
    const s = calcRolling252(returns, i, windowSize);
    if (!s) continue;

    rows.push({
      date:         today.date,
      actualReturn: returns[i] ?? null,
      mu:           s.mu,
      sigma:        s.sigma,
      s2d:          s.s2d,
      s2u:          s.s2u,
    });
  }

  return rows;
}

/**
 * 최신 신호 계산 — 오늘 종가 기준 내일 지정가
 * windowSize: 롤링 기간 (기본 252일)
 */
export function buildLatestSignal(closes: ClosePrice[], windowSize = 252): HistoryRow | null {
  const returns = calcDailyReturns(closes);
  const N = closes.length;

  const s = calcRolling252(returns, N - 1, windowSize);
  if (!s) return null;

  const latest = closes[N - 1];
  const orders = calcOrderPrices(latest.price, s);
  const actualReturn: number | null = returns[N - 2] ?? null;

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
    ...s,
    ...orders,
    actualReturn,
    triggered,
  };
}
