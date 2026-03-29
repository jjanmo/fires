import type { HistoryRow } from '@/entities/sigma'

interface Props { latest: HistoryRow }

export default function SigmaDetail({ latest }: Props) {
  const s1d = latest.mu - latest.sigma
  const s1u = latest.mu + latest.sigma

  const items = [
    { key: 'mu',    label: 'μ (평균)', val: latest.mu,    color: 'text-ink-2' },
    { key: 'sigma', label: '1σ',       val: latest.sigma, color: 'text-amber-600 dark:text-amber-400' },
    { key: 's1d',   label: '1σ↓',      val: s1d,          color: 'text-buy-val' },
    { key: 's1u',   label: '1σ↑',      val: s1u,          color: 'text-sell-val' },
    { key: 's2d',   label: '2σ↓',      val: latest.s2d,   color: 'text-buy-val' },
    { key: 's2u',   label: '2σ↑',      val: latest.s2u,   color: 'text-sell-val' },
  ]

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">σ 통계 (Rolling 252일)</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {items.map(({ key, label, val, color }) => (
          <div key={key}>
            <p className="text-[11px] text-ink-4 mb-1">{label}</p>
            <p className={`text-lg font-semibold tabular-nums font-mono ${color}`}>
              {val > 0 && key !== 'mu' && key !== 's1d' && key !== 's2d' ? '+' : ''}
              {val.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
