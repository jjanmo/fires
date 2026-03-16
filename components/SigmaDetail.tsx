import type { HistoryRow } from '@/lib/types'

interface Props { latest: HistoryRow }

const items = [
  { key: 'mu' as const,    label: 'μ (평균)', suffix: '%', color: 'text-ink-2' },
  { key: 'sigma' as const, label: '1σ',       suffix: '%', color: 'text-amber-600 dark:text-amber-400' },
  { key: 's2d' as const,   label: '2σ↓',      suffix: '%', color: 'text-buy-val' },
  { key: 's2u' as const,   label: '2σ↑',      suffix: '%', color: 'text-sell-val' },
]

export default function SigmaDetail({ latest }: Props) {
  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">σ 통계 (Rolling 252일)</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map(({ key, label, suffix, color }) => (
          <div key={key}>
            <p className="text-[11px] text-ink-4 mb-1">{label}</p>
            <p className={`text-lg font-semibold tabular-nums font-mono ${color}`}>
              {latest[key] > 0 && key !== 'mu' && key !== 's2d' ? '+' : ''}
              {latest[key].toFixed(2)}{suffix}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
