import { Suspense } from 'react';
import SigmaSection from './_components/SigmaSection';

const SigmaSectionPending = () => (
  <div className="flex items-center justify-center py-24 gap-0.5" role="status" aria-label="불러오는 중">
    <div className="h-2 w-2 skeleton rounded-full animate-pulse [animation-duration:800ms] [animation-delay:-0.3s]" />
    <div className="h-2 w-2 skeleton rounded-full animate-pulse [animation-duration:800ms] [animation-delay:-0.15s]" />
    <div className="h-2 w-2 skeleton rounded-full animate-pulse [animation-duration:800ms]" />
  </div>
);

const SigmaPage = () => (
  <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-ink-1">시그마 전략</h2>
      <Suspense fallback={<SigmaSectionPending />}>
        <SigmaSection />
      </Suspense>
    </div>
  </main>
);

export default SigmaPage;
