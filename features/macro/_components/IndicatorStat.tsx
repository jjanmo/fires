'use client'

import { cn } from '@/shared/lib/cn'
import type { IndicatorConfig } from '../lib/indicator-config'

type Props = {
  current: number | null
  prevDay: number | null
  config: Pick<IndicatorConfig, 'formatValue' | 'changeType' | 'color'>
  valueSize?: 'sm' | '2xl'
}

const calcChange = (cur: number | null, prev: number | null, type: 'pct' | 'pp') => {
  if (cur === null || prev === null) return null
  if (type === 'pp') return +(cur - prev).toFixed(3)
  if (prev === 0) return null
  return +(((cur - prev) / prev) * 100).toFixed(2)
}

const IndicatorStat = ({ current, prevDay, config, valueSize = 'sm' }: Props) => {
  const change = calcChange(current, prevDay, config.changeType)
  // 소수점 2자리 반올림 후 방향 결정 — 부동소수점 오차(-0.0005 등)로 인한 잘못된 ▼ 표시 방지
  const displayChange = change !== null ? +(change.toFixed(2)) : null
  const isUp = displayChange !== null && displayChange > 0
  const isDown = displayChange !== null && displayChange < 0
  // 절댓값만 사용 — 방향은 ▲/▼ 아이콘으로 표시
  const changeStr =
    displayChange !== null
      ? config.changeType === 'pp'
        ? `${Math.abs(displayChange).toFixed(2)}%p`
        : `${Math.abs(displayChange).toFixed(2)}%`
      : null

  return (
    <div className="text-right">
      <p
        className={cn('font-bold tabular-nums leading-none', valueSize === '2xl' ? 'text-xl sm:text-2xl' : 'text-sm')}
        style={{ color: config.color }}
      >
        {current !== null ? config.formatValue(current) : '—'}
      </p>
      {changeStr !== null && (
        <p
          className={cn(
            'text-[10px] sm:text-xs font-medium tabular-nums mt-1 leading-none',
            isUp ? 'text-buy-text' : isDown ? 'text-sell-text' : 'text-ink-4',
          )}
        >
          {isUp ? '▲ ' : isDown ? '▼ ' : ''}{changeStr}
        </p>
      )}
    </div>
  )
}

export default IndicatorStat
