export interface Trade {
  id:    string
  date:  string      // "2024-08-05"
  type:  'buy' | 'sell'
  qty:   number      // 수량 (주)
  price: number      // 체결가 (USD)
  memo:  string
}

export interface TradeStats {
  totalShares:         number  // 현재 보유 수량
  avgCost:             number  // 평균 매수단가 (USD)
  investedUSD:         number  // 매입금액 (USD)
  valuationUSD:        number  // 평가금액 (USD)
  unrealizedPnlUSD:    number  // 미실현 손익 (USD)
  unrealizedPnlKRW:    number  // 미실현 손익 (원)
  unrealizedReturnPct: number  // 미실현 수익률 (%)
  realizedPnlUSD:      number  // 실현 손익 (USD)
  realizedPnlKRW:      number  // 실현 손익 (원)
  totalPnlUSD:         number  // 총 손익 (USD)
  totalPnlKRW:         number  // 총 손익 (원)
}

export interface EnrichedTrade extends Trade {
  avgCostAtTime: number        // 체결 시점 평균단가 — 매도만
  pnlUSD:        number | null // 실현 손익 (USD) — 매도만
  investedUSD:   number        // 매수금액 (USD) — 매수만
}

/** 트레이드 요약 통계 (fxRate: 현재 환율로 일괄 환산) */
export function calcStats(
  trades: Trade[],
  currentPrice: number,
  fxRate: number,
): TradeStats {
  let totalShares    = 0
  let totalCostUSD   = 0
  let realizedPnlUSD = 0

  for (const t of [...trades].sort((a, b) => a.date.localeCompare(b.date))) {
    if (t.type === 'buy') {
      totalCostUSD += t.qty * t.price
      totalShares  += t.qty
    } else {
      if (totalShares <= 0) continue
      const avgCost   = totalCostUSD / totalShares
      realizedPnlUSD += (t.price - avgCost) * t.qty
      totalCostUSD   -= avgCost * t.qty
      totalShares     = Math.max(0, totalShares - t.qty)
    }
  }

  const avgCost             = totalShares > 0 ? totalCostUSD / totalShares : 0
  const valuationUSD        = totalShares * currentPrice
  const unrealizedPnlUSD    = totalShares > 0 ? (currentPrice - avgCost) * totalShares : 0
  const unrealizedReturnPct = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0

  return {
    totalShares,
    avgCost,
    investedUSD: totalCostUSD,
    valuationUSD,
    unrealizedPnlUSD,
    unrealizedPnlKRW:    unrealizedPnlUSD * fxRate,
    unrealizedReturnPct,
    realizedPnlUSD,
    realizedPnlKRW:      realizedPnlUSD * fxRate,
    totalPnlUSD:         unrealizedPnlUSD + realizedPnlUSD,
    totalPnlKRW:         (unrealizedPnlUSD + realizedPnlUSD) * fxRate,
  }
}

/** 각 트레이드에 롤링 평균단가 + 손익 추가 */
export function enrichTrades(trades: Trade[]): EnrichedTrade[] {
  let totalShares  = 0
  let totalCostUSD = 0

  return [...trades]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(t => {
      if (t.type === 'buy') {
        totalCostUSD += t.qty * t.price
        totalShares  += t.qty
        return { ...t, avgCostAtTime: totalCostUSD / totalShares, pnlUSD: null, investedUSD: t.qty * t.price }
      } else {
        const avgCost = totalShares > 0 ? totalCostUSD / totalShares : 0
        const pnlUSD  = (t.price - avgCost) * t.qty
        totalCostUSD -= avgCost * t.qty
        totalShares   = Math.max(0, totalShares - t.qty)
        return { ...t, avgCostAtTime: avgCost, pnlUSD, investedUSD: 0 }
      }
    })
}
