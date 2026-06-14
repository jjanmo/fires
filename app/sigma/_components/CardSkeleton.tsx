const Sk = ({ h, w }: { h: string; w: string }) => <div className={`sk-bar ${h} ${w}`} />;

const CardSkeleton = () => (
  <div className="rounded-2xl border border-edge bg-card pt-9 px-3.5 pb-3.5 h-[303px] flex flex-col">
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="min-w-0 space-y-1">
        <Sk h="h-4" w="w-16" />
        <Sk h="h-[15px]" w="w-20" />
      </div>
      <Sk h="h-6" w="w-12" />
    </div>
    <div className="mb-3">
      <Sk h="h-3" w="w-12" />
      <div className="my-1">
        <Sk h="h-7" w="w-24" />
      </div>
      <div className="flex items-center justify-between">
        <Sk h="h-3" w="w-14" />
        <div className="hidden sm:block">
          <Sk h="h-3" w="w-14" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-2 flex-1">
      <div className="sk-bar rounded-xl" />
      <div className="sk-bar rounded-xl" />
    </div>
    <div className="grid grid-cols-2 gap-2 flex-1">
      <div className="sk-bar rounded-xl" />
      <div className="sk-bar rounded-xl" />
    </div>
  </div>
);

export default CardSkeleton;
