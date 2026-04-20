export type { ClosePrice, SigmaResult, HistoryRow, SignalRow, MddResult, MddPoint, RollingWindow } from './model/types'
export { ROLLING_WINDOWS } from './model/types'
export { calcDailyReturns, calcRolling252, calcOrderPrices, buildHistory, buildLatestSignal, buildSignalHistory, calcMdd } from './model/calc'
export { fetchCloses } from './api/fetchCloses'
