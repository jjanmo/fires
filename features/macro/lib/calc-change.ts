export const calcChange = (cur: number | null, prev: number | null, type: 'pct' | 'pp'): number | null => {
  if (cur === null || prev === null) return null
  if (type === 'pp') return +(cur - prev).toFixed(3)
  if (prev === 0) return null
  return +(((cur - prev) / prev) * 100).toFixed(2)
}
