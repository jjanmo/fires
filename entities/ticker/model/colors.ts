export const TICKER_PALETTE = [
  { accentColor: 'text-violet-600 dark:text-violet-400', borderColor: 'border-violet-400 dark:border-violet-500/30' },
  { accentColor: 'text-blue-600 dark:text-blue-400',     borderColor: 'border-blue-400 dark:border-blue-500/30'   },
  { accentColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-400 dark:border-emerald-500/30' },
  { accentColor: 'text-amber-600 dark:text-amber-400',   borderColor: 'border-amber-400 dark:border-amber-500/30' },
  { accentColor: 'text-rose-600 dark:text-rose-400',     borderColor: 'border-rose-400 dark:border-rose-500/30'   },
  { accentColor: 'text-cyan-600 dark:text-cyan-400',     borderColor: 'border-cyan-400 dark:border-cyan-500/30'   },
  { accentColor: 'text-orange-600 dark:text-orange-400', borderColor: 'border-orange-400 dark:border-orange-500/30' },
  { accentColor: 'text-pink-600 dark:text-pink-400',     borderColor: 'border-pink-400 dark:border-pink-500/30'   },
  { accentColor: 'text-teal-600 dark:text-teal-400',     borderColor: 'border-teal-400 dark:border-teal-500/30'   },
  { accentColor: 'text-indigo-600 dark:text-indigo-400', borderColor: 'border-indigo-400 dark:border-indigo-500/30' },
] as const

export function getTickerColor(index: number) {
  return TICKER_PALETTE[index % TICKER_PALETTE.length]
}
