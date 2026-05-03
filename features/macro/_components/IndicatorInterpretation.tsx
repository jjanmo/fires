import { cn } from '@/shared/lib/cn'
import type { IndicatorConfig, SignalThreshold } from '../lib/indicator-config'

type Props = {
  config: Pick<IndicatorConfig, 'changeType' | 'upLabel' | 'upEffect' | 'downLabel' | 'downEffect' | 'meaning'>
  signal: SignalThreshold | null
  isUp: boolean
  isDown: boolean
  prev3MChange: number | null
}

const fmtChange = (change: number | null, type: 'pct' | 'pp') => {
  if (change === null) return null
  const sign = change > 0 ? '+' : ''
  return type === 'pp' ? `${sign}${change.toFixed(2)}%p` : `${sign}${change.toFixed(2)}%`
}

const IndicatorInterpretation = ({ config, signal, isUp, isDown, prev3MChange }: Props) => {
  const prev3MIsUp = prev3MChange !== null && prev3MChange > 0
  const prev3MIsDown = prev3MChange !== null && prev3MChange < 0
  const prev3MChangeStr = fmtChange(prev3MChange, config.changeType)

  return (
    <div className="mt-4 pt-4 border-t border-edge space-y-3">
      {/* 자연어 요약 + 역사 비교 */}
      {signal && (
        <div>
          <p className="text-[10px] sm:text-xs text-ink-3 leading-relaxed">
            <span className="font-semibold" style={{ color: signal.color }}>
              {signal.label}:
            </span>{' '}
            {signal.desc}
          </p>
          {prev3MChangeStr !== null && (
            <p className="text-[10px] sm:text-[11px] text-ink-4 mt-1.5">
              3개월 전 대비{' '}
              <span
                className={cn(
                  'font-medium',
                  prev3MIsUp ? 'text-buy-text' : prev3MIsDown ? 'text-sell-text' : 'text-ink-3'
                )}
              >
                {prev3MIsUp ? '▲' : prev3MIsDown ? '▼' : '–'} {prev3MChangeStr.replace(/^[+-]/, '')}
              </span>
            </p>
          )}
        </div>
      )}

      {/* 방향 영향 카드 */}
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

      {/* 지표 의미 */}
      <div>
        <p className="text-[10px] font-semibold text-ink-4 uppercase tracking-wide mb-1.5">지표 의미</p>
        <p className="text-[10px] sm:text-xs text-ink-3 leading-relaxed">{config.meaning}</p>
      </div>
    </div>
  )
}

export default IndicatorInterpretation
