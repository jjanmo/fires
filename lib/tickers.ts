import type { TickerInfo } from './types'

export const TICKERS: TickerInfo[] = [
  {
    symbol: 'SOXL',
    name: 'Direxion Daily Semiconductor Bull 3X ETF',
    slug: 'soxl',
    description: '반도체 3배 레버리지 ETF',
    accentColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-400 dark:border-violet-500/30',
  },
  // {
  //   symbol: 'TQQQ',
  //   name: 'ProShares UltraPro QQQ',
  //   slug: 'tqqq',
  //   description: '나스닥100 3배 레버리지 ETF',
  //   accentColor: 'text-blue-600 dark:text-blue-400',
  //   borderColor: 'border-blue-400 dark:border-blue-500/30',
  // },
  // {
  //   symbol: 'UPRO',
  //   name: 'ProShares UltraPro S&P 500',
  //   slug: 'upro',
  //   description: 'S&P500 3배 레버리지 ETF',
  //   accentColor: 'text-emerald-600 dark:text-emerald-400',
  //   borderColor: 'border-emerald-400 dark:border-emerald-500/30',
  // },
]

export function getTicker(slug: string): TickerInfo | undefined {
  return TICKERS.find(t => t.slug === slug.toLowerCase())
}
