'use client';

import { useState, useEffect } from 'react';

export type MarketState = 'REGULAR' | 'PRE' | 'POST' | 'CLOSED';

export interface LivePriceResult {
  price: number;
  change: number;
  changePct: number;
  marketState: MarketState;
  loading: boolean;
}

interface QuoteData {
  price: number;
  change: number;
  changePct: number;
  marketState: MarketState;
}

// ── 모듈 레벨 캐시 (컴포넌트 리마운트 시 재요청 방지) ──────────────
const _cache = new Map<string, QuoteData>();
const _listeners = new Map<string, Set<(d: QuoteData) => void>>();
const _intervals = new Map<string, ReturnType<typeof setInterval>>();

async function poll(ticker: string) {
  try {
    const res = await fetch(`/api/quote/${ticker.toLowerCase()}`);
    const data = await res.json();
    if (data.error) return;
    const q: QuoteData = {
      price:       data.price,
      change:      data.change,
      changePct:   data.changePct,
      marketState: data.marketState,
    };
    _cache.set(ticker, q);
    _listeners.get(ticker)?.forEach(fn => fn(q));
  } catch { /* 무시 */ }
}

function subscribe(ticker: string, cb: (d: QuoteData) => void): () => void {
  if (!_listeners.has(ticker)) _listeners.set(ticker, new Set());
  _listeners.get(ticker)!.add(cb);

  if (!_intervals.has(ticker)) {
    poll(ticker);
    // 장중(REGULAR)에만 의미 있으므로 15초 폴링
    _intervals.set(ticker, setInterval(() => poll(ticker), 15_000));
  } else if (_cache.has(ticker)) {
    cb(_cache.get(ticker)!);
  }

  return () => {
    _listeners.get(ticker)?.delete(cb);
    if (_listeners.get(ticker)?.size === 0) {
      clearInterval(_intervals.get(ticker));
      _intervals.delete(ticker);
      _listeners.delete(ticker);
    }
  };
}
// ───────────────────────────────────────────────────────────────

export function useLivePrice(ticker: string, fallback: number): LivePriceResult {
  const cached = _cache.get(ticker);
  const [data, setData] = useState<QuoteData>({
    price:       cached?.price       ?? fallback,
    change:      cached?.change      ?? 0,
    changePct:   cached?.changePct   ?? 0,
    marketState: cached?.marketState ?? 'CLOSED',
  });
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    const unsub = subscribe(ticker, (d) => {
      setData(d);
      setLoading(false);
    });
    return unsub;
  }, [ticker]);

  return { ...data, loading };
}
