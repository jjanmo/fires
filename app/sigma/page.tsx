import { Suspense } from 'react';
import SigmaSection from './_components/SigmaSection';

const SigmaSectionSkeleton = () => (
  <div className="space-y-3">
    <div className="skeleton h-4 w-16 rounded" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-edge bg-card p-5 h-52 animate-pulse" />
      ))}
    </div>
  </div>
);

const SigmaPage = () => {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-ink-1">시그마 전략</h2>
        <Suspense fallback={<SigmaSectionSkeleton />}>
          <SigmaSection />
        </Suspense>
      </div>
    </main>
  );
};

export default SigmaPage;
