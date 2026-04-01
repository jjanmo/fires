/**
 * KRX KIND + 네이버 금융에서 국내 전종목(주식 + ETF)을 가져와
 * public/kr-stocks.json 을 생성하는 스크립트
 *
 * - KOSPI  (KRX KIND): ~837개  → 종목코드.KS
 * - KOSDAQ (KRX KIND): ~1,892개 → 종목코드.KQ
 * - ETF    (네이버 금융): ~1,084개 → 종목코드.KS
 *
 * 실행: node scripts/generate-kr-stocks.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'public', 'kr-stocks.json');

const KRX_HEADERS = {
  Referer: 'https://kind.krx.co.kr',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

const NAVER_HEADERS = {
  Referer: 'https://finance.naver.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

/** KRX KIND에서 주식 종목명 → 코드 매핑 */
async function fetchStocks(marketType) {
  const url = marketType
    ? `https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13&marketType=${marketType}`
    : 'https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13';

  const res = await fetch(url, { headers: KRX_HEADERS });
  if (!res.ok) throw new Error(`KRX 요청 실패 (${res.status}): ${url}`);

  const buf = await res.arrayBuffer();
  const html = new TextDecoder('euc-kr').decode(buf);

  const mapping = {};
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
  const tdRegex = /<td[^>]*>(.*?)<\/td>/gs;
  const tagRegex = /<[^>]+>/g;

  let rowMatch;
  let isFirst = true;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    if (isFirst) { isFirst = false; continue; }
    const cells = [];
    let tdMatch;
    const tdRe = new RegExp(tdRegex.source, tdRegex.flags);
    while ((tdMatch = tdRe.exec(rowMatch[1])) !== null) {
      cells.push(tdMatch[1].replace(tagRegex, '').trim());
    }
    if (cells.length >= 3 && /^\d{6}$/.test(cells[2])) {
      mapping[cells[0]] = cells[2];
    }
  }

  if (Object.keys(mapping).length === 0) {
    throw new Error(`KRX 파싱 결과 없음 (marketType=${marketType || 'all'}): 응답 구조가 변경됐을 수 있습니다`);
  }

  return mapping;
}

/** 네이버 금융에서 ETF 종목명 → 코드 매핑 */
async function fetchEtfs() {
  const res = await fetch('https://finance.naver.com/api/sise/etfItemList.nhn', {
    headers: NAVER_HEADERS,
  });
  if (!res.ok) throw new Error(`네이버 ETF 요청 실패 (${res.status})`);

  const buf = await res.arrayBuffer();
  const text = new TextDecoder('euc-kr').decode(buf);
  const data = JSON.parse(text);

  const mapping = {};
  for (const item of data?.result?.etfItemList ?? []) {
    if (item.itemcode && item.itemname) {
      mapping[item.itemname] = item.itemcode;
    }
  }

  if (Object.keys(mapping).length === 0) {
    throw new Error('네이버 ETF 파싱 결과 없음: 응답 구조가 변경됐을 수 있습니다');
  }

  return mapping;
}

async function main() {
  console.log(`[${new Date().toISOString()}] 국내 종목 데이터 수집 시작`);

  const results = await Promise.allSettled([
    fetchStocks('stockMkt').then(d => ({ source: 'KOSPI',  suffix: '.KS', data: d })),
    fetchStocks('')        .then(d => ({ source: 'KOSDAQ', suffix: '.KQ', data: d })),
    fetchEtfs()            .then(d => ({ source: 'ETF',    suffix: '.KS', data: d })),
  ]);

  const mapping = {};
  let hasError = false;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { source, suffix, data } = result.value;
      for (const [name, code] of Object.entries(data)) {
        mapping[name] = `${code}${suffix}`;
      }
      console.log(`✓ ${source}: ${Object.keys(data).length}개`);
    } else {
      console.error(`✗ 에러: ${result.reason.message}`);
      hasError = true;
    }
  }

  if (Object.keys(mapping).length === 0) {
    throw new Error('모든 소스 실패: JSON을 생성할 수 없습니다');
  }

  // 일부 소스 실패 시 기존 JSON 유지 (불완전한 데이터로 덮어쓰지 않음)
  if (hasError) {
    console.error('일부 소스 실패로 인해 기존 데이터를 유지합니다');
    process.exit(1);
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`저장 완료: 총 ${Object.keys(mapping).length}개 → ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
