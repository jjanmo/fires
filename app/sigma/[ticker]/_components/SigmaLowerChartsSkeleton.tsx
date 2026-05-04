import type { ReactNode } from 'react';

const Ln = ({ w = 'w-32' }: { w?: string }) => <div className={`skeleton h-2.5 rounded ${w}`} />

const CardBlock = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl bg-card border border-edge p-5 space-y-4">{children}</div>
)

const SigmaLowerChartsSkeleton = () => (
  <div className="space-y-5">
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

    <CardBlock>
      <div className="space-y-1.5">
        <Ln w="w-28" />
      </div>
      <div className="flex gap-1 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-6 w-14 rounded-md" />
        ))}
      </div>
      <div className="skeleton h-56 rounded-lg mt-4" />
      <div className="pt-3 border-t border-edge grid grid-cols-3 gap-3 mt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Ln w="w-14" />
            <div className="skeleton h-8 w-12 rounded" />
          </div>
        ))}
      </div>
    </CardBlock>
  </div>
)

export default SigmaLowerChartsSkeleton
