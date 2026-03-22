import type { MddResult } from '@/entities/sigma'

interface Props { mdd: MddResult }

export default function DrawdownCard({ mdd }: Props) {
  const { currentDD, mddRatio, mdd: maxDD, currentPeak } = mdd

  // MDD 달성도에 따라 색상 결정
  const ratioColor =
    mddRatio >= 80 ? 'text-red-500 dark:text-red-400' :
    mddRatio >= 50 ? 'text-orange-500 dark:text-orange-400' :
    mddRatio >= 20 ? 'text-amber-500 dark:text-amber-400' :
    'text-ink-2'

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">
        고점 대비 낙폭
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        {/* 현재 하락률 */}
        <div>
          <p className="text-[11px] text-ink-4 mb-1">현재 낙폭</p>
          <p className="text-lg font-semibold tabular-nums font-mono text-buy-val">
            {currentDD.toFixed(2)}%
          </p>
        </div>

        {/* 현재 고점 */}
        <div>
          <p className="text-[11px] text-ink-4 mb-1">현재 고점</p>
          <p className="text-lg font-semibold tabular-nums font-mono text-ink-1">
            ${currentPeak.toLocaleString()}
          </p>
        </div>

        {/* MDD */}
        <div>
          <p className="text-[11px] text-ink-4 mb-1">MDD (2년)</p>
          <p className="text-lg font-semibold tabular-nums font-mono text-red-500 dark:text-red-400">
            {maxDD.toFixed(2)}%
          </p>
        </div>

        {/* MDD 달성도 */}
        <div>
          <p className="text-[11px] text-ink-4 mb-1">MDD 진행도</p>
          <p className={`text-lg font-semibold tabular-nums font-mono ${ratioColor}`}>
            {mddRatio.toFixed(1)}%
          </p>
          <p className="text-[10px] text-ink-4 mt-0.5">MDD의 {mddRatio.toFixed(0)}%</p>
        </div>

      </div>

      {/* 진행 바 */}
      <div className="mt-4">
        <div className="h-1.5 bg-edge rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              mddRatio >= 80 ? 'bg-red-500' :
              mddRatio >= 50 ? 'bg-orange-500' :
              mddRatio >= 20 ? 'bg-amber-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(mddRatio, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-ink-4 mt-1">
          <span>0%</span>
          <span>MDD ({maxDD.toFixed(1)}%)</span>
        </div>
      </div>
    </div>
  )
}
