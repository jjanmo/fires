// ── 소형 공통 뼈대 ────────────────────────────────────────────────────────────
const Sk = ({ h, w, className = '' }: { h: string; w: string; className?: string }) => (
  <div className={`skeleton rounded ${h} ${w} ${className}`} />
)

// ── 지표 카드 뼈대 (full-width) ──────────────────────────────────────────────
const IndicatorCardSk = () => (
  <div className="animate-pulse rounded-2xl border border-edge bg-card p-4 space-y-3">
    {/* 헤더: 지표명 + 현재값 */}
    <div className="flex items-start justify-between">
      <div className="space-y-1.5">
        <Sk h="h-4" w="w-32" />
        <Sk h="h-3" w="w-16" />
      </div>
      <div className="space-y-1.5 items-end flex flex-col">
        <Sk h="h-7" w="w-28" />
        <Sk h="h-3" w="w-16" />
      </div>
    </div>
    {/* 범위 탭 */}
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <Sk key={i} h="h-4" w="w-8" className="rounded" />
      ))}
    </div>
    {/* 차트 */}
    <Sk h="h-[180px]" w="w-full" className="rounded-xl" />
    {/* 하단 2열 */}
    <div className="grid grid-cols-2 gap-6 pt-3 border-t border-edge">
      <div className="space-y-2">
        <Sk h="h-2.5" w="w-16" />
        <Sk h="h-3" w="w-full" />
        <Sk h="h-3" w="w-4/5" />
        <Sk h="h-3" w="w-3/4" />
      </div>
      <div className="space-y-2">
        <Sk h="h-2.5" w="w-16" />
        <Sk h="h-3" w="w-24" />
        <Sk h="h-3" w="w-full" />
        <Sk h="h-3" w="w-3/4" />
      </div>
    </div>
  </div>
)

// ── 그룹 섹션 뼈대 (헤더 + 카드 4개 세로) ───────────────────────────────────
const GroupSectionSk = () => (
  <div className="space-y-3">
    {/* 그룹 헤더 */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="skeleton w-2 h-2 rounded-full" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="skeleton h-3 w-48 rounded hidden sm:block" />
    </div>
    {/* 카드 4개 세로 */}
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <IndicatorCardSk key={i} />
      ))}
    </div>
  </div>
)

// ── 매크로 한눈에 보기 뼈대 ──────────────────────────────────────────────────
const SummaryGridSk = () => (
  <div className="animate-pulse rounded-2xl border border-edge bg-card p-4 md:p-5">
    <Sk h="h-3" w="w-24" className="mb-3" />
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
          {/* 그룹 타이틀 */}
          <div className="flex items-center gap-1.5 sm:w-24 sm:shrink-0 sm:pt-2">
            <div className="skeleton w-1.5 h-1.5 rounded-full" />
            <Sk h="h-3" w="w-16" />
          </div>
          {/* 칩 4개 */}
          <div className="grid grid-cols-4 gap-1.5 sm:flex-1">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="skeleton rounded-lg h-[62px]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// ── Suspense 폴백: 매크로 섹션 전체 ─────────────────────────────────────────
export const MacroSectionSkeleton = () => (
  <section className="space-y-8">
    {/* 섹션 헤더 */}
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-4">
      <div className="skeleton h-5 w-28 rounded" />
      {/* 소스 (갱신주기) 뱃지 */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Sk key={i} h="h-3" w="w-14" />
        ))}
      </div>
    </div>

    {/* 매크로 한눈에 보기 */}
    <SummaryGridSk />

    {/* 6개 그룹 스켈레톤 */}
    {Array.from({ length: 6 }).map((_, i) => (
      <GroupSectionSk key={i} />
    ))}
  </section>
)

// ── 페이지 전체 로딩 (route 전환 시) ─────────────────────────────────────────
const HomeLoading = () => (
  <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
    <div className="max-w-5xl mx-auto space-y-10">
      <MacroSectionSkeleton />
    </div>
  </main>
)

export default HomeLoading
