import CardSkeleton from './_components/CardSkeleton';

const SigmaLoading = () => (
  <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-7 w-28 sm:w-32 bg-card rounded-md animate-pulse" />
      <div className="space-y-3">
        <div className="h-4 w-14 bg-card rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  </main>
);

export default SigmaLoading;
