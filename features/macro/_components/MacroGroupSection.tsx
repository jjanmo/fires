import { INDICATOR_CONFIGS } from '../lib/indicator-config'
import type { GroupConfig } from '../lib/group-config'
import type { MacroDashboardData } from '../types'
import MacroIndicatorCard from './MacroIndicatorCard'
import FearGreedCard from './FearGreedCard'
import MacroRateSuiteCard from './MacroRateSuiteCard'

type Props = {
  group: GroupConfig
  data: MacroDashboardData
}

const MacroGroupSection = ({ group, data }: Props) => {
  const suiteSet = new Set(group.suite ?? [])
  const regularIds = group.indicators.filter((id) => !suiteSet.has(id))

  return (
    <section id={group.id} className="scroll-mt-16">
      {/* 그룹 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: group.color }}
        />
        <h3 className="text-sm sm:text-lg font-semibold text-ink-1">{group.title}</h3>
        <p className="text-[10px] sm:text-sm text-ink-4">{group.subtitle}</p>
      </div>

      {/* 지표 목록 — full-width 세로 배치 */}
      <div className="flex flex-col gap-3">
        {/* 스위트 카드: liquidity 그룹 전용 */}
        {group.suite && (
          <MacroRateSuiteCard
            longRate={data.indicators['long-rate'] ?? null}
            shortRate={data.indicators['short-rate'] ?? null}
          />
        )}

        {/* 개별 지표 카드 */}
        {regularIds.map((id) => {
          if (id === 'fear-greed') {
            return <FearGreedCard key={id} data={data.fearGreed} />
          }

          const indicatorData = data.indicators[id] ?? null
          const config = INDICATOR_CONFIGS[id]
          const secondaryData = config.secondaryId ? data.indicators[config.secondaryId] ?? null : null

          return (
            <MacroIndicatorCard
              key={id}
              id={id}
              data={indicatorData}
              secondaryData={secondaryData}
            />
          )
        })}
      </div>
    </section>
  )
}

export default MacroGroupSection
