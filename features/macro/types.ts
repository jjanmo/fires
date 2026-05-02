export type SignalLevel = 'strong-positive' | 'positive' | 'neutral' | 'caution' | 'warning' | 'crisis'

export type IndicatorSignal = {
  level: SignalLevel
  label: string
  text: string
  action?: string
}

export type ChartPoint = { date: string; value: number }

export type IndicatorId =
  | 'long-rate'
  | 'short-rate'
  | 'yield-spread'
  | 'hy-spread'
  | 'dxy'
  | 'krw'
  | 'kr-us-spread'
  | 'jpy'
  | 'sp500'
  | 'nasdaq'
  | 'kospi'
  | 'kosdaq'
  | 'vix'
  | 'fear-greed'
  | 'oil'
  | 'gold'
  | 'copper'
  | 'kr-cpi'
  | 'kr-rate'
  | 'kr-bond'

export type IndicatorData = {
  points: ChartPoint[]
  current: number | null
  prevDay: number | null
  prev3M: number | null
}

export type FearGreedData = {
  score: number | null
  rating: string | null
  previousClose: number | null
  oneWeekAgo: number | null
  oneMonthAgo: number | null
  oneYearAgo: number | null
  points: ChartPoint[]
}

export type DataSourceId = 'yahoo' | 'fred' | 'ecos' | 'cnn'

export type MacroDashboardData = {
  indicators: Partial<Record<IndicatorId, IndicatorData>>
  fearGreed: FearGreedData
  sourceErrors: Partial<Record<DataSourceId, string>>
}
