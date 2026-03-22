import type { ClosePrice, SigmaResult, HistoryRow } from './types'

/** 일간 등락률 배열 계산 (종가 기준) */
export function calcDailyReturns(closes: ClosePrice[]): number[] {
  const returns: number[] = []
  for (let i = 1; i < closes.length; i++) {
    const r = (closes[i].price - closes[i - 1].price) / closes[i - 1].price * 100
    returns.push(r)
  }
  return returns
}

/**
 * Rolling 252일 σ 계산
 * targetIndex: returns 배열 기준 인덱스 — 이 값은 window에 포함하지 않음
 */
export function calcRolling252(
  returnsArr: number[],
  targetIndex: number
): SigmaResult | null {
  const start = Math.max(0, targetIndex - 252)
  const window = returnsArr.slice(start, targetIndex)

  if (window.length < 20) return null

  const mu = window.reduce((a, b) => a + b, 0) / window.length
  const variance = window.reduce((a, b) => a + (b - mu) ** 2, 0) / (window.length - 1)
  const sigma = Math.sqrt(variance)

  return {
    mu:    +mu.toFixed(4),
    sigma: +sigma.toFixed(4),
    s2d:   +(mu - 2 * sigma).toFixed(4),
    s2u:   +(mu + 2 * sigma).toFixed(4),
  }
}

/** 종가 기준 지정가 계산 */
export function calcOrderPrices(
  close: number,
  s: SigmaResult
): Pick<HistoryRow, 'buyPrice' | 'sellPrice' | 's1BuyPrice'> {
  return {
    buyPrice:   +(close * (1 + s.s2d / 100)).toFixed(2),
    sellPrice:  +(close * (1 + s.s2u / 100)).toFixed(2),
    s1BuyPrice: +(close * (1 - s.sigma / 100)).toFixed(2),
  }
}

/**
 * 전체 히스토리 빌드 — 각 행은 "실행일" 기준
 *
 * closes[i+1] = 실행일 (지정가가 활성화된 날)
 * closes[i]   = 기준일 (전날 종가로 지정가를 계산)
 *
 * 각 행의 의미:
 *   date / open / high / low / close  → 실행일의 실제 가격
 *   buyPrice / sellPrice              → 전날 종가 기준으로 계산된 당일 활성 지정가
 *   triggered                         → low ≤ buyPrice → 'buy', high ≥ sellPrice → 'sell'
 */
export function buildHistory(closes: ClosePrice[]): HistoryRow[] {
  const returns = calcDailyReturns(closes)
  const rows: HistoryRow[] = []

  closes.slice(1).forEach((today, i) => {
    const yesterday = closes[i]
    const s = calcRolling252(returns, i)  // σ: 전날까지의 데이터 기준
    if (!s) return

    const orders = calcOrderPrices(yesterday.price, s)
    const actualReturn: number | null = returns[i] ?? null

    rows.push({
      date:  today.date,
      open:  today.open,
      high:  today.high,
      low:   today.low,
      close: today.price,
      ...s,
      ...orders,
      actualReturn,
      triggered:
        today.low  <= orders.buyPrice  ? 'buy'  :
        today.high >= orders.sellPrice ? 'sell' : null,
    })
  })

  return rows
}

/**
 * 최신 신호 계산 — 오늘 종가 기준 내일 지정가
 *
 * SignalCards / SigmaDetail / SplitPlanner 등 "내일 주문" 용도로 사용
 * - buyPrice / sellPrice: 오늘 종가 + 최신 σ로 계산한 내일 지정가
 * - triggered: 오늘 O/H/L/C가 어제 지정가를 건드렸는지 여부
 */
export function buildLatestSignal(closes: ClosePrice[]): HistoryRow | null {
  const returns = calcDailyReturns(closes)
  const N = closes.length

  // 내일 지정가용 σ — 오늘 등락률 포함 전체 데이터
  const sTomorrow = calcRolling252(returns, N - 1)
  if (!sTomorrow) return null

  const latest = closes[N - 1]
  const orders = calcOrderPrices(latest.price, sTomorrow)
  const actualReturn: number | null = returns[N - 2] ?? null

  // 오늘의 트리거 여부: 오늘 OHLC가 어제 계산한 지정가를 건드렸는지
  const sYesterday = N >= 2 ? calcRolling252(returns, N - 2) : null
  const prevOrders = sYesterday ? calcOrderPrices(closes[N - 2].price, sYesterday) : null

  const triggered: 'buy' | 'sell' | null =
    prevOrders === null               ? null   :
    latest.low  <= prevOrders.buyPrice  ? 'buy'  :
    latest.high >= prevOrders.sellPrice ? 'sell' : null

  return {
    date:  latest.date,
    open:  latest.open,
    high:  latest.high,
    low:   latest.low,
    close: latest.price,
    ...sTomorrow,
    ...orders,
    actualReturn,
    triggered,
  }
}
