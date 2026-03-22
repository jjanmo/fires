export type { ClosePrice, SigmaResult, HistoryRow } from './model/types'
export { calcDailyReturns, calcRolling252, calcOrderPrices, buildHistory, buildLatestSignal } from './model/calc'
export { fetchCloses } from './api/fetchCloses'
