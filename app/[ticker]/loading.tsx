export default function TickerLoading() {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 py-10 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* PriceBlock */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="skeleton h-3 w-10" />
              <div className="skeleton h-4 w-16 rounded-full" />
            </div>
            <div className="skeleton h-10 w-44 mb-2" />
            <div className="skeleton h-4 w-28" />
          </div>
          <div className="skeleton h-3 w-32" />
        </div>

        {/* TickerTabs */}
        <div className="flex gap-2">
          <div className="skeleton h-8 w-24 rounded-lg" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>

        {/* SignalCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-edge bg-sk-card p-5 space-y-4">
              <div className="skeleton h-3 w-36" />
              <div className="grid grid-cols-2 gap-4">
                {[0, 1].map((j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="skeleton h-2.5 w-16" />
                    <div className="skeleton h-6 w-24" />
                    <div className="skeleton h-2.5 w-28" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SigmaChart */}
        <div className="rounded-2xl border border-edge bg-sk-card p-5">
          <div className="skeleton h-3 w-40 mb-1" />
          <div className="skeleton h-3 w-20 mb-4" />
          {/* 차트 영역 */}
          <div className="skeleton h-48 w-full rounded-lg" />
          {/* 5열 요약 */}
          <div className="grid grid-cols-5 gap-1 mt-4 pt-3 border-t border-edge text-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="skeleton h-2.5 w-8" />
                <div className="skeleton h-3 w-12" />
                <div className="skeleton h-2.5 w-8" />
              </div>
            ))}
          </div>
          {/* 구간 설명 */}
          <div className="mt-4 pt-4 border-t border-edge space-y-3">
            <div className="skeleton h-3 w-20 mb-1" />
            {[52, 64, 56, 48].map((w, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="skeleton h-3 w-3 mt-0.5 shrink-0" />
                <div className={`skeleton h-3 w-${w}`} style={{ width: `${w * 4}px` }} />
              </div>
            ))}
          </div>
        </div>

        {/* HistoryTable */}
        <div className="rounded-2xl border border-edge bg-sk-card overflow-hidden">
          <div className="px-5 py-4 border-b border-edge">
            <div className="skeleton h-3 w-32" />
          </div>
          <div className="p-4 space-y-2">
            {/* 헤더 행 */}
            <div className="flex gap-2 px-1 pb-2 border-b border-edge">
              {[16, 12, 12, 12, 12, 12, 14, 14, 14, 14, 12].map((w, i) => (
                <div key={i} className="skeleton h-2.5 flex-1" style={{ maxWidth: `${w * 4}px` }} />
              ))}
            </div>
            {/* 데이터 행 */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2 px-1 py-1">
                {[16, 12, 12, 12, 12, 12, 14, 14, 14, 14, 10].map((w, j) => (
                  <div key={j} className="skeleton h-3 flex-1" style={{ maxWidth: `${w * 4}px` }} />
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
