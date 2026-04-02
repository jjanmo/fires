import { formatPrice } from '@/shared/lib/ticker'

interface Props {
  mdd:          number
  currentDD:    number
  mddRatio:     number   // 게이지 바 위치 계산용
  athPrice:     number
  athHighPrice: number
  symbol:       string
}

export default function DrawdownGauge({ mdd, currentDD, mddRatio, athPrice, athHighPrice, symbol }: Props) {
  const fillPct = Math.min(Math.max(mddRatio, 0), 100)

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">현재 낙폭 위치</p>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[11px] text-ink-4 mb-0.5">현재 낙폭</p>
          <p className="text-2xl font-bold tabular-nums font-mono text-amber-400">
            {currentDD.toFixed(2)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-ink-4 mb-0.5">역대 MDD</p>
          <p className="text-2xl font-bold tabular-nums font-mono text-rose-500">
            {mdd.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* 게이지 바 */}
      <div className="relative h-2 bg-edge rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-ink-4 mt-1.5">
        <span>0% (고점)</span>
        <span>MDD ({mdd.toFixed(1)}%)</span>
      </div>

      {/* ATH 정보 */}
      <div className="mt-3 border-t border-edge pt-3 text-[11px] text-ink-4">
        <span>
          고점 가격 <span className="text-ink-2 font-mono">{formatPrice(athPrice, symbol)}</span>
          {athHighPrice > athPrice && (
            <span className="ml-1">(장중 최고 <span className="font-mono">{formatPrice(athHighPrice, symbol)}</span>)</span>
          )}
        </span>
      </div>
    </div>
  )
}
