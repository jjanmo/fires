const CardSkeleton = () => (
  <div className="rounded-2xl border border-edge bg-card p-3.5 h-44 animate-pulse" />
);

const SigmaLoading = () => (
  <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-7 w-32 bg-card rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  </main>
);

export default SigmaLoading;
