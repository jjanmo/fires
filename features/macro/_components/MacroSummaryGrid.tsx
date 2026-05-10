import { GROUPS } from '../lib/group-config'
import type { MacroDashboardData } from '../types'
import MacroSummaryChip from './MacroSummaryChip'

type Props = {
  data: MacroDashboardData
}

const MacroSummaryGrid = ({ data }: Props) => {
  return (
    <div className="rounded-2xl border border-edge bg-card p-4 md:p-5">
      <p className="text-[11px] sm:text-sm font-semibold text-ink-4 uppercase tracking-wide mb-3">매크로 한눈에 보기</p>
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
              <span className="text-[11px] sm:text-sm text-ink-3 group-hover:text-ink-1 transition-colors leading-tight">
                {group.title}
              </span>
            </a>
            <div className="grid grid-cols-4 gap-1.5 sm:flex-1">
              {Array.from({ length: 4 }).map((_, i) => {
                const id = group.indicators[i]
                return id
                  ? <MacroSummaryChip key={id} id={id} data={data} />
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
