'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results ?? []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [q]);

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas px-4 pt-10 pb-40 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-edge border-t-ink-3 rounded-full animate-spin" />
          </div>
        )}

        {/* 결과 그리드 */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {results.map((r) => {
              const isKR = isKoreanTicker(r.symbol);
              const exchangeLabel = EXCHANGE_LABEL[r.exchange] ?? r.exchange;
              return (
                <Link
                  key={r.symbol}
                  href={`/${encodeURIComponent(r.symbol.toLowerCase())}`}
                  className="group block rounded-xl border border-edge bg-card p-4 hover:bg-inset hover:border-edge-hi hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 text-left cursor-pointer"
                >
                  <p className="text-sm font-bold text-ink-1 truncate mb-1 group-hover:text-ink-1">
                    {isKR ? r.name : r.symbol}
                  </p>
                  <p className="text-xs text-ink-3 tabular-nums truncate mb-2 group-hover:text-ink-2">
                    {isKR ? r.symbol : r.name}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        isKR
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                      }`}
                    >
                      {exchangeLabel}
                    </span>
                    {r.type === 'E' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/30">
                        ETF
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && q.trim() && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-ink-3">
              <span className="font-medium text-ink-2">&ldquo;{q}&rdquo;</span>에 대한 검색 결과가 없습니다
            </p>
          </div>
        )}

        {/* 초기 안내 */}
        {!q.trim() && !loading && (
          <div className="text-center py-20 space-y-1.5">
            <p className="text-sm text-ink-3">종목명, 티커 심볼, 종목 코드로 검색할 수 있습니다</p>
            <p className="text-xs text-ink-4">
              삼성전자&nbsp;&nbsp;·&nbsp;&nbsp;TIGER 미국S&P500&nbsp;&nbsp;·&nbsp;&nbsp;005930.KS&nbsp;&nbsp;·&nbsp;&nbsp;AAPL
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
