import type { IndicatorId } from '../types'

export type ChartVariant = 'line' | 'area' | 'step' | 'bar-line' | 'gauge'
export type DataSource = 'yahoo' | 'fred' | 'ecos' | 'cnn' | 'calc'

export type RangeOption = {
  label: string
  pointsBack?: number
  clientFetch?: boolean  // true: 이 범위 선택 시 클라이언트에서 Yahoo API 직접 호출
  apiRange?: string      // clientFetch 시 Yahoo API range 파라미터 (e.g. '3y')
  apiInterval?: string   // clientFetch 시 Yahoo API interval 파라미터 (e.g. '1wk')
}

export type SignalThreshold = {
  max: number   // value <= max 이면 이 시그널 적용
  label: string
  color: string
  desc: string
}

export type IndicatorConfig = {
  id: IndicatorId
  title: string
  symbol?: string
  source: DataSource
  chartVariant: ChartVariant
  color: string
  fill: string
  secondaryColor?: string
  secondaryFill?: string
  secondaryId?: IndicatorId
  formatValue: (v: number) => string
  formatSecondary?: (v: number) => string
  changeType: 'pct' | 'pp'
  intervalLabel: string
  refLines?: number[]
  rangeOptions: RangeOption[]
  defaultRange: string
  meaning: string
  upLabel: string
  upEffect: string
  downLabel: string
  downEffect: string
  signals: SignalThreshold[]
}

// value <= threshold.max 인 첫 번째 항목 반환 (오름차순 정렬 가정)
export const getSignal = (
  value: number | null,
  signals: SignalThreshold[],
): SignalThreshold | null => {
  if (value === null || signals.length === 0) return null
  return signals.find((s) => value <= s.max) ?? signals[signals.length - 1]
}

const YAHOO_RANGES: RangeOption[] = [
  { label: '1M', pointsBack: 22  },
  { label: '3M', pointsBack: 66  },
  { label: '1Y', pointsBack: 252 },
  { label: '3Y', clientFetch: true, apiRange: '3y', apiInterval: '1wk' },
]

// yield-spread, kr-us-spread: 서버 1y/1d 데이터 기반 슬라이싱 (3Y 없음)
const CALC_RANGES: RangeOption[] = [
  { label: '3M', pointsBack: 66  },
  { label: '1Y', pointsBack: 252 },
]

const FRED_RANGES: RangeOption[] = [
  { label: '1Y', pointsBack: 252 },
  { label: '3Y', pointsBack: 756 },
  { label: '5Y', pointsBack: 1260 },
]

const ECOS_DAILY_RANGES: RangeOption[] = [
  { label: '1Y', pointsBack: 252 },
  { label: '3Y', pointsBack: 756 },
  { label: '5Y', pointsBack: 1260 },
]

const ECOS_MONTHLY_RANGES: RangeOption[] = [
  { label: '1Y', pointsBack: 12 },
  { label: '3Y', pointsBack: 36 },
  { label: '5Y', pointsBack: 60 },
]

export const INDICATOR_CONFIGS: Record<IndicatorId, IndicatorConfig> = {
  'long-rate': {
    id: 'long-rate',
    title: '미 10년물 금리',
    symbol: '^TNX',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#818cf8',
    fill: 'rgba(129,140,248,0.08)',
    formatValue: (v) => `${v.toFixed(2)}%`,
    changeType: 'pp',
    intervalLabel: '주봉',
    refLines: [4],
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '경기 성장 기대와 인플레이션 심리를 반영하는 장기 금리. 주식·부동산 등 모든 자산의 할인율 기준으로 작동하며, 상승 시 성장주 밸류에이션에 직접적인 부담.',
    upLabel: '금리 상승',
    upEffect: '성장주·부동산 할인율 부담 증가, 달러 강세 압력. 채권 가격 하락.',
    downLabel: '금리 하락',
    downEffect: '성장주 밸류에이션 개선, 달러 약세 유리. 채권 가격 상승.',
    signals: [
      { max: 2.5, label: '저금리 · 완화', color: '#22c55e', desc: '풍부한 유동성. 성장주·위험자산 환경 우호적.' },
      { max: 3.5, label: '정상 구간', color: '#94a3b8', desc: '중립적 금리 환경. 자산별 펀더멘탈 중심 판단.' },
      { max: 4.5, label: '고금리 부담', color: '#fbbf24', desc: '할인율 상승으로 성장주 밸류에이션 압박. 채권 매력 증가.' },
      { max: 5.5, label: '긴축 압력', color: '#f97316', desc: '자금 조달 비용 급등. 기업 이익 감소·신용위험 확대 가능.' },
      { max: Infinity, label: '위기 수준', color: '#ef4444', desc: '금융 시스템 스트레스. 연준 긴급 개입 가능성 고조.' },
    ],
  },
  'short-rate': {
    id: 'short-rate',
    title: '미 단기금리',
    symbol: '^IRX',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#fb923c',
    fill: 'rgba(251,146,60,0.08)',
    formatValue: (v) => `${v.toFixed(2)}%`,
    changeType: 'pp',
    intervalLabel: '주봉',
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '연준 기준금리에 연동된 단기 자금 비용. 장단기 금리차 계산의 핵심 변수로, 수준이 높을수록 기업 단기 차입과 은행 대출에 직접 타격.',
    upLabel: '긴축 강화',
    upEffect: '기업 단기 차입 비용 증가, 소비·투자 수요 위축. 은행 대출 감소.',
    downLabel: '완화 신호',
    downEffect: '자금 조달 비용 완화, 경기 부양 효과. 소비·주택 시장 회복 기대.',
    signals: [
      { max: 1.5, label: '초완화', color: '#22c55e', desc: '제로금리에 가까운 극도의 완화 환경.' },
      { max: 2.5, label: '완화 기조', color: '#86efac', desc: '낮은 자금 비용. 경기 부양 효과 지속.' },
      { max: 3.5, label: '중립 구간', color: '#94a3b8', desc: '연준 중립금리 부근. 긴축도 완화도 아닌 상태.' },
      { max: 4.5, label: '긴축', color: '#fbbf24', desc: '고금리로 소비·투자 수요 억제 의도.' },
      { max: Infinity, label: '강긴축', color: '#f97316', desc: '경기 급랭 위험. 침체 선행 신호일 수 있음.' },
    ],
  },
  'yield-spread': {
    id: 'yield-spread',
    title: '장단기 금리차',
    symbol: '^TNX-^IRX',
    source: 'calc',
    chartVariant: 'area',
    color: '#22d3ee',
    fill: 'rgba(34,211,238,0.12)',
    formatValue: (v) => `${v.toFixed(2)}%p`,
    changeType: 'pp',
    intervalLabel: '주봉',
    refLines: [0],
    rangeOptions: CALC_RANGES,
    defaultRange: '1Y',
    meaning:
      '10년물에서 단기금리를 뺀 값. 역전(음수) 상태가 12개월 이상 지속될 경우 역사적으로 경기침체를 예고한 선행 지표. 다만 침체까지 시차가 있어 맹신은 금물.',
    upLabel: '곡선 정상화',
    upEffect: '경기 회복 기대 신호, 은행 수익성 개선. 장기 성장 전망 긍정적.',
    downLabel: '역전 심화',
    downEffect: '침체 선행 신호, 은행 마진 압박. 12~18개월 후 침체 가능성 상승.',
    signals: [
      { max: -0.75, label: '심한 역전 · 경계', color: '#ef4444', desc: '강한 침체 선행 신호. 과거 12~18개월 후 침체 발생 패턴.' },
      { max: 0, label: '역전 · 주의', color: '#f97316', desc: '단기금리가 장기금리를 상회. 시장이 경기 둔화를 예상.' },
      { max: 0.75, label: '회복 중', color: '#fbbf24', desc: '역전 해소 과정. 완전 정상화까지 시간 필요.' },
      { max: 1.5, label: '정상', color: '#94a3b8', desc: '장기 금리가 단기 금리보다 높은 정상적 구조.' },
      { max: Infinity, label: '안정 · 완화', color: '#22c55e', desc: '가파른 우상향 수익률 곡선. 경기 확장 기대 반영.' },
    ],
  },
  'hy-spread': {
    id: 'hy-spread',
    title: '하이일드 스프레드',
    symbol: 'BAMLH0A0HYM2',
    source: 'fred',
    chartVariant: 'line',
    color: '#f87171',
    fill: 'rgba(248,113,113,0.08)',
    formatValue: (v) => `${v.toFixed(2)}%`,
    changeType: 'pp',
    intervalLabel: '일봉',
    refLines: [5, 10],
    rangeOptions: FRED_RANGES,
    defaultRange: '1Y',
    meaning:
      '정크 등급(하이일드) 채권과 미 국채의 금리 차이. 기업 신용위험과 시장 공포의 실시간 온도계. 스프레드가 벌어질수록 투자자들이 디폴트 위험을 높게 평가한다는 의미.',
    upLabel: '신용 리스크 확대',
    upEffect: '기업 자금 조달 어려움, 위험자산 회피 심리 확산. 주식 변동성 증가.',
    downLabel: '신용 안정',
    downEffect: '기업 차입 환경 개선, 위험자산 선호 복귀. 경기 회복 기대 반영.',
    signals: [
      { max: 3.5, label: '안정 · 타이트', color: '#22c55e', desc: '신용시장 안정. 기업 부채 부담 낮음. 위험 자산 선호 환경.' },
      { max: 5.5, label: '주의', color: '#fbbf24', desc: '스프레드 확대 조짐. 신용 환경 악화 가능성 주시 필요.' },
      { max: 8.0, label: '위험 확대', color: '#f97316', desc: '신용시장 스트레스. 기업 자금 조달 어려움 시작.' },
      { max: Infinity, label: '위기 · 패닉', color: '#ef4444', desc: '금융위기 수준. 유동성 경색 및 연쇄 디폴트 우려.' },
    ],
  },
  dxy: {
    id: 'dxy',
    title: '달러인덱스 DXY',
    symbol: 'DX-Y.NYB',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#38bdf8',
    fill: 'rgba(56,189,248,0.08)',
    formatValue: (v) => v.toFixed(2),
    changeType: 'pct',
    intervalLabel: '주봉',
    refLines: [100],
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '유로·엔·파운드 등 6개 주요 통화 대비 달러 가치를 종합 지수화. 상승(강달러)이면 신흥국 자금 이탈과 원자재 가격 하락 압력. 100이 심리적 기준선.',
    upLabel: '달러 강세',
    upEffect: '신흥국 통화 약세, 원자재 가격 하락 압력. 한국 외국인 자금 이탈 우려.',
    downLabel: '달러 약세',
    downEffect: '신흥국·원자재·금 수혜, 글로벌 유동성 확대. 한국 주식 외국인 유입 기대.',
    signals: [
      { max: 95, label: '달러 약세', color: '#22c55e', desc: '글로벌 유동성 풍부. 신흥국·원자재·금에 우호적.' },
      { max: 100, label: '중립', color: '#94a3b8', desc: '달러 기준선 부근. 방향성 판단이 중요한 구간.' },
      { max: 105, label: '강달러 · 주의', color: '#fbbf24', desc: '신흥국 통화 약세 압박. 원자재 수요 위축 가능.' },
      { max: Infinity, label: '과도한 강달러', color: '#f97316', desc: '글로벌 달러 부족. 신흥국 외채 부담 급증 위험.' },
    ],
  },
  krw: {
    id: 'krw',
    title: '원달러 환율',
    symbol: 'KRW=X',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#67e8f9',
    fill: 'rgba(103,232,249,0.08)',
    formatValue: (v) => `${Math.round(v).toLocaleString('ko-KR')}원`,
    changeType: 'pct',
    intervalLabel: '주봉',
    refLines: [1350, 1400],
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '달러 대비 원화 가치. 높을수록 원화 약세로 수입 물가 상승·외국인 자금 이탈과 연동. 수출 기업에는 단기 호재이나 인플레이션 유발 부작용.',
    upLabel: '원화 약세',
    upEffect: '수입물가 상승, 외국인 자금 이탈 압력. 수출 기업 일시 수혜.',
    downLabel: '원화 강세',
    downEffect: '수입물가 안정, 외국인 자금 유입 우호. 소비재·내수 기업 유리.',
    signals: [
      { max: 1280, label: '원화 강세', color: '#22c55e', desc: '외국인 자금 유입 우호적. 수입 물가 안정.' },
      { max: 1360, label: '보통', color: '#94a3b8', desc: '중립적 환율 구간. 경상수지·자금 흐름 모니터링.' },
      { max: 1420, label: '약세 · 주의', color: '#fbbf24', desc: '수입 물가 부담 증가. 한국은행 개입 가능성.' },
      { max: 1480, label: '위험', color: '#f97316', desc: '외환시장 불안. 인플레이션·신용등급 하방 압력.' },
      { max: Infinity, label: '위기 수준', color: '#ef4444', desc: '외환위기 경계. 외환보유액 소진 및 긴급 조치 우려.' },
    ],
  },
  'kr-us-spread': {
    id: 'kr-us-spread',
    title: '한미 금리차',
    symbol: '^TNX-KR10Y',
    source: 'calc',
    chartVariant: 'line',
    color: '#818cf8',
    fill: 'rgba(129,140,248,0.08)',
    formatValue: (v) => `${v.toFixed(2)}%p`,
    changeType: 'pp',
    intervalLabel: '주봉',
    refLines: [0],
    rangeOptions: CALC_RANGES,
    defaultRange: '1Y',
    meaning:
      '미 10년물에서 국고채 10년물을 뺀 값. 플러스(미국 > 한국)가 깊어질수록 외국인 채권 매도 · 달러 자금 이탈 압력 증가. 한국 통화정책의 제약 요인.',
    upLabel: '미국 금리 우위 확대',
    upEffect: '외국인 채권 매도 압력 증가, 원화 약세 연동. 한은 금리 인하 제약.',
    downLabel: '한국 금리 프리미엄',
    downEffect: '외국인 채권 유입 우호, 원화 강세 지지. 한은 정책 유연성 확대.',
    signals: [
      { max: 0,        label: '한국 금리 우위', color: '#22c55e', desc: '한국 금리가 높아 외국인 채권 유입 우호. 원화 강세 지지.' },
      { max: 1.0,      label: '중립',           color: '#94a3b8', desc: '금리차 크지 않아 자금 방향성 혼재.' },
      { max: 2.0,      label: '미국 우위 · 주의', color: '#fbbf24', desc: '미국 금리가 한국보다 높아 자금 이탈 압력 존재.' },
      { max: Infinity, label: '역전 심화 · 위험', color: '#ef4444', desc: '미국 금리 우위 크게 확대. 원화 약세·외국인 채권 매도 압력 강함.' },
    ],
  },
  jpy: {
    id: 'jpy',
    title: '달러/엔 환율',
    symbol: 'JPY=X',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#fbbf24',
    fill: 'rgba(251,191,36,0.08)',
    formatValue: (v) => `¥${v.toFixed(2)}`,
    changeType: 'pct',
    intervalLabel: '주봉',
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '달러 대비 엔화 환율. 높을수록 엔 약세. 엔 약세가 과도해지면 글로벌 캐리 트레이드(엔화 빌려 고수익 자산 투자) 청산 우려로 전 세계 시장 변동성 확대 가능.',
    upLabel: '엔 약세',
    upEffect: '캐리 트레이드 활성화, 급격한 청산 시 글로벌 변동성 급등 위험.',
    downLabel: '엔 강세',
    downEffect: '안전자산 선호 또는 BOJ 긴축 기대. 캐리 청산 위험 감소, 시장 안정.',
    signals: [
      { max: 130, label: '엔 강세', color: '#22c55e', desc: '안전자산 선호 또는 일본은행 긴축 기대 반영.' },
      { max: 145, label: '중립', color: '#94a3b8', desc: '과거 레인지 상단 부근. 방향성 주시.' },
      { max: 155, label: '엔 약세 · 주의', color: '#fbbf24', desc: '캐리 트레이드 활성화. 청산 시 글로벌 변동성 리스크.' },
      { max: 160, label: '위험', color: '#f97316', desc: '일본 정부·BOJ 개입 가능성. 급격한 반전 주의.' },
      { max: Infinity, label: '개입 임박', color: '#ef4444', desc: '사상 최저 수준의 엔 약세. 급격한 엔 강세 반전 위험.' },
    ],
  },
  sp500: {
    id: 'sp500',
    title: 'S&P 500',
    symbol: '^GSPC',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#34d399',
    fill: 'rgba(52,211,153,0.08)',
    formatValue: (v) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    changeType: 'pct',
    intervalLabel: '주봉',
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '미국 500대 대형주 시가총액 가중 지수. 글로벌 위험자산 투자 심리의 기준점이자 연준 정책 반응의 척도. "연준 풋(Fed Put)" 논의의 핵심 지수.',
    upLabel: '상승 추세',
    upEffect: '위험자산 선호 확산, 글로벌 자금 유입. 소비심리 개선 및 기업 이익 확대.',
    downLabel: '하락·조정',
    downEffect: '위험 회피 심리 확산, 신흥국 자금 이탈. 경기 침체 우려 반영 시작.',
    signals: [
      { max: 4000, label: '약세장', color: '#ef4444', desc: '고점 대비 20% 이상 하락. 경기 침체 우려 반영 구간.' },
      { max: 4800, label: '조정 · 주의', color: '#fbbf24', desc: '단기 조정 구간. 지지선·매크로 변수 확인 필요.' },
      { max: 5800, label: '강세', color: '#22c55e', desc: '추세적 상승 구간. 기업 이익 성장 지속 여부 모니터링.' },
      { max: Infinity, label: '과열 주의', color: '#fbbf24', desc: '밸류에이션 부담 구간. 차익 실현 압력 고조 가능.' },
    ],
  },
  nasdaq: {
    id: 'nasdaq',
    title: '나스닥',
    symbol: '^IXIC',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#6ee7b7',
    fill: 'rgba(110,231,183,0.08)',
    formatValue: (v) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    changeType: 'pct',
    intervalLabel: '주봉',
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '기술주 중심의 미국 종합 지수. 금리에 특히 민감한 성장주 비중이 높아 금리 상승 시 S&P 500보다 큰 폭 조정. AI·반도체 사이클의 바로미터.',
    upLabel: '기술주 강세',
    upEffect: 'AI·반도체 모멘텀 확인, 성장주 선호 환경. 국내 반도체·IT 동반 상승 기대.',
    downLabel: '기술주 약세',
    downEffect: '금리 민감 성장주 밸류에이션 재평가. 국내 IT·성장주에 동반 하락 압력.',
    signals: [
      { max: 13000, label: '약세장', color: '#ef4444', desc: '기술주 가치 급락. 금리 또는 실적 쇼크 가능성.' },
      { max: 17000, label: '조정 · 주의', color: '#fbbf24', desc: '단기 조정 구간. 성장주 밸류에이션 재평가 필요.' },
      { max: 21000, label: '강세', color: '#22c55e', desc: '기술주 주도 상승 지속. AI·빅테크 이익 확인 중요.' },
      { max: Infinity, label: '과열 주의', color: '#fbbf24', desc: 'PER 부담 구간. 실적 미스 시 급락 변동성 주의.' },
    ],
  },
  kospi: {
    id: 'kospi',
    title: '코스피',
    symbol: '^KS11',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#4ade80',
    fill: 'rgba(74,222,128,0.08)',
    formatValue: (v) => v.toLocaleString('ko-KR', { maximumFractionDigits: 0 }),
    changeType: 'pct',
    intervalLabel: '주봉',
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '한국 대형주 중심 종합지수. 수출 경기와 외국인 수급에 민감. 원달러 환율·반도체 사이클·중국 경기의 영향을 동시에 받는 복합 지수.',
    upLabel: '외국인 순매수',
    upEffect: '원화 강세 동반, 반도체·수출 모멘텀 확인. 국내 경기 회복 기대 반영.',
    downLabel: '외국인 순매도',
    downEffect: '원화 약세 연동, 수급 공백. 글로벌 경기 둔화 또는 달러 강세 반영.',
    signals: [
      { max: 2000, label: '약세장', color: '#ef4444', desc: '글로벌 경기 둔화 또는 외국인 매도 집중 구간.' },
      { max: 2400, label: '조정 · 주의', color: '#fbbf24', desc: '박스권 하단. 수급·펀더멘탈 개선 여부 확인 필요.' },
      { max: 2800, label: '정상 강세', color: '#22c55e', desc: '추세적 상승. 외국인 수급·반도체 사이클 체크.' },
      { max: Infinity, label: '과열 경계', color: '#fbbf24', desc: '밸류에이션 상단. 차익 실현 매물 소화 필요.' },
    ],
  },
  kosdaq: {
    id: 'kosdaq',
    title: '코스닥',
    symbol: '^KQ11',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#86efac',
    fill: 'rgba(134,239,172,0.08)',
    formatValue: (v) => v.toLocaleString('ko-KR', { maximumFractionDigits: 0 }),
    changeType: 'pct',
    intervalLabel: '주봉',
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '국내 중소·성장주 중심 지수. 코스피보다 변동성이 크고 개인 수급 비중이 높음. 금리 민감도가 높아 인하 사이클 초입에 강한 반응.',
    upLabel: '성장주 강세',
    upEffect: '금리 인하 기대 또는 테마 모멘텀 주도. 개인 수급 유입 확대.',
    downLabel: '성장주 약세',
    downEffect: '금리 부담 또는 투자 심리 위축. 변동성 확대 구간 진입.',
    signals: [
      { max: 600, label: '약세장', color: '#ef4444', desc: '성장주 투자 심리 극도 위축. 유동성 경색 반영 가능.' },
      { max: 780, label: '조정 · 주의', color: '#fbbf24', desc: '과거 바닥권 부근. 저점 매수 타이밍 탐색 구간.' },
      { max: 1000, label: '정상 강세', color: '#22c55e', desc: '성장주 선호 환경. 금리 방향·테마 모멘텀 확인.' },
      { max: Infinity, label: '과열 경계', color: '#fbbf24', desc: '투기적 테마 과열 가능성. 실적 기반 종목 선별 중요.' },
    ],
  },
  vix: {
    id: 'vix',
    title: 'VIX 공포지수',
    symbol: '^VIX',
    source: 'yahoo',
    chartVariant: 'area',
    color: '#f87171',
    fill: 'rgba(248,113,113,0.12)',
    formatValue: (v) => v.toFixed(2),
    changeType: 'pct',
    intervalLabel: '주봉',
    refLines: [20, 30, 40],
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      'S&P 500 옵션 가격에서 산출한 30일 내재 변동성. "공포지수"로 불리며 역발상 매매에 활용. 급등 시 단기 공포 극점 신호로 해석하기도 함.',
    upLabel: '변동성 확대',
    upEffect: '시장 불안 고조, 헤지 수요 급증. 위험자산 전반 가격 하락 압력.',
    downLabel: '변동성 안정',
    downEffect: '시장 안정, 위험자산 선호 환경 형성. 레버리지 전략 유입 가능.',
    signals: [
      { max: 15, label: '과도한 낙관', color: '#fbbf24', desc: '시장 방심 구간. 역설적으로 조정 취약성 높아짐.' },
      { max: 20, label: '안정', color: '#22c55e', desc: '정상 변동성 범위. 위험자산 선호 환경.' },
      { max: 30, label: '주의', color: '#fbbf24', desc: '불확실성 증가. 헤지 수요 확대, 변동성 구간 진입.' },
      { max: 40, label: '위험 · 공포', color: '#f97316', desc: '시장 패닉 수준. 역발상 매수 관점 고려 시작.' },
      { max: Infinity, label: '극도 패닉', color: '#ef4444', desc: '금융위기 수준 변동성. 단기 과매도 역발상 기회.' },
    ],
  },
  'fear-greed': {
    id: 'fear-greed',
    title: '공포탐욕지수',
    symbol: 'CNN',
    source: 'cnn',
    chartVariant: 'gauge',
    color: '#f97316',
    fill: 'rgba(249,115,22,0.08)',
    formatValue: (v) => Math.round(v).toString(),
    changeType: 'pct',
    intervalLabel: '일봉',
    rangeOptions: [],
    defaultRange: '',
    meaning:
      'CNN이 산출하는 투자자 심리 종합 지수 (0~100). 모멘텀·강도·옵션 등 7개 지표 합산. 0에 가까울수록 극도의 공포, 100에 가까울수록 극도의 탐욕.',
    upLabel: '탐욕 증가',
    upEffect: '시장 과열 주의, 단기 조정 취약성 증가. 추격 매수보다 차익 실현 고려.',
    downLabel: '공포 증가',
    downEffect: '역발상 매수 기회 탐색 구간. 극점 근접 시 중장기 매수 진입 고려.',
    signals: [
      { max: 25, label: 'Extreme Fear', color: '#ef4444', desc: '투자자 공포 극점. 역발상 매수 기회로 해석 가능.' },
      { max: 45, label: 'Fear', color: '#f97316', desc: '시장 불안 우세. 리스크 회피 심리 확산.' },
      { max: 55, label: 'Neutral', color: '#94a3b8', desc: '중립적 심리. 방향성 모색 구간.' },
      { max: 75, label: 'Greed', color: '#86efac', desc: '낙관 심리 우세. 추격 매수 위험 점진적 증가.' },
      { max: Infinity, label: 'Extreme Greed', color: '#fbbf24', desc: '시장 과열. 단기 조정 취약성 높아진 상태.' },
    ],
  },
  oil: {
    id: 'oil',
    title: 'WTI 유가',
    symbol: 'CL=F',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#fb923c',
    fill: 'rgba(251,146,60,0.08)',
    formatValue: (v) => `$${v.toFixed(1)}`,
    changeType: 'pct',
    intervalLabel: '주봉',
    refLines: [60, 85],
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      'WTI 원유 선물 가격. 글로벌 경기·지정학 리스크·OPEC 정책의 복합 지표. 상승 시 수입국 인플레이션 및 기업 비용 부담 확대.',
    upLabel: '유가 상승',
    upEffect: '수입국 인플레이션 부담, 항공·운수·화학 비용 증가. 금리 인하 지연 압력.',
    downLabel: '유가 하락',
    downEffect: '에너지 수입국 물가 완화, 소비 여력 개선. 금리 인하 여건 강화.',
    signals: [
      { max: 50, label: '저유가 · 경기 우려', color: '#f97316', desc: '수요 급감 또는 공급 과잉. 경기 침체 반영 가능.' },
      { max: 70, label: '적정 구간', color: '#22c55e', desc: '산유국·소비국 모두 수용 가능한 균형 가격대.' },
      { max: 85, label: '인플레 주의', color: '#fbbf24', desc: '운송·제조 비용 증가. 소비자 물가 상방 압력.' },
      { max: 100, label: '위험', color: '#f97316', desc: '에너지 인플레이션 심화. 경기 스태그플레이션 리스크.' },
      { max: Infinity, label: '에너지 위기', color: '#ef4444', desc: '지정학 또는 공급 충격. 긴급 비축유 방출 논의 가능.' },
    ],
  },
  gold: {
    id: 'gold',
    title: '금 선물',
    symbol: 'GC=F',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#fbbf24',
    fill: 'rgba(251,191,36,0.08)',
    formatValue: (v) => `$${Math.round(v).toLocaleString('en-US')}`,
    changeType: 'pct',
    intervalLabel: '주봉',
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '금 선물 가격. 지정학 리스크·달러 약세·인플레이션 헤지·중앙은행 매수 수요를 동시에 반영. 급등 시 시장 불확실성 고조 신호로 해석.',
    upLabel: '금 강세',
    upEffect: '불확실성 고조, 달러 약세 또는 인플레 헤지 수요 확대. 안전자산 선호 환경.',
    downLabel: '금 약세',
    downEffect: '위험자산 선호 환경 복귀, 달러 강세 또는 실질금리 상승 반영.',
    signals: [
      { max: 1800, label: '안정 · 저수요', color: '#94a3b8', desc: '낮은 불확실성. 위험자산 선호 환경.' },
      { max: 2300, label: '헤지 수요 증가', color: '#fbbf24', desc: '지정학·인플레이션 우려 반영. 안전자산 선호 전환.' },
      { max: 3000, label: '불확실성 고조', color: '#f97316', desc: '강한 헤지 수요. 달러 약세·경기 불안 복합 반영.' },
      { max: Infinity, label: '위기 과열', color: '#ef4444', desc: '극도의 위험 회피. 금융·지정학 위기 반영 가능성.' },
    ],
  },
  copper: {
    id: 'copper',
    title: '구리 선물',
    symbol: 'HG=F',
    source: 'yahoo',
    chartVariant: 'line',
    color: '#f97316',
    fill: 'rgba(249,115,22,0.08)',
    formatValue: (v) => `$${v.toFixed(3)}`,
    changeType: 'pct',
    intervalLabel: '주봉',
    rangeOptions: YAHOO_RANGES,
    defaultRange: '1Y',
    meaning:
      '산업 전반에 필수적으로 사용되어 "닥터 코퍼"로 불림. 제조업·건설·전기차 수요를 선행 반영. 상승 = 경기 회복 기대, 하락 = 경기 둔화 신호.',
    upLabel: '경기 회복 기대',
    upEffect: '제조업·인프라 수요 확인, 산업재·소재 업종 수혜. 글로벌 성장 기대 반영.',
    downLabel: '경기 둔화 신호',
    downEffect: '제조업 수요 감소, 원자재 관련주 압박. 글로벌 성장 둔화 선행 지표.',
    signals: [
      { max: 3.5, label: '경기 둔화 신호', color: '#ef4444', desc: '제조업 수요 감소. 글로벌 경기 위축 반영.' },
      { max: 4.0, label: '주의', color: '#fbbf24', desc: '수요 회복이 불분명한 구간. 추가 하락 가능.' },
      { max: 5.0, label: '정상 · 회복 기대', color: '#94a3b8', desc: '제조업 및 인프라 수요 안정. 경기 회복 초입.' },
      { max: Infinity, label: '경기 과열 기대', color: '#22c55e', desc: '강한 산업 수요. 인프라·전기차 사이클 주도.' },
    ],
  },
  'kr-cpi': {
    id: 'kr-cpi',
    title: '국내 CPI',
    symbol: '901Y009',
    source: 'ecos',
    chartVariant: 'bar-line',
    color: '#fb7185',
    fill: 'rgba(251,113,133,0.3)',
    formatValue: (v) => `${v.toFixed(1)}%`,
    changeType: 'pp',
    intervalLabel: '월봉',
    refLines: [2],
    rangeOptions: ECOS_MONTHLY_RANGES,
    defaultRange: '1Y',
    meaning:
      '한국 소비자물가 전년 동월 대비 상승률. 한국은행 물가 목표(2%)의 기준 지표. 높으면 금리 인상 압력, 낮으면 금리 인하 여건이 형성됨.',
    upLabel: '물가 상승',
    upEffect: '금리 인하 지연 압력, 실질 구매력 하락. 한은 긴축 기조 유지 가능성.',
    downLabel: '물가 하락',
    downEffect: '금리 인하 여건 강화, 채권 가격 상승. 소비자 실질 소득 개선.',
    signals: [
      { max: 0, label: '디플레이션', color: '#f97316', desc: '물가 하락. 소비 지연·경기 침체 악순환 위험.' },
      { max: 1.5, label: '저인플레', color: '#94a3b8', desc: '목표 하회. 경기 부양 여지 있으나 수요 위축 우려.' },
      { max: 2.5, label: '목표 달성 · 안정', color: '#22c55e', desc: '2% 목표 부근. 한국은행 정책 유연성 최대.' },
      { max: 4.0, label: '인플레 주의', color: '#fbbf24', desc: '목표 크게 초과. 금리 인상 또는 인하 지연 압력.' },
      { max: Infinity, label: '고인플레 위험', color: '#ef4444', desc: '실질 구매력 하락. 긴급 긴축 조치 가능성.' },
    ],
  },
  'kr-rate': {
    id: 'kr-rate',
    title: '한국 기준금리',
    symbol: '722Y001',
    source: 'ecos',
    chartVariant: 'step',
    color: '#60a5fa',
    fill: 'rgba(96,165,250,0.08)',
    formatValue: (v) => `${v.toFixed(2)}%`,
    changeType: 'pp',
    intervalLabel: '일봉',
    rangeOptions: ECOS_DAILY_RANGES,
    defaultRange: '1Y',
    meaning:
      '한국은행 금융통화위원회가 결정하는 기준금리. 국내 대출금리·채권 수익률·가계 부담의 직접 기준. 인상 시 소비·투자 위축, 인하 시 경기 부양 효과.',
    upLabel: '금리 인상',
    upEffect: '가계·기업 이자 부담 증가, 부동산 냉각. 인플레 억제 의도.',
    downLabel: '금리 인하',
    downEffect: '소비·투자 부양, 부동산·성장주 수혜. 원화 약세 압력 동반 가능.',
    signals: [
      { max: 1.0, label: '초완화 · 비상', color: '#f97316', desc: '제로금리 수준. 경기 위기 대응 또는 디플레이션 방어.' },
      { max: 2.0, label: '완화 기조', color: '#22c55e', desc: '경기 부양 의도. 가계·기업 자금 조달 부담 낮음.' },
      { max: 3.0, label: '중립', color: '#94a3b8', desc: '중립금리 부근. 방향성 전환 시기 탐색 구간.' },
      { max: 4.0, label: '긴축', color: '#fbbf24', desc: '물가 억제 의도. 부동산·가계부채 부담 증가.' },
      { max: Infinity, label: '강긴축', color: '#f97316', desc: '고강도 긴축. 경기 냉각·신용 리스크 확대 우려.' },
    ],
  },
  'kr-bond': {
    id: 'kr-bond',
    title: '국고채 10년물',
    symbol: '721Y001',
    source: 'ecos',
    chartVariant: 'line',
    color: '#818cf8',
    fill: 'rgba(129,140,248,0.08)',
    formatValue: (v) => `${v.toFixed(2)}%`,
    changeType: 'pp',
    intervalLabel: '일봉',
    rangeOptions: ECOS_DAILY_RANGES,
    defaultRange: '1Y',
    meaning:
      '국내 장기 할인율의 기준. 미국 국채와의 스프레드를 통해 외국인 채권 자금 방향을 판단. 상승 시 주식 할인율 부담, 하락 시 성장주에 우호적.',
    upLabel: '국채금리 상승',
    upEffect: '주식 할인율 부담 증가, 채권 가격 하락. 외국인 채권 유입 가능성.',
    downLabel: '국채금리 하락',
    downEffect: '성장주 밸류에이션 개선, 채권 가격 상승. 경기 둔화 또는 금리 인하 기대 반영.',
    signals: [
      { max: 2.0, label: '저금리 · 완화', color: '#22c55e', desc: '성장주·부동산에 우호적 환경. 채권 매력 낮음.' },
      { max: 3.0, label: '정상', color: '#94a3b8', desc: '중립적 금리 수준. 자산 배분 판단 기준.' },
      { max: 4.0, label: '고금리 · 주의', color: '#fbbf24', desc: '할인율 부담 증가. 성장주 밸류에이션 압박.' },
      { max: Infinity, label: '위험 수준', color: '#f97316', desc: '외국인 자금 이탈 우려. 원화 약세 연동 가능.' },
    ],
  },
}
