'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
      <div className="text-center space-y-3">
        <p className="text-slate-400 text-sm">오류가 발생했습니다</p>
        <p className="text-slate-600 text-xs font-mono">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-[#2d3340] hover:border-slate-500"
        >
          다시 시도
        </button>
      </div>
    </main>
  )
}
