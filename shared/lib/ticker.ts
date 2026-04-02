/**
 * 티커 심볼 기반 시장 판별 및 가격 포맷팅 유틸리티
 */

/** 한국 거래소 티커인지 판별 (.KS = KOSPI, .KQ = KOSDAQ) */
export function isKoreanTicker(symbol: string): boolean {
  const upper = symbol.toUpperCase()
  return upper.endsWith('.KS') || upper.endsWith('.KQ')
}

/** 시장에 맞는 통화 기호 반환 */
export function currencySymbol(symbol: string): string {
  return isKoreanTicker(symbol) ? '₩' : '$'
}

/**
 * 시장에 맞게 가격을 포맷팅
 * - 국내주식: ₩68,400 (정수, 천 단위 콤마)
 * - 해외주식: $123.45 (소수점 2자리)
 */
export function formatPrice(price: number, symbol: string): string {
  if (isKoreanTicker(symbol)) {
    return `₩${Math.round(price).toLocaleString('ko-KR')}`
  }
  return `$${price.toFixed(2)}`
}

/** 통화 기호 없이 가격만 포맷팅 */
export function formatPriceRaw(price: number, symbol: string): string {
  if (isKoreanTicker(symbol)) {
    return Math.round(price).toLocaleString('ko-KR')
  }
  return price.toFixed(2)
}

/** 변동 금액 포맷팅 (부호 포함) */
export function formatChange(change: number, symbol: string): string {
  const sign = change >= 0 ? '+' : ''
  if (isKoreanTicker(symbol)) {
    return `${sign}₩${Math.round(change).toLocaleString('ko-KR')}`
  }
  return `${sign}$${change.toFixed(2)}`
}

/**
 * 현재 시각이 한국 거래소 정규장 시간인지 판단 (평일 09:00~15:30 KST)
 */
export function isKrxMarketHours(): boolean {
  const now = new Date()

  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    weekday: 'short',
  }).format(now)
  if (weekday === 'Sun' || weekday === 'Sat') return false

  const timeKST = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).format(now)

  const [h, m] = timeKST.split(':').map(Number)
  const minutes = h * 60 + m

  // 09:00 ~ 15:30 KST
  return minutes >= 9 * 60 && minutes < 15 * 60 + 30
}
