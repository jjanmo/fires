'use client'

import { useRouter } from 'next/navigation'

export default function TickerSearch() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const symbol = (new FormData(e.currentTarget).get('symbol') as string).trim()
    if (!symbol) return
    router.push(`/${symbol.toLowerCase()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="symbol"
        placeholder="NVDA, AAPL, SPY..."
        autoComplete="off"
        autoCapitalize="characters"
        className="flex-1 rounded-xl border border-edge bg-card px-4 py-2.5 text-sm text-ink-1 placeholder:text-ink-4 focus:outline-none focus:ring-1 focus:ring-edge"
      />
      <button
        type="submit"
        className="rounded-xl border border-edge bg-card px-4 py-2.5 text-sm font-medium text-ink-2 hover:bg-inset transition-colors"
      >
        검색
      </button>
    </form>
  )
}
