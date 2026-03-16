'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function TickerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#0a0c10] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-slate-500 text-sm">데이터를 불러오지 못했습니다</p>
        <p className="text-slate-600 text-xs font-mono">{error.message}</p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-[#2d3340] hover:border-slate-500"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-[#2d3340] hover:border-slate-500"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  )
}
