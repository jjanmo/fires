export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-[#0a0c10] px-4 py-10 sm:px-6">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="mb-10 space-y-2">
          <div className="h-7 w-32 bg-[#1e2128] rounded" />
          <div className="h-4 w-64 bg-[#1a1d24] rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-[#111318] rounded-2xl border border-[#1e2128]" />
          ))}
        </div>
      </div>
    </main>
  )
}
