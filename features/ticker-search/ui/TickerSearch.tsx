'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isKoreanTicker } from '@/shared/lib/ticker';

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

const EXCHANGE_LABEL: Record<string, string> = {
  KSE: 'KOSPI',
  KSC: 'KOSPI',
  KOQ: 'KOSDAQ',
  NMS: 'NASDAQ',
  NYQ: 'NYSE',
  NGM: 'NASDAQ',
  PCX: 'ARCA',
  BTS: 'BATS',
};

export default function TickerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 디바운스 검색
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
        setActiveIdx(-1);
      } catch {
        // abort 무시
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const navigate = useCallback(
    (symbol: string) => {
      setOpen(false);
      setQuery('');
      const slug = symbol.toLowerCase();
      router.push(`/${encodeURIComponent(slug)}`);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < results.length) {
        navigate(results[activeIdx].symbol);
      } else if (results.length > 0) {
        navigate(results[0].symbol);
      } else {
        const trimmed = query.trim();
        if (trimmed) navigate(trimmed);
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="삼성전자, TIGER 미국S&P500, AAPL, 005930.KS..."
            autoComplete="off"
            className="w-full rounded-xl border border-edge bg-card px-4 py-2.5 text-sm text-ink-1 placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-edge-hi transition-shadow"
          />
          {/* 로딩 스피너 */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-edge border-t-ink-3 rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            const trimmed = query.trim();
            if (trimmed) navigate(trimmed);
          }}
          className="rounded-xl border border-edge bg-card px-4 py-2.5 text-sm font-medium text-ink-2 hover:bg-inset transition-colors"
        >
          검색
        </button>
      </div>

      {/* 자동완성 드롭다운 */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full">
          <ul className="rounded-xl border-2 border-edge-hi bg-card shadow-xl max-h-[320px] overflow-y-auto divide-y divide-edge">
            {results.map((r, i) => {
              const isKR = isKoreanTicker(r.symbol);
              const exchangeLabel = EXCHANGE_LABEL[r.exchange] ?? r.exchange;
              const isActive = i === activeIdx;
              return (
                <li
                  key={r.symbol}
                  onMouseDown={() => navigate(r.symbol)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-inset' : 'hover:bg-inset'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink-1 tabular-nums">{r.symbol}</span>
                        {isKR && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            KR
                          </span>
                        )}
                        {r.type === 'E' && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            ETF
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-3 truncate mt-0.5">{r.name}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-ink-4 shrink-0 ml-3">
                    {exchangeLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
