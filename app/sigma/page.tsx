import { Suspense } from 'react';
import DotsPending from '@/shared/ui/DotsPending';
import SigmaSection from './_components/SigmaSection';

const SigmaPage = () => (
  <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-lg sm:text-2xl font-bold text-ink-1">시그마 전략</h2>
      <Suspense fallback={<DotsPending />}>
        <SigmaSection />
      </Suspense>
    </div>
  </main>
);

export default SigmaPage;
