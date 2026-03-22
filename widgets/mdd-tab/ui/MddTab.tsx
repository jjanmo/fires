import type { MddResult } from '@/entities/sigma'
import DrawdownGauge from './DrawdownGauge'
import DrawdownChart from './DrawdownChart'

interface Props {
  mdd: MddResult
}

export default function MddTab({ mdd }: Props) {
  return (
    <div className="space-y-5">
      <DrawdownGauge
        mdd={mdd.mdd}
        currentDD={mdd.currentDD}
        mddRatio={mdd.mddRatio}
        athPrice={mdd.athPrice}
        athHighPrice={mdd.athHighPrice}
      />
      <DrawdownChart
        series={mdd.series}
        mdd={mdd.mdd}
        currentDD={mdd.currentDD}
      />
    </div>
  )
}
