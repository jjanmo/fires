import { Suspense } from 'react';
import { MacroIndicatorSection } from '@/features/macro';
import { MacroSectionSkeleton } from './loading';
import ScrollToTop from '@/shared/ui/ScrollToTop';

const HomePage = async () => {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<MacroSectionSkeleton />}>
          <MacroIndicatorSection />
        </Suspense>
      </div>
      <ScrollToTop />
    </main>
  );
}

export default HomePage
