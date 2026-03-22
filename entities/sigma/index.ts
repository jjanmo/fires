export type { ClosePrice, SigmaResult, HistoryRow, MddResult, MddPoint } from './model/types'
export { calcDailyReturns, calcRolling252, calcOrderPrices, buildHistory, buildLatestSignal, calcMdd } from './model/calc'
export { fetchCloses } from './api/fetchCloses'
