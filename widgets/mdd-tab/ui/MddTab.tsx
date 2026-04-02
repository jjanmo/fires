import type { MddResult } from '@/entities/sigma'
import DrawdownGauge from './DrawdownGauge'
import DrawdownChart from './DrawdownChart'

interface Props {
  mdd: MddResult
  symbol: string
}

export default function MddTab({ mdd, symbol }: Props) {
  return (
    <div className="space-y-5">
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
