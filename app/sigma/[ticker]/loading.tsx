import type { ReactNode } from 'react';
import SigmaLowerChartsSkeleton from './_components/SigmaLowerChartsSkeleton';

const Ln = ({ w = 'w-32' }: { w?: string }) => <div className={`skeleton h-2.5 rounded ${w}`} />;

const CardBlock = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl bg-card border border-edge p-5 space-y-4">{children}</div>
);

export const TickerInnerSkeleton = () => {
  return (
    <div className="space-y-5">
      {/* PriceBlock + Watchlist (TickerContent 상단 행) */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Ln w="w-40" />
            <div className="skeleton h-5 w-24 rounded-full" />
          </div>
          <div className="skeleton h-10 w-52 sm:h-14 sm:w-64 rounded-lg" />
          <Ln w="w-36" />
        </div>
        <div className="pt-1 shrink-0">
          <div className="skeleton h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* SigmaWindowBar — 롤링 4단 세그먼트 */}
      <div className="border-b border-edge py-1 flex flex-row justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex bg-inset rounded-lg border border-edge p-0.5 shrink-0 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton w-[67px] h-9 shrink-0 rounded-md" />
            ))}
          </div>
        </div>
        <div className="hidden sm:block skeleton h-6 w-40 rounded shrink-0" />
      </div>

      {/* SigmaTabContent 영역 — 카드 + 정규분포 차트 */}
      <div className="space-y-5 pt-6">
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
      </div>

      {/* Suspense 로딩되는 하단: 신호 이력 + 시그마 빈도 분석 */}
      <SigmaLowerChartsSkeleton />
    </div>
  );
};

const TickerLoading = () => (
  <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
    <div className="max-w-5xl mx-auto space-y-5">
      <TickerInnerSkeleton />
    </div>
  </main>
);

export default TickerLoading;
