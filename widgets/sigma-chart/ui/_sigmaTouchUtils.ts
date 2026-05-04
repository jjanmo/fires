import type { HistoryRow } from '@/entities/sigma';

// ── 팔레트 ────────────────────────────────────────────────────
export const SIGMA_TOUCH_DARK = {
  close:         '#22d3ee',
  buy2s:         '#c084fc',
  buy1s:         '#38bdf8',
  grid:          '#1e293b',
  ticks:         '#94a3b8',
  tooltipBg:     '#1e293b',
  tooltipBorder: '#475569',
  tooltipTitle:  '#94a3b8',
  tooltipBody:   '#e2e8f0',
};

export const SIGMA_TOUCH_LIGHT = {
  close:         '#0891b2',
  buy2s:         '#7c3aed',
  buy1s:         '#0284c7',
  grid:          '#f1f5f9',
  ticks:         '#64748b',
  tooltipBg:     '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipTitle:  '#64748b',
  tooltipBody:   '#0f172a',
};

export type SigmaTouchPalette = typeof SIGMA_TOUCH_DARK;

// ── 타입 ──────────────────────────────────────────────────────
export type BuySignal = 'buy-2s' | 'buy-1s';

export interface YearSignalRow {
  year: string;
  'buy-2s': number;
  'buy-1s': number;
  total: number;
}

// ── 유틸 ──────────────────────────────────────────────────────
export const getYearFromDate = (date: string) => date.slice(0, 4);

/**
 * 해당 연도의 평일(월~금) 날짜 배열 생성
 * x축을 항상 1월~12월로 균등 분포시키기 위해 사용
 */
export const generateFullYearDates = (year: string): string[] => {
  const dates: string[] = [];
  const end = new Date(`${year}-12-31`);
  for (let d = new Date(`${year}-01-01`); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
};

export const buildYearSignalRows = (rows: HistoryRow[]): YearSignalRow[] => {
  const map = new Map<string, YearSignalRow>();
  for (const r of rows) {
    if (r.triggered !== 'buy-2s' && r.triggered !== 'buy-1s') continue;
    const year = getYearFromDate(r.date);
    if (!map.has(year)) map.set(year, { year, 'buy-2s': 0, 'buy-1s': 0, total: 0 });
    const entry = map.get(year)!;
    entry[r.triggered as BuySignal]++;
    entry.total++;
  }
  return Array.from(map.values()).sort((a, b) => b.year.localeCompare(a.year));
};
