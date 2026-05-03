import { Suspense } from 'react';
import SigmaSection from './_components/SigmaSection';
import CardSkeleton from './_components/CardSkeleton';

const SigmaSectionSkeleton = () => (
  <div className="space-y-3">
    <div className="h-4 w-14 bg-card rounded animate-pulse" />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  </div>
);

const SigmaPage = () => (
  <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-ink-1">시그마 전략</h2>
      <Suspense fallback={<SigmaSectionSkeleton />}>
        <SigmaSection />
      </Suspense>
    </div>
  </main>
);

export default SigmaPage;
