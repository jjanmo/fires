function Ln({ w = 'w-32' }: { w?: string }) {
  return <div className={`skeleton h-2.5 rounded ${w}`} />;
}

function CardBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-edge p-5 space-y-4">
      {children}
    </div>
  );
}

export function TickerInnerSkeleton() {
  return (
    <div className="space-y-5">

      {/* PriceBlock */}
      <div className="space-y-2">
        <Ln w="w-20" />
        <div className="skeleton h-10 w-44 rounded" />
        <Ln w="w-28" />
      </div>

      <div>
        {/* TickerTabs */}
        <div className="flex gap-1 mb-6 bg-tab-bar rounded-xl p-1 border border-edge">
          <div className="flex-1 skeleton h-9 rounded-lg" />
          <div className="flex-1 skeleton h-9 rounded-lg opacity-40" />
          <div className="flex-1 skeleton h-9 rounded-lg opacity-40" />
        </div>

        <div className="space-y-5">

          {/* SignalCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl border border-edge p-5 space-y-4">
                <Ln w="w-36" />
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1].map((j) => (
                    <div key={j} className="space-y-2">
                      <Ln w="w-14" />
                      <div className="skeleton h-6 w-24 rounded" />
                      <Ln w="w-20" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* SigmaChart */}
          <CardBlock>
            <Ln w="w-48" />
            <div className="skeleton h-80 rounded-lg" />
            <div className="pt-4 border-t border-edge space-y-2">
              <Ln w="w-16" />
              <Ln w="w-full" />
              <Ln w="w-5/6" />
              <Ln w="w-full" />
              <Ln w="w-4/5" />
            </div>
          </CardBlock>

          {/* SignalHistoryChart */}
          <CardBlock>
            <Ln w="w-44" />
            <div className="skeleton h-52 rounded-lg" />
            <div className="pt-4 border-t border-edge grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Ln w="w-10" />
                  <div className="skeleton h-5 w-8 rounded" />
                </div>
              ))}
            </div>
          </CardBlock>

          {/* DeclinePriceChart */}
          <CardBlock>
            <div className="space-y-1.5">
              <Ln w="w-28" />
              <Ln w="w-52" />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-6 w-10 rounded-md" />
              ))}
            </div>
            <div className="skeleton h-56 rounded-lg" />
            <div className="pt-3 border-t border-edge grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Ln w="w-14" />
                  <div className="skeleton h-5 w-10 rounded" />
                </div>
              ))}
            </div>
          </CardBlock>

        </div>
      </div>

    </div>
  );
}

export default function TickerLoading() {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 py-10 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <TickerInnerSkeleton />
      </div>
    </main>
  );
}
