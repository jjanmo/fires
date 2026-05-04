import type { HistoryRow, HistoryRowLite } from '../model/types'

export const stripHistoryWindow = (row: HistoryRow): HistoryRowLite => {
  const lite = { ...row }
  delete (lite as { window?: number[] }).window
  return lite as HistoryRowLite
}

export const stripHistoryRows = (rows: HistoryRow[]): HistoryRowLite[] => rows.map(stripHistoryWindow)
