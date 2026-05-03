const BuyBox = () => (
  <div className="rounded-xl bg-buy-bg border border-buy-edge p-2">
    <div className="h-2.5 w-12 bg-inset rounded animate-pulse mb-1" />
    <div className="h-4 w-14 bg-inset rounded animate-pulse" />
    <div className="h-2 w-8 bg-inset rounded animate-pulse mt-0.5" />
  </div>
);

const SellBox = () => (
  <div className="rounded-xl bg-sell-bg border border-sell-edge p-2">
    <div className="h-2.5 w-12 bg-inset rounded animate-pulse mb-1" />
    <div className="h-4 w-14 bg-inset rounded animate-pulse" />
    <div className="h-2 w-8 bg-inset rounded animate-pulse mt-0.5" />
  </div>
);

const CardSkeleton = () => (
  <div className="rounded-2xl border border-edge bg-card p-3.5">
    <div className="flex items-start justify-between mb-3">
      <div className="h-3 w-16 bg-inset rounded animate-pulse" />
      <div className="h-5 w-10 bg-inset rounded-md animate-pulse" />
    </div>
    <div className="mb-3">
      <div className="h-2.5 w-12 bg-inset rounded animate-pulse mb-1" />
      <div className="h-6 w-24 bg-inset rounded animate-pulse" />
      <div className="flex justify-between mt-1">
        <div className="h-2.5 w-14 bg-inset rounded animate-pulse" />
        <div className="h-2.5 w-14 bg-inset rounded animate-pulse hidden sm:block" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-2">
      <BuyBox /><BuyBox />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <SellBox /><SellBox />
    </div>
  </div>
);

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
