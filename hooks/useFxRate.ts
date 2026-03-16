'use client';

import { useState, useCallback, useEffect } from 'react';

interface FxRateResult {
  rate: number;
  updatedAt: string;
  loading: boolean;
  refresh: () => void;
}

const FALLBACK = 1450;

// 모듈 레벨 캐시 — 컴포넌트 리마운트 시에도 유지
let _cache: { rate: number; updatedAt: string } | null = null;

async function fetchFxRate() {
  const res = await fetch('/api/fxrate');
  const data = await res.json();
  if (!data.error) {
    _cache = { rate: data.rate, updatedAt: data.updatedAt };
  }
  return _cache;
}

export function useFxRate(): FxRateResult {
  const [rate, setRate] = useState(_cache?.rate ?? FALLBACK);
  const [updatedAt, setUpdatedAt] = useState(_cache?.updatedAt ?? '');
  const [loading, setLoading] = useState(false);

  // 캐시가 없을 때만 최초 1회 자동 fetch
  useEffect(() => {
    if (_cache) return;
    setLoading(true);
    fetchFxRate()
      .then((c) => {
        if (c) {
          setRate(c.rate);
          setUpdatedAt(c.updatedAt);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      _cache = null; // 강제 재요청
      const c = await fetchFxRate();
      if (c) {
        setRate(c.rate);
        setUpdatedAt(c.updatedAt);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { rate, updatedAt, loading, refresh };
}
