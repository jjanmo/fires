type GaugeZone = {
  label: string
  lines: string[]
  min: number
  max: number
  color: string
}

export const GAUGE_ZONES: GaugeZone[] = [
  { label: 'Extreme Fear', lines: ['EXTREME', 'FEAR'], min: 0,  max: 25,  color: '#ef4444' },
  { label: 'Fear',         lines: ['FEAR'],            min: 25, max: 45,  color: '#f97316' },
  { label: 'Neutral',      lines: ['NEUTRAL'],         min: 45, max: 55,  color: '#eab308' },
  { label: 'Greed',        lines: ['GREED'],           min: 55, max: 75,  color: '#84cc16' },
  { label: 'Extreme Greed',lines: ['EXTREME', 'GREED'],min: 75, max: 100, color: '#22c55e' },
]

export const getRating = (score: number | null): { label: string; color: string } => {
  if (score === null) return { label: '—', color: '#94a3b8' }
  const zone = GAUGE_ZONES.find((z) => score >= z.min && score < z.max) ?? GAUGE_ZONES[4]
  return { label: zone.label, color: zone.color }
}

const GAUGE_LAYOUT = {
  CX: 100,
  CY: 108,
  R_OUT: 86,
  R_IN: 60,
  R_LBL: 73,
  R_NUM: 53,
} as const

const GAUGE_BOUNDARIES = [0, 25, 45, 55, 75, 100]

const toRad = (deg: number) => (deg * Math.PI) / 180
const valueToAngle = (v: number) => -180 + (v / 100) * 180

const zonePath = (min: number, max: number): string => {
  const { CX, CY, R_OUT, R_IN } = GAUGE_LAYOUT
  const a1 = toRad(valueToAngle(min))
  const a2 = toRad(valueToAngle(max))
  const large = max - min > 50 ? 1 : 0
  const x1o = CX + R_OUT * Math.cos(a1), y1o = CY + R_OUT * Math.sin(a1)
  const x2o = CX + R_OUT * Math.cos(a2), y2o = CY + R_OUT * Math.sin(a2)
  const x2i = CX + R_IN * Math.cos(a2),  y2i = CY + R_IN * Math.sin(a2)
  const x1i = CX + R_IN * Math.cos(a1),  y1i = CY + R_IN * Math.sin(a1)
  return `M ${x1o} ${y1o} A ${R_OUT} ${R_OUT} 0 ${large} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${R_IN} ${R_IN} 0 ${large} 0 ${x1i} ${y1i} Z`
}

export const GaugeSvg = ({ score }: { score: number | null }) => {
  const { color } = getRating(score)
  const { CX, CY, R_OUT, R_IN, R_LBL, R_NUM } = GAUGE_LAYOUT
  const activeLabel =
    score !== null ? (GAUGE_ZONES.find((z) => score >= z.min && score < z.max) ?? GAUGE_ZONES[4]).label : null

  const pct = score !== null ? Math.max(0, Math.min(100, score)) / 100 : 0
  const needleAngle = toRad(valueToAngle(pct * 100))
  const nx = CX + (R_IN - 4) * Math.cos(needleAngle)
  const ny = CY + (R_IN - 4) * Math.sin(needleAngle)

  return (
    <svg viewBox="0 0 200 120" className="w-full">
      {GAUGE_ZONES.map((zone) => {
        const isActive = zone.label === activeLabel
        return (
          <path
            key={zone.label}
            d={zonePath(zone.min, zone.max)}
            fill={isActive ? zone.color + '55' : zone.color + '1a'}
            stroke={isActive ? zone.color + 'aa' : zone.color + '44'}
            strokeWidth={0.4}
          />
        )
      })}

      {GAUGE_ZONES.map((zone) => {
        const mid = (zone.min + zone.max) / 2
        const angle = valueToAngle(mid)
        const rad = toRad(angle)
        const lx = CX + R_LBL * Math.cos(rad)
        const ly = CY + R_LBL * Math.sin(rad)
        const rotation = angle + 90
        const isActive = zone.label === activeLabel
        // 호 폭에 맞게 폰트 크기 동적 계산
        const arcLen = R_LBL * ((zone.max - zone.min) / 100) * Math.PI
        const maxChars = Math.max(...zone.lines.map((l) => l.length))
        const fontSize = Math.min(5.5, arcLen / (maxChars * 0.72))
        const lineH = fontSize * 1.3

        return (
          <g key={zone.label} transform={`translate(${lx},${ly}) rotate(${rotation})`}>
            {zone.lines.map((line, i) => {
              const offset = (i - (zone.lines.length - 1) / 2) * lineH
              return (
                <text
                  key={line}
                  x={0}
                  y={offset}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fontWeight={isActive ? 'bold' : 'normal'}
                  fill={isActive ? zone.color : '#64748b'}
                >
                  {line}
                </text>
              )
            })}
          </g>
        )
      })}

      {GAUGE_BOUNDARIES.map((v) => {
        const a = toRad(valueToAngle(v))
        const tx1 = CX + R_OUT * Math.cos(a),       ty1 = CY + R_OUT * Math.sin(a)
        const tx2 = CX + (R_OUT - 4) * Math.cos(a), ty2 = CY + (R_OUT - 4) * Math.sin(a)
        const lx  = CX + R_NUM * Math.cos(a),        ly  = CY + R_NUM * Math.sin(a)
        return (
          <g key={v}>
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#475569" strokeWidth={0.8} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={4.5} fill="#64748b">
              {v}
            </text>
          </g>
        )
      })}

      {score !== null && (
        <>
          <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={CX} cy={CY} r={4} fill={color} />
          <circle cx={CX} cy={CY} r={2} fill="#1e293b" />
        </>
      )}
    </svg>
  )
}
