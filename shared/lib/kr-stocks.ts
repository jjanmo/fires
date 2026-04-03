import { readFileSync } from 'fs';
import { join } from 'path';

type KrStockMap = Record<string, string>; // 종목명 → 심볼 (e.g. '삼성전자' → '005930.KS')

let _cache: KrStockMap | null = null;
let _reverseCache: Record<string, string> | null = null; // 심볼 → 종목명

function load(): KrStockMap {
  if (_cache) return _cache;
  try {
    const raw = readFileSync(join(process.cwd(), 'public', 'kr-stocks.json'), 'utf-8');
    _cache = JSON.parse(raw);
  } catch {
    _cache = {};
  }
  return _cache!;
}

function loadReverse(): Record<string, string> {
  if (_reverseCache) return _reverseCache;
  const map = load();
  _reverseCache = Object.fromEntries(Object.entries(map).map(([name, symbol]) => [symbol.toUpperCase(), name]));
  return _reverseCache;
}

/** 한글 포함 여부 판별 */
export function isKoreanQuery(query: string): boolean {
  return /[가-힣]/.test(query);
}

const ETF_PREFIX = /^(TIGER|KODEX|KBSTAR|ACE|ARIRANG|HANARO|KOSEF|KINDEX|TIMEFOLIO|TIME|PLUS|SOL|RISE|TREX)\s/i;

/** 종목명으로 검색 (한글·영문 모두, 대소문자 무시) → 최대 limit개 반환 */
export function searchKrStocks(query: string, limit = 24) {
  const map = load();
  const q = query.trim().toLowerCase();
  const results: Array<{ symbol: string; name: string; exchange: string; type: string }> = [];

  for (const [name, symbol] of Object.entries(map)) {
    if (results.length >= limit) break;
    if (!name.toLowerCase().includes(q)) continue;
    const isKosdaq = symbol.endsWith('.KQ');
    results.push({
      symbol,
      name,
      exchange: isKosdaq ? 'KOQ' : 'KSC',
      type: ETF_PREFIX.test(name) ? 'E' : 'S',
    });
  }

  return results;
}

/** 심볼로 한글 종목명 조회 (없으면 null) */
export function getKrStockName(symbol: string): string | null {
  const reverse = loadReverse();
  return reverse[symbol.toUpperCase()] ?? null;
}
