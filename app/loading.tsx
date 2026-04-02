function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-edge bg-sk-card p-6">
      {/* 심볼 + 설명 + 배지 — mb-4 */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <div className="skeleton h-3 w-10" />
          <div className="skeleton h-3 w-36 mt-1" />
          <div className="skeleton h-3 w-28" />
        </div>
        <div className="skeleton h-6 w-14 rounded-md" />
      </div>

      {/* 종가 — mb-5 */}
      <div className="mb-5">
        <div className="skeleton h-3 w-14 mb-1" />
        <div className="skeleton h-9 w-32" />
        <div className="skeleton h-3 w-20 mt-1" />
      </div>

      {/* 매수 박스 (1σ / 2σ) */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-edge bg-sk-card p-3">
            <div className="skeleton h-2.5 w-20 mb-1" />
            <div className="skeleton h-7 w-24" />
            <div className="skeleton h-2.5 w-16 mt-0.5" />
          </div>
        ))}
      </div>

      {/* 매도 박스 (1σ / 2σ) */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-edge bg-sk-card p-3">
            <div className="skeleton h-2.5 w-20 mb-1" />
            <div className="skeleton h-7 w-24" />
            <div className="skeleton h-2.5 w-16 mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 py-10 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="skeleton h-4 w-20 mb-1.5" />
          <div className="skeleton h-3 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
