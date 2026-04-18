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

        {/* OhlcChart */}
        <div className="rounded-2xl border border-edge bg-sk-card overflow-hidden">
          <div className="px-5 py-4 border-b border-edge">
            <div className="skeleton h-3 w-40" />
          </div>
          <div className="p-3">
            <div className="flex items-end gap-1 h-[280px] px-2">
              {[55,32,48,61,38,52,44,67,29,58,41,70,35,50,63,28,46,59,33,54,42,65,37,56,48,30,62,45,53,40].map((wick, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                  <div className="skeleton w-px" style={{ height: `${wick}%` }} />
                  <div className="skeleton w-full" style={{ height: `${Math.round(wick * 0.45)}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
