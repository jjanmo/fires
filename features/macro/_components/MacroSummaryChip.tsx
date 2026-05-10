import { cn } from '@/shared/lib/cn'
import { INDICATOR_CONFIGS, getSignal } from '../lib/indicator-config'
import { calcChange } from '../lib/calc-change'
import type { IndicatorId, MacroDashboardData } from '../types'

type Props = {
  id: IndicatorId
  data: MacroDashboardData
}

const MacroSummaryChip = ({ id, data }: Props) => {
  const config = INDICATOR_CONFIGS[id]

  if (id === 'fear-greed') {
    const { score, previousClose } = data.fearGreed
    const signal = getSignal(score, config.signals)
    const rawChange = score !== null && previousClose !== null ? score - previousClose : null
    const displayChange = rawChange !== null ? +(rawChange.toFixed(2)) : null
    const isUp = displayChange !== null && displayChange > 0
    const isDown = displayChange !== null && displayChange < 0
    // fear-greed는 0~100 정수 지수 — 절댓값 포인트 차이로 표시
    const changeStr = displayChange !== null ? Math.abs(displayChange).toFixed(0) : null

    return (
      <a
        href={`#${id}`}
        className="rounded-lg border border-edge bg-inset p-2 min-w-0 block hover:border-edge-hi transition-colors"
      >
        <p className="text-[10px] sm:text-xs text-ink-4 truncate mb-1.5">{config.title}</p>
        {/* 모바일: 지표+변화율 위, 상태 아래 / 데스크탑: 지표+변화율 좌, 상태 우 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-1.5">
          <div className="flex items-start gap-1.5 sm:flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <p
                className="text-xs sm:text-sm font-bold tabular-nums leading-none"
                style={{ color: signal?.color ?? config.color }}
              >
                {score !== null ? Math.round(score) : '—'}
              </p>
              <p
                className={cn(
                  'text-[9px] sm:text-[10px] tabular-nums mt-1.5 leading-none',
                  isUp ? 'text-buy-text' : isDown ? 'text-sell-text' : 'text-ink-4',
                )}
              >
                {changeStr !== null ? `${isUp ? '▲ ' : isDown ? '▼ ' : ''}${changeStr}` : '—'}
              </p>
            </div>
            {/* 데스크탑: 상태 우측 */}
            <p
              className="hidden sm:block text-xs sm:text-sm font-semibold leading-tight text-right shrink-0 max-w-[50%] truncate"
              style={{ color: signal?.color ?? '#94a3b8' }}
            >
              {signal?.label ?? '—'}
            </p>
          </div>
          {/* 모바일: 상태 하단 */}
          <p
            className="sm:hidden text-[10px] font-semibold leading-none mt-1.5 truncate"
            style={{ color: signal?.color ?? '#94a3b8' }}
          >
            {signal?.label ?? '—'}
          </p>
        </div>
      </a>
    )
  }

  const indicatorData = data.indicators[id] ?? null
  const current = indicatorData?.current ?? null
  const prevDay = indicatorData?.prevDay ?? null
  const signal = getSignal(current, config.signals)

  const rawChange = calcChange(current, prevDay, config.changeType)
  const displayChange = rawChange !== null ? +(rawChange.toFixed(2)) : null
  const isUp = displayChange !== null && displayChange > 0
  const isDown = displayChange !== null && displayChange < 0
  const changeStr =
    displayChange !== null
      ? config.changeType === 'pp'
        ? `${Math.abs(displayChange).toFixed(2)}%p`
        : `${Math.abs(displayChange).toFixed(2)}%`
      : null

  return (
    <a
      href={`#${id}`}
      className="rounded-lg border border-edge bg-inset p-2 min-w-0 block hover:border-edge-hi transition-colors"
    >
      <p className="text-[10px] sm:text-xs text-ink-4 truncate mb-1.5">{config.title}</p>
      {/* 모바일: 지표+변화율 위, 상태 아래 / 데스크탑: 지표+변화율 좌, 상태 우 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-1.5">
        <div className="flex items-start gap-1.5 sm:flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <p
              className="text-xs sm:text-sm font-bold tabular-nums leading-none"
              style={{ color: signal?.color ?? config.color }}
            >
              {current !== null ? config.formatValue(current) : '—'}
            </p>
            <p
              className={cn(
                'text-[9px] sm:text-[10px] tabular-nums mt-1.5 leading-none',
                isUp ? 'text-buy-text' : isDown ? 'text-sell-text' : 'text-ink-4',
              )}
            >
              {changeStr !== null ? `${isUp ? '▲ ' : isDown ? '▼ ' : ''}${changeStr}` : '—'}
            </p>
          </div>
          {/* 데스크탑: 상태 우측 */}
          <p
            className="hidden sm:block text-xs sm:text-sm font-semibold leading-tight text-right shrink-0 max-w-[50%] truncate"
            style={{ color: signal?.color ?? '#94a3b8' }}
          >
            {signal?.label ?? '—'}
          </p>
        </div>
        {/* 모바일: 상태 하단 */}
        <p
          className="sm:hidden text-[10px] font-semibold leading-none mt-1.5 truncate"
          style={{ color: signal?.color ?? '#94a3b8' }}
        >
          {signal?.label ?? '—'}
        </p>
      </div>
    </a>
  )
}

export default MacroSummaryChip
