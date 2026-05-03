# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 협업 방식

- **답변은 항상 한글**로 작성한다.
- **개발 요청을 받으면 바로 실행하지 않는다.** 먼저 접근 방식, 트레이드오프, 주요 결정 사항을 설명하고 사용자의 동의/피드백을 받은 뒤 구현한다. (페어 프로그래밍·페어 기획 방식)
- 예외: 오타 수정, 명백한 버그픽스 등 단순 작업은 바로 실행해도 무방하다.

## Commands

```bash
pnpm dev                    # 개발 서버 시작
pnpm build                  # 프로덕션 빌드
pnpm lint                   # ESLint 실행
pnpm generate:kr-stocks     # kr-stocks.json 갱신 (KRX + Naver ETF 크롤링)
```

테스트 프레임워크는 없음.

## 아키텍처 개요

**FSD(Feature-Sliced Design)** 에 가까운 레이어 구조를 채택한 Next.js 15 App Router 프로젝트.

```
app/           # Next.js 라우팅 + API Routes
features/      # 도메인 기능 (auth, watchlist, trade-journal)
entities/      # 도메인 엔티티 (sigma: 시그마 계산 + 종가 패칭)
widgets/       # 상세 페이지 탭 구성 컴포넌트
shared/        # 공유 유틸 (hooks, lib, ui)
scripts/       # 빌드·데이터 생성 스크립트
```

각 슬라이스는 `index.ts` barrel을 통해서만 외부에 노출한다. 슬라이스 간 직접 내부 경로 import 금지.

## 데이터 흐름

### 외부 API

| 소스 | 용도 |
|---|---|
| `query1/query2.finance.yahoo.com` | 주가 OHLC, 실시간 가격, 검색 (비공식 API) |
| `kind.krx.co.kr` | KOSPI/KOSDAQ 종목 코드 매핑 (스크립트 전용) |
| `finance.naver.com` | 한국 ETF 목록 (스크립트 전용) |
| Supabase | 사용자 인증, watchlist·매매일지 저장 |

KRX/Naver 데이터는 GitHub Actions로 매일 갱신되어 `public/kr-stocks.json`에 정적 파일로 저장됨.

### 캐싱 레이어

- **Yahoo Finance fetch** — `next: { revalidate: N }` 로 ISR 제어
  - 종가 히스토리: 1시간 (`fetchCloses`)
  - 환율: 5분 (`/api/fxrate`)
  - 실시간 가격: no-store (`/api/quote/[ticker]`)
- **뮤테이션 후 캐시 무효화** — Server Action에서 `revalidatePath()`, 클라이언트에서 `router.refresh()`
- **클라이언트 메모리 캐시** — `useLivePrice` / `useFxRate` 모두 모듈 레벨 `Map`으로 컴포넌트 리마운트 시 재요청 방지

### RSC Streaming 패턴

상세 페이지(`app/[ticker]/page.tsx`)와 홈(`app/page.tsx`)은 `<Suspense>`로 감싸 탭/카드 단위로 스트리밍.
서버에서 계산 완료 후 props로 전달 — 클라이언트는 렌더링만 담당.

```
fetchCloses('5y')  → buildHistory()      → HistoryTable
fetchCloses('5y')  → buildLatestSignal() → SignalCards / PriceBlock
fetchCloses('max') → calcMdd()           → MddTab
```

### 실시간 가격 (useLivePrice)

Pub/Sub + 모듈 레벨 Map 캐시 패턴. 동일 ticker를 여러 컴포넌트가 구독해도 `/api/quote/[ticker]` 요청은 1회. 장중(`REGULAR`)에만 10초 폴링, 장외 시 인터벌 자동 중단.

## 리팩토링 규칙

### React 메모이제이션 (useCallback / useMemo)

`reactCompiler: true` 설정으로 React Compiler가 자동 메모이제이션을 담당한다.

- **원칙: `useCallback` / `useMemo`를 작성하지 않는다.**
- **예외: React Compiler가 다루기 어려운 케이스** (외부 라이브러리에 stable ref 전달, 의존성 추론이 불가한 패턴 등)에 한해 허용한다.
- ⚠️ 예외에 해당한다고 판단될 경우, **구현 완료 전에 반드시 사용자에게 먼저 확인**한다.

### 함수 선언 방식

모든 함수와 컴포넌트는 **arrow function**으로 작성한다.

```ts
// ✅
const MyComponent = ({ title }: Props) => <div>{title}</div>
const calcSomething = (x: number) => x * 2

// ❌
function MyComponent({ title }: Props) { ... }
function calcSomething(x: number) { ... }
```

### 상수 정의 규칙

컴포넌트 내부에 하드코딩 데이터(배열, 객체, Record 등)를 인라인으로 두지 않는다.

- **컴포넌트 함수 외부** 파일 상단에 **`UPPER_SNAKE_CASE`** 로 정의한다
- 단일 컴포넌트 전용이면 같은 파일 상단에 둔다
- 여러 컴포넌트가 공유하는 상수·유틸 함수는 `features/{feature}/lib/` 하위 파일로 이동한다

```ts
// ✅ 파일 상단에 상수 분리
const SOURCE_LABEL: Record<string, string> = {
  yahoo: 'Yahoo',
  fred: 'FRED',
}

const MyComponent = () => <span>{SOURCE_LABEL['yahoo']}</span>

// ❌ 컴포넌트 내부 인라인
const MyComponent = () => {
  const label = { yahoo: 'Yahoo', fred: 'FRED' }
  return <span>{label['yahoo']}</span>
}
```

### 컴포넌트 분리 기준

컴포넌트가 길어지면 **기능 단위 / UI 단위**로 쪼갠다. Tailwind 클래스가 길어져 가독성이 떨어지는 것이 주된 이유.

- **200줄이 넘는 컴포넌트**는 분리를 적극 검토한다
- JSX 블록 하나가 눈에 들어오지 않을 정도로 길면 분리 신호
- 반복되는 UI 패턴은 별도 컴포넌트로 추출
- 분리한 컴포넌트는 같은 디렉토리 내 파일로 배치 (무조건 `shared/ui`로 올리지 않음)
- 자체 상태(state)를 갖는 독립적인 UI 섹션은 별도 컴포넌트로 분리한다

### Tailwind 클래스네임 가독성

- 클래스가 복잡하거나 조건부 조합이 있으면 `cn()`으로 정리한다
- `cn()`으로 정리해도 여전히 길고 복잡하다면, **컴포넌트 크기 자체가 문제**인 경우가 많다 — 분리를 먼저 고민한다
- 단순 나열이 길어지는 것보다, 한 컴포넌트에 역할이 너무 많은 것이 근본 원인인 경우가 대부분이다

### Tailwind CSS — cn() 사용

조건부 클래스 조합과 클래스 충돌 병합은 **`cn()`** 유틸을 사용한다. (`clsx` + `tailwind-merge` 조합)

```ts
import { cn } from '@/shared/lib/cn'

// 조건부
cn('px-4 py-2', isActive && 'bg-blue-500')

// 외부 className 병합
cn('text-sm font-medium', className)

// 클래스 충돌 병합 (tailwind-merge가 처리)
cn('px-4', 'px-6')  // → 'px-6'
```

`cn()` 유틸 위치: `shared/lib/cn.ts`
variant가 많은 공통 컴포넌트(Button 등)로 발전하면 `cva`로 전환 검토.

---

## 주요 컨벤션

### 한국/미국 주식 구분

`shared/lib/ticker.ts`의 `isKoreanTicker(symbol)` 사용 — `.KS`(KOSPI), `.KQ`(KOSDAQ) suffix 여부로 판단.
가격 포맷은 `formatPrice()` / `formatPriceRaw()` 사용 (한국: 원화 정수, 미국: 달러 소수점 2자리).

### 에러 처리

데이터 패칭 실패는 `shared/lib/app-error.ts`의 `AppError`를 throw.
- `SYMBOL_NOT_FOUND` — 존재하지 않는 심볼
- `FETCH_FAILED` — Yahoo Finance 네트워크/서버 오류

### Server Actions

`'use server'` 파일은 `features/{feature}/actions.ts`에 위치.
뮤테이션 후 반드시 `revalidatePath()`로 관련 경로 캐시 무효화.

### Supabase 클라이언트

- 서버 컴포넌트 / Server Action → `shared/lib/supabase/server.ts`의 `createClient()`
- 브라우저 → `shared/lib/supabase/client.ts`

### adjclose 보정 (fetchCloses)

Yahoo Finance OHLC 데이터에 split/배당 조정 계수(`adjClose / rawClose`)를 곱해 전체 OHLC를 정규화. `entities/sigma/api/fetchCloses.ts` 참고.

### 시그마 계산 기준

- Rolling 252일 표준편차(σ) 기반 매매 신호
- 매수: 저가 ≤ `μ - 2σ` 지정가 / 매도: 고가 ≥ `μ + 2σ` 지정가
- 창: `[252, 120, 60, 20]일` (`ROLLING_WINDOWS`)
