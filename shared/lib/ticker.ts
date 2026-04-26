/** 한국 거래소 티커인지 판별 (.KS = KOSPI, .KQ = KOSDAQ) */
export const isKoreanTicker = (symbol: string): boolean => {
  const upper = symbol.toUpperCase()
  return upper.endsWith('.KS') || upper.endsWith('.KQ')
}

/** 시장에 맞는 통화 기호 반환 */
export const currencySymbol = (symbol: string): string =>
  isKoreanTicker(symbol) ? '₩' : '$'

/** 시장에 맞게 가격을 포맷팅 */
export const formatPrice = (price: number, symbol: string): string => {
  if (isKoreanTicker(symbol)) {
    return `₩${Math.round(price).toLocaleString('ko-KR')}`
  }
  return `$${price.toFixed(2)}`
}

/** 통화 기호 없이 가격만 포맷팅 */
export const formatPriceRaw = (price: number, symbol: string): string => {
  if (isKoreanTicker(symbol)) {
    return Math.round(price).toLocaleString('ko-KR')
  }
  return price.toFixed(2)
}

/** 변동 금액 포맷팅 (부호 포함) */
export const formatChange = (change: number, symbol: string): string => {
  const sign = change >= 0 ? '+' : ''
  if (isKoreanTicker(symbol)) {
    return `${sign}₩${Math.round(change).toLocaleString('ko-KR')}`
  }
  return `${sign}$${change.toFixed(2)}`
}

/** 현재 시각이 NYSE 정규장 시간인지 판단 (평일 09:30~16:00 ET) */
export const isNyseMarketHours = (): boolean => {
  const now = new Date()

  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
  }).format(now)
  if (weekday === 'Sun' || weekday === 'Sat') return false

  const timeET = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).format(now)

  const [h, m] = timeET.split(':').map(Number)
  const minutes = h * 60 + m

  return minutes >= 9 * 60 + 30 && minutes < 16 * 60
}

/** 현재 시각이 한국 거래소 정규장 시간인지 판단 (평일 09:00~15:30 KST) */
export const isKrxMarketHours = (): boolean => {
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
