import type { MddResult } from '@/entities/sigma'
import DrawdownGauge from './DrawdownGauge'
import DrawdownChart from './DrawdownChart'

interface Props {
  mdd: MddResult | null
  symbol: string
  dataCount: number
}

export default function MddTab({ mdd, symbol, dataCount }: Props) {
  if (!mdd) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-[12px] text-amber-500 leading-relaxed">
          MDD 계산에 필요한 데이터가 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {dataCount < 20 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-[12px] text-amber-500 leading-relaxed">
            거래 데이터가 {dataCount}일로 충분하지 않아 MDD 통계가 불안정할 수 있습니다.
            권장 기준(20거래일)에 도달하면 이 메시지는 사라집니다.
          </p>
        </div>
      )}
      <DrawdownGauge
        mdd={mdd.mdd}
        currentDD={mdd.currentDD}
        mddRatio={mdd.mddRatio}
        athPrice={mdd.athPrice}
        athHighPrice={mdd.athHighPrice}
        symbol={symbol}
      />
      <DrawdownChart
        series={mdd.series}
        mdd={mdd.mdd}
        currentDD={mdd.currentDD}
      />
    </div>
  )
}
