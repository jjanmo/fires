export interface ClosePrice {
  date:  string  // "2024-08-05"
  open:  number  // 시가
  high:  number  // 고가
  low:   number  // 저가
  price: number  // 종가
}

export interface SigmaResult {
  mu: number    // 평균 등락률 (%)
  sigma: number // 1σ (%)
  s2d: number   // 2σ 하락 기준 (%) — μ - 2σ
  s2u: number   // 2σ 상승 기준 (%) — μ + 2σ
}

export interface HistoryRow extends SigmaResult {
  date:         string
  open:         number          // 당일 시가
  high:         number          // 당일 고가
  low:          number          // 당일 저가
  close:        number          // 당일 종가
  buyPrice:     number          // 이날 활성화된 2σ 매수 지정가 (전날 종가 기준)
  sellPrice:    number          // 이날 활성화된 2σ 매도 지정가 (전날 종가 기준)
  s1BuyPrice:   number          // 이날 활성화된 1σ 참고 매수가
  actualReturn: number | null   // 전날 종가 대비 당일 종가 등락률
  triggered:    'buy' | 'sell' | null  // low ≤ buyPrice → buy, high ≥ sellPrice → sell
}
