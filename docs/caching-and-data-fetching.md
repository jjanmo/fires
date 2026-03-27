# 캐싱 & 데이터 패칭 구조

## 1. 환율 캐싱

**데이터 소스:** `open.er-api.com/v6/latest/USD`

### 서버 레이어
- **파일:** `app/api/fxrate/route.ts`
- **캐싱:** `next: { revalidate: 3600 }` — 1시간 ISR
- **응답:** `{ rate: number, updatedAt: string }`

### 클라이언트 레이어
- **파일:** `shared/hooks/useFxRate.ts`
- **캐싱:** 모듈 레벨 Map 캐시 — 컴포넌트 리마운트 / 페이지 이동 후에도 유지
- **Fallback:** `1450`
- `refresh()` 호출 시에만 캐시 초기화 후 재요청

---

## 2. 시그마 계산값 캐싱

**데이터 소스:** Yahoo Finance `v8/finance/chart/{symbol}?interval=1d&range={range}`

### 서버 레이어
- **파일:** `entities/sigma/api/fetchCloses.ts`
- **캐싱:** `next: { revalidate: 3600 }` — 1시간 ISR
- 종가 히스토리(OHLC + adjclose) 반환
- adjclose 기반 split/배당 조정 계수를 전체 OHLC에 반영

### 계산 흐름 (SSR 시점, `app/[ticker]/page.tsx`)

```
fetchCloses('5y')  → buildHistory()      → HistoryTable  (전체 신호 이력)
fetchCloses('5y')  → buildLatestSignal() → SignalCards   (현재 매수/매도 지정가)
fetchCloses('max') → calcMdd()           → MddTab        (최대낙폭)
```

- 모든 계산은 **서버에서 1회 실행** 후 props로 내려줌
- 클라이언트는 이미 계산된 값만 렌더링 (별도 클라이언트 요청 없음)

### 주요 계산 함수 (`entities/sigma/model/calc.ts`)

| 함수 | 입력 | 출력 | 설명 |
|------|------|------|------|
| `calcDailyReturns` | `ClosePrice[]` | `number[]` | 일간 등락률 (%) |
| `calcRolling252` | returns, index | `SigmaResult` | Rolling 252일 σ 계산 |
| `buildHistory` | `ClosePrice[]` | `HistoryRow[]` | 전체 신호 이력 빌드 |
| `buildLatestSignal` | `ClosePrice[]` | `HistoryRow \| null` | 최신 매수/매도 신호 |
| `calcMdd` | `ClosePrice[]` | `MddResult` | 최대낙폭 계산 |

**2σ 매매 신호 기준**
- 매수: 당일 저가 ≤ `μ - 2σ` 지정가
- 매도: 당일 고가 ≥ `μ + 2σ` 지정가

---

## 3. 실시간 주식 가격

**데이터 소스:** Yahoo Finance `v8/finance/chart/{symbol}?interval=1m&range=1d`

### 서버 레이어
- **파일:** `app/api/quote/[ticker]/route.ts`
- **캐싱:** `cache: 'no-store'` — 캐싱 없음, 매 요청마다 새로 패칭
- **응답:** `{ price, change, changePct, prevClose, marketState }`

### 클라이언트 레이어
- **파일:** `shared/hooks/useLivePrice.ts`
- **패턴:** Pub/Sub + 모듈 레벨 Map 캐시
  - 같은 ticker를 여러 컴포넌트가 구독해도 API 요청은 1회
- **폴링 주기:**
  - 장중 (`REGULAR`): 15초마다
  - 장외 (`PRE` / `POST` / `CLOSED`): 폴링 중단

---

## 4. 전체 캐싱 레이어 요약

| 데이터 | 캐싱 위치 | TTL | 방식 |
|--------|----------|-----|------|
| 종가 히스토리 (시그마 계산 원본) | Next.js fetch 캐시 | 1시간 | ISR revalidate |
| 환율 | Next.js fetch 캐시 | 1시간 | ISR revalidate |
| 환율 (클라이언트) | 모듈 레벨 Map | 세션 동안 | 수동 refresh만 갱신 |
| 실시간 가격 | 캐싱 없음 | — | no-store |
| 실시간 가격 (클라이언트) | 모듈 레벨 Map | ~15초 | 폴링 + Pub/Sub |

---

## 5. 전체 데이터 흐름

```
[ 서버 (SSR) ]
  fetchCloses('5y', 'max')
    └─ Yahoo Finance (1d 캔들) ──→ revalidate 1h
         ├─ buildHistory()      ──→ HistoryTable
         ├─ buildLatestSignal() ──→ SignalCards, PriceBlock
         └─ calcMdd()           ──→ MddTab

[ 클라이언트 ]
  useLivePrice(ticker)
    └─ /api/quote/[ticker] (no-store) ──→ 15초 폴링 (장중만)

  useFxRate()
    └─ /api/fxrate (revalidate 1h) ──→ 최초 1회 + 수동 refresh
```

---

## 6. 관련 파일 목록

| 역할 | 파일 |
|------|------|
| 종가 패칭 | `entities/sigma/api/fetchCloses.ts` |
| 시그마 계산 | `entities/sigma/model/calc.ts` |
| 타입 정의 | `entities/sigma/model/types.ts` |
| 실시간 가격 API | `app/api/quote/[ticker]/route.ts` |
| 환율 API | `app/api/fxrate/route.ts` |
| 종가 배열 API | `app/api/stock/[ticker]/route.ts` |
| 실시간 가격 훅 | `shared/hooks/useLivePrice.ts` |
| 환율 훅 | `shared/hooks/useFxRate.ts` |
| 상세 페이지 (SSR) | `app/[ticker]/page.tsx` |
