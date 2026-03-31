'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isKoreanTicker } from '@/shared/lib/ticker'

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

const EXCHANGE_LABEL: Record<string, string> = {
  KSE: 'KOSPI',
  KOQ: 'KOSDAQ',
  NMS: 'NASDAQ',
  NYQ: 'NYSE',
  NGM: 'NASDAQ',
  PCX: 'ARCA',
  BTS: 'BATS',
}

export default function TickerSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 디바운스 검색
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        setResults(data.results ?? [])
        setOpen(true)
        setActiveIdx(-1)
      } catch {
        // abort 무시
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const navigate = useCallback((symbol: string) => {
    setOpen(false)
    setQuery('')
    // 한국 주식은 .KS/.KQ 포함, 해외주식은 심볼만
    const slug = symbol.toLowerCase()
    router.push(`/${encodeURIComponent(slug)}`)
  }, [router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        const trimmed = query.trim()
        if (trimmed) navigate(trimmed)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && activeIdx < results.length) {
        navigate(results[activeIdx].symbol)
      } else {
        const trimmed = query.trim()
        if (trimmed) navigate(trimmed)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="삼성전자, NVDA, AAPL, 005930.KS..."
          autoComplete="off"
          className="flex-1 rounded-xl border border-edge bg-card px-4 py-2.5 text-sm text-ink-1 placeholder:text-ink-4 focus:outline-none focus:ring-1 focus:ring-edge"
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = query.trim()
            if (trimmed) navigate(trimmed)
          }}
          className="rounded-xl border border-edge bg-card px-4 py-2.5 text-sm font-medium text-ink-2 hover:bg-inset transition-colors"
        >
          검색
        </button>
      </div>

      {/* 자동완성 드롭다운 */}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-edge bg-card shadow-lg overflow-hidden">
          {results.map((r, i) => {
            const isKR = isKoreanTicker(r.symbol)
            const exchangeLabel = EXCHANGE_LABEL[r.exchange] ?? r.exchange
            return (
              <li
                key={r.symbol}
                onMouseDown={() => navigate(r.symbol)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                  i === activeIdx ? 'bg-inset' : 'hover:bg-inset/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm font-semibold text-ink-1 tabular-nums shrink-0">
                    {r.symbol}
                  </span>
                  <span className="text-xs text-ink-3 truncate">{r.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isKR && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      KR
                    </span>
                  )}
                  <span className="text-[10px] text-ink-4">{exchangeLabel}</span>
                  <span className="text-[10px] text-ink-4">
                    {r.type === 'E' ? 'ETF' : ''}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
