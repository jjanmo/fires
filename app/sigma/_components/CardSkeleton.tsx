const BuyBox = () => (
  <div className="rounded-xl bg-buy-bg border border-buy-edge p-2">
    <div className="h-3 w-10 bg-inset rounded animate-pulse mb-1" />
    <div className="h-5 w-14 bg-inset rounded animate-pulse" />
    <div className="h-3 w-8 bg-inset rounded animate-pulse mt-0.5" />
  </div>
);

const SellBox = () => (
  <div className="rounded-xl bg-sell-bg border border-sell-edge p-2">
    <div className="h-3 w-10 bg-inset rounded animate-pulse mb-1" />
    <div className="h-5 w-14 bg-inset rounded animate-pulse" />
    <div className="h-3 w-8 bg-inset rounded animate-pulse mt-0.5" />
  </div>
);

const CardSkeleton = () => (
  <div className="rounded-2xl border border-edge bg-card p-3.5 h-[303px]">
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="min-w-0">
        <div className="h-4 w-16 bg-inset rounded animate-pulse" />
        <div className="h-[15px] w-20 bg-inset rounded animate-pulse mt-1" />
      </div>
      <div className="h-6 w-12 bg-inset rounded-md animate-pulse shrink-0" />
    </div>
    <div className="mb-3">
      <div className="h-3 w-12 bg-inset rounded animate-pulse mb-1" />
      <div className="h-7 w-24 bg-inset rounded animate-pulse" />
      <div className="flex items-center justify-between mt-1">
        <div className="h-3 w-14 bg-inset rounded animate-pulse" />
        <div className="h-3 w-14 bg-inset rounded animate-pulse hidden sm:block" />
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

export default CardSkeleton;
