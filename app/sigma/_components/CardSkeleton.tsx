const PriceBox = () => (
  <div className="rounded-xl bg-inset border border-edge p-2">
    <div className="h-3 w-10 bg-card rounded mb-1" />
    <div className="h-5 w-14 bg-card rounded" />
    <div className="h-3 w-8 bg-card rounded mt-0.5" />
  </div>
);

const CardSkeleton = () => (
  <div className="rounded-2xl border border-edge bg-card p-3.5 h-[303px] animate-pulse">
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="min-w-0">
        <div className="h-4 w-16 bg-inset rounded" />
        <div className="h-[15px] w-20 bg-inset rounded mt-1" />
      </div>
      <div className="h-6 w-12 bg-inset rounded-md shrink-0" />
    </div>
    <div className="mb-3">
      <div className="h-3 w-12 bg-inset rounded mb-1" />
      <div className="h-7 w-24 bg-inset rounded" />
      <div className="flex items-center justify-between mt-1">
        <div className="h-3 w-14 bg-inset rounded" />
        <div className="h-3 w-14 bg-inset rounded hidden sm:block" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-2">
      <PriceBox /><PriceBox />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <PriceBox /><PriceBox />
    </div>
  </div>
);

export default CardSkeleton;
