export default function TickerLoading() {
  return (
    <main className="min-h-screen bg-[#0a0c10] px-4 py-10 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
        {/* PriceBlock 스켈레톤 */}
        <div className="space-y-2">
          <div className="h-3 w-12 bg-[#1e2128] rounded" />
          <div className="h-12 w-40 bg-[#1e2128] rounded" />
          <div className="h-3 w-24 bg-[#1a1d24] rounded" />
        </div>

        {/* SignalCards 스켈레톤 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-[#111318] rounded-2xl border border-[#1e2128]" />
          <div className="h-32 bg-[#111318] rounded-2xl border border-[#1e2128]" />
        </div>

        {/* SigmaDetail 스켈레톤 */}
        <div className="h-24 bg-[#111318] rounded-2xl border border-[#1e2128]" />

        {/* Chart 스켈레톤 */}
        <div className="h-64 bg-[#111318] rounded-2xl border border-[#1e2128]" />

        {/* Table 스켈레톤 */}
        <div className="h-80 bg-[#111318] rounded-2xl border border-[#1e2128]" />
      </div>
    </main>
  )
}
