'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { INDICATOR_CONFIGS, getSignal } from '../lib/indicator-config'
import type { FearGreedData } from '../types'
import MacroLineChart from './MacroLineChart'
import { GaugeSvg, getRating } from './FearGreedGaugeSvg'

type Props = { data: FearGreedData }
type Tab = 'overview' | 'timeline'

const SCORE_ROWS = [
  { key: 'previousClose' as const, label: '직전 종가' },
  { key: 'oneWeekAgo' as const,    label: '1주일 전' },
  { key: 'oneMonthAgo' as const,   label: '1개월 전' },
  { key: 'oneYearAgo' as const,    label: '1년 전' },
]

const ScoreBadge = ({ score, label }: { score: number | null; label: string }) => {
  const { color } = getRating(score)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-edge last:border-0">
      <span className="text-xs text-ink-4">{label}</span>
      {score !== null ? (
        <span
          className="text-sm font-semibold tabular-nums w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + '33', color }}
        >
          {Math.round(score)}
        </span>
      ) : (
        <span className="text-sm text-ink-4">—</span>
      )}
    </div>
  )
}

const FearGreedCard = ({ data }: Props) => {
  const [tab, setTab] = useState<Tab>('overview')
  const { score } = data
  const { color } = getRating(score)
  const config = INDICATOR_CONFIGS['fear-greed']
  const signal = getSignal(score, config.signals)

  const isUp = data.previousClose !== null && score !== null && score > data.previousClose
  const isDown = data.previousClose !== null && score !== null && score < data.previousClose

  return (
    <div id="fear-greed" className="rounded-2xl border border-edge bg-card p-4 md:p-5 scroll-mt-16">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-semibold text-ink-1">공포탐욕지수</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-edge text-ink-4 leading-none">CNN</span>
          </div>
          {signal && (
            <p className="text-[10px] sm:text-xs font-medium mt-1 leading-none" style={{ color: signal.color }}>
              {signal.label}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl sm:text-2xl font-bold tabular-nums leading-none" style={{ color }}>
            {score !== null ? Math.round(score) : '—'}
          </p>
        </div>
      </div>

      {/* 탭 버튼 */}
      <div className="flex bg-inset rounded-lg p-0.5 self-start mb-3 w-fit">
        {(['overview', 'timeline'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer',
              tab === t ? 'bg-card text-ink-1 shadow-sm' : 'text-ink-4 hover:text-ink-2'
            )}
          >
            {t === 'overview' ? '오버뷰' : '타임라인'}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {tab === 'overview' ? (
        <div className="grid grid-cols-5 gap-4 py-1">
          <div className="col-span-3">
            <GaugeSvg score={score} />
          </div>
          <div className="col-span-2 flex flex-col justify-center">
            <p className="text-[10px] font-semibold text-ink-4 uppercase tracking-wide mb-1">역사적 비교</p>
            {SCORE_ROWS.map(({ key, label }) => (
              <ScoreBadge key={key} score={data[key]} label={label} />
            ))}
          </div>
        </div>
      ) : (
        <MacroLineChart
          points={data.points}
          color="#f97316"
          fill="rgba(249,115,22,0.08)"
          label="공포탐욕지수"
          formatValue={(v) => Math.round(v).toString()}
          refLines={[25, 75]}
          refLineLabels={{
            75: { text: 'Extreme Greed', color: '#22c55e', position: 'above' },
            25: { text: 'Extreme Fear',  color: '#ef4444', position: 'below' },
          }}
          height={180}
          yMin={0}
          yMax={100}
        />
      )}

      {/* 하단: 해석 */}
      <div className="mt-4 pt-4 border-t border-edge space-y-3">
        {signal && (
          <p className="text-[10px] sm:text-xs text-ink-3 leading-relaxed">
            <span className="font-semibold" style={{ color: signal.color }}>
              {signal.label}:
            </span>{' '}
            {signal.desc}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div
            className={cn(
              'rounded-lg p-2.5 border transition-colors',
              isUp ? 'border-buy-edge bg-buy-bg' : 'border-edge bg-inset'
            )}
          >
            <p className={cn('text-[10px] font-semibold mb-1', isUp ? 'text-buy-text' : 'text-ink-4')}>
              ▲ {config.upLabel}
            </p>
            <p className="text-[10px] sm:text-[11px] text-ink-3 leading-relaxed">{config.upEffect}</p>
          </div>
          <div
            className={cn(
              'rounded-lg p-2.5 border transition-colors',
              isDown ? 'border-sell-edge bg-sell-bg' : 'border-edge bg-inset'
            )}
          >
            <p className={cn('text-[10px] font-semibold mb-1', isDown ? 'text-sell-text' : 'text-ink-4')}>
              ▼ {config.downLabel}
            </p>
            <p className="text-[10px] sm:text-[11px] text-ink-3 leading-relaxed">{config.downEffect}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-ink-4 uppercase tracking-wide mb-1.5">지표 의미</p>
          <p className="text-[10px] sm:text-xs text-ink-3 leading-relaxed">{config.meaning}</p>
        </div>
      </div>
    </div>
  )
}

export default FearGreedCard
