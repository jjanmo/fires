import type { IndicatorId } from '../types'

export type GroupId =
  | 'liquidity'
  | 'fx'
  | 'equity'
  | 'sentiment'
  | 'commodity'
  | 'kr-economy'

export type GroupConfig = {
  id: GroupId
  title: string
  subtitle: string
  color: string
  indicators: IndicatorId[]
  suite?: IndicatorId[]
}

export const GROUPS: GroupConfig[] = [
  {
    id: 'liquidity',
    title: '유동성 & 금리',
    subtitle: '시장의 산소 — 이게 막히면 모든 자산이 하락',
    color: '#818cf8',
    indicators: ['long-rate', 'short-rate', 'yield-spread', 'hy-spread'],
    suite: ['long-rate', 'short-rate', 'yield-spread'],
  },
  {
    id: 'fx',
    title: '달러 & 환율',
    subtitle: '글로벌 자금 방향 — 달러 강세면 한국이 힘들다',
    color: '#38bdf8',
    indicators: ['dxy', 'krw', 'kr-us-spread', 'jpy'],
  },
  {
    id: 'equity',
    title: '글로벌 & 국내 증시',
    subtitle: '시장 체온 — 글로벌과 국내를 나란히',
    color: '#34d399',
    indicators: ['sp500', 'nasdaq', 'kospi', 'kosdaq'],
  },
  {
    id: 'sentiment',
    title: '심리 & 변동성',
    subtitle: '역발상 매매 — 공포가 클수록 기회',
    color: '#f87171',
    indicators: ['vix', 'fear-greed'],
  },
  {
    id: 'commodity',
    title: '원자재 & 인플레',
    subtitle: '금리 방향을 결정하는 변수',
    color: '#fbbf24',
    indicators: ['oil', 'gold', 'copper', 'kr-cpi'],
  },
  {
    id: 'kr-economy',
    title: '국내 경기',
    subtitle: '글로벌 충격이 국내로 전달되는 속도와 크기',
    color: '#fb923c',
    indicators: ['kr-rate', 'kr-bond'],
  },
]
