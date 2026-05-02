import { cn } from '@/shared/lib/cn'
import { INDICATOR_CONFIGS, getSignal } from '../lib/indicator-config'
import { GROUPS } from '../lib/group-config'
import type { IndicatorId, MacroDashboardData } from '../types'

type Props = {
  data: MacroDashboardData
}

type ChipProps = {
  id: IndicatorId
  data: MacroDashboardData
}

const calcChange = (cur: number | null, prev: number | null, type: 'pct' | 'pp') => {
  if (cur === null || prev === null) return null
  if (type === 'pp') return +(cur - prev).toFixed(3)
  if (prev === 0) return null
  return +(((cur - prev) / prev) * 100).toFixed(2)
}

const SummaryChip = ({ id, data }: ChipProps) => {
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
        <p className="text-[10px] text-ink-4 truncate mb-1.5">{config.title}</p>
        {/* 모바일: 지표+변화율 위, 상태 아래 / 데스크탑: 지표+변화율 좌, 상태 우 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-1.5">
          <div className="flex items-start gap-1.5 sm:flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] sm:text-xs font-bold tabular-nums leading-none"
                style={{ color: signal?.color ?? config.color }}
              >
                {score !== null ? Math.round(score) : '—'}
              </p>
              <p
                className={cn(
                  'text-[9px] tabular-nums mt-1.5 leading-none',
                  isUp ? 'text-buy-text' : isDown ? 'text-sell-text' : 'text-ink-4',
                )}
              >
                {changeStr !== null ? `${isUp ? '▲ ' : isDown ? '▼ ' : ''}${changeStr}` : '—'}
              </p>
            </div>
            {/* 데스크탑: 상태 우측 */}
            <p
              className="hidden sm:block text-[10px] sm:text-xs font-semibold leading-tight text-right shrink-0 max-w-[50%] truncate"
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
      <p className="text-[10px] text-ink-4 truncate mb-1.5">{config.title}</p>
        {/* 모바일: 지표+변화율 위, 상태 아래 / 데스크탑: 지표+변화율 좌, 상태 우 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-1.5">
          <div className="flex items-start gap-1.5 sm:flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] sm:text-xs font-bold tabular-nums leading-none"
                style={{ color: signal?.color ?? config.color }}
              >
                {current !== null ? config.formatValue(current) : '—'}
              </p>
              <p
                className={cn(
                  'text-[9px] tabular-nums mt-1.5 leading-none',
                  isUp ? 'text-buy-text' : isDown ? 'text-sell-text' : 'text-ink-4',
                )}
              >
                {changeStr !== null ? `${isUp ? '▲ ' : isDown ? '▼ ' : ''}${changeStr}` : '—'}
              </p>
            </div>
            {/* 데스크탑: 상태 우측 */}
            <p
              className="hidden sm:block text-[10px] sm:text-xs font-semibold leading-tight text-right shrink-0 max-w-[50%] truncate"
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

const MacroSummaryGrid = ({ data }: Props) => {
  return (
    <div className="rounded-2xl border border-edge bg-card p-4 md:p-5">
      <p className="text-[11px] font-semibold text-ink-4 uppercase tracking-wide mb-3">매크로 한눈에 보기</p>
      <div className="space-y-3">
        {GROUPS.map((group) => (
          <div key={group.id} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
            <a
              href={`#${group.id}`}
              className="flex items-center gap-1.5 sm:w-24 sm:shrink-0 sm:pt-2 group"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <span className="text-[11px] text-ink-3 group-hover:text-ink-1 transition-colors leading-tight">
                {group.title}
              </span>
            </a>
            <div className="grid grid-cols-4 gap-1.5 sm:flex-1">
              {Array.from({ length: 4 }).map((_, i) => {
                const id = group.indicators[i]
                return id
                  ? <SummaryChip key={id} id={id} data={data} />
                  : <div key={i} />
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MacroSummaryGrid
