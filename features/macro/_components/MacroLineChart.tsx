'use client'

import 'chartjs-adapter-date-fns'
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  type Plugin,
  type ChartDataset,
  type TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useEffect, useState } from 'react'
import type { ChartPoint } from '../types'

ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

// Chart.js 시계열 데이터 포인트: x는 ISO 날짜 문자열 (time scale이 파싱)
type TimePoint = { x: string; y: number }
type LineDs = ChartDataset<'line', TimePoint[]>

const crosshairPlugin: Plugin = {
  id: 'crosshair',
  afterDraw(chart) {
    const active = chart.tooltip?.getActiveElements()
    if (!active?.length) return
    const ctx = chart.ctx
    const x = active[0].element.x
    const { top, bottom } = chart.scales.y
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, bottom)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(148,163,184,0.5)'
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.restore()
  },
}

type SecondaryData = {
  points: ChartPoint[]
  color: string
  fill: string
  label: string
  formatValue: (v: number) => string
}

type RefLineLabel = {
  text: string
  color?: string
  position?: 'above' | 'below'
}

type Props = {
  points: ChartPoint[]
  color: string
  fill: string
  label: string
  formatValue: (v: number) => string
  variant?: 'line' | 'area' | 'step'
  secondary?: SecondaryData
  refLines?: number[]
  refLineLabels?: Record<number, RefLineLabel>
  height?: number
  hideLegend?: boolean
  yMin?: number
  yMax?: number
}

const MacroLineChart = ({
  points,
  color,
  fill,
  label,
  formatValue,
  variant = 'line',
  secondary,
  refLines,
  refLineLabels,
  height = 88,
  hideLegend = false,
  yMin: yMinProp,
  yMax: yMaxProp,
}: Props) => {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const update = () => setIsDark(!document.documentElement.classList.contains('light'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center text-ink-4 text-xs" style={{ height }}>
        —
      </div>
    )
  }

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const tickColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#475569' : '#e2e8f0'
  const tooltipBody = isDark ? '#e2e8f0' : '#0f172a'
  const refLineColor = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.25)'

  const isArea = variant === 'area'
  const isStep = variant === 'step'

  const primaryDataset: LineDs = {
    label,
    data: points.map((p) => ({ x: p.date, y: p.value })),
    borderColor: color,
    backgroundColor: isArea ? fill : 'transparent',
    fill: isArea ? 'origin' : false,
    borderWidth: 1.5,
    pointRadius: 0,
    pointHoverRadius: 4,
    pointHoverBackgroundColor: color,
    tension: isStep ? 0 : 0.3,
    stepped: isStep ? 'before' : false,
  }

  const secondaryDatasets: LineDs[] = secondary
    ? [
        {
          label: secondary.label,
          data: secondary.points.map((p) => ({ x: p.date, y: p.value })),
          borderColor: secondary.color,
          backgroundColor: 'transparent',
          fill: false,
          borderWidth: 1.5,
          borderDash: [4, 3],
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: secondary.color,
          tension: 0.3,
        },
      ]
    : []

  const refLineDatasets: LineDs[] = (refLines ?? []).map((val) => ({
    label: `${val}`,
    data: points.map((p) => ({ x: p.date, y: val })),
    borderColor: refLineColor,
    backgroundColor: 'transparent',
    fill: false,
    borderWidth: 1,
    borderDash: [4, 4],
    pointRadius: 0,
    pointHoverRadius: 0,
  }))

  const allDates = [
    ...points.map((p) => p.date),
    ...(secondary?.points.map((p) => p.date) ?? []),
  ].sort()

  // Y축 범위: prop으로 고정값이 주어지면 그것을 사용, 아니면 데이터 기반 동적 계산 (여백 12%)
  const allValues = [
    ...points.map((p) => p.value),
    ...(secondary?.points.map((p) => p.value) ?? []),
    ...(refLines ?? []),
  ]
  const dataMin = Math.min(...allValues)
  const dataMax = Math.max(...allValues)
  const yRange = dataMax - dataMin || 1
  const yPad = yRange * 0.12
  const yMin = yMinProp ?? dataMin - yPad
  const yMax = yMaxProp ?? dataMax + yPad

  // X축 단위: 기간에 따라 동적 결정
  const daysDiff =
    allDates.length >= 2
      ? (new Date(allDates[allDates.length - 1]).getTime() - new Date(allDates[0]).getTime()) /
        86400000
      : 365
  // 포인트 간 평균 간격으로 일봉/주봉 자동 감지
  const avgInterval = allDates.length >= 2 ? daysDiff / (allDates.length - 1) : 7
  const isDailyData = avgInterval < 4
  const timeUnit: 'day' | 'month' | 'quarter' =
    isDailyData && daysDiff <= 400 ? 'day' : daysDiff <= 600 ? 'month' : 'quarter'
  const displayFormats = { day: 'MM/dd', month: 'yy-MM', quarter: 'yy-QQ' }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tickColor,
        bodyColor: tooltipBody,
        padding: 8,
        filter: (item: TooltipItem<'line'>) => item.datasetIndex < 2,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return ''
            const x = items[0].parsed.x
            if (x == null) return ''
            const d = new Date(x)
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          },
          label: (ctx: TooltipItem<'line'>) => {
            if (ctx.parsed.y == null) return ''
            if (ctx.datasetIndex === 0) return `${label}: ${formatValue(ctx.parsed.y)}`
            if (ctx.datasetIndex === 1 && secondary)
              return `${secondary.label}: ${secondary.formatValue(ctx.parsed.y)}`
            return ''
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: { unit: timeUnit, displayFormats },
        min: allDates[0],
        max: allDates[allDates.length - 1],
        ticks: { color: tickColor, maxTicksLimit: 8, font: { size: 10 } },
        grid: { color: gridColor },
        border: { display: false },
      },
      y: {
        position: 'right' as const,
        min: yMin,
        max: yMax,
        ticks: {
          color: tickColor,
          maxTicksLimit: 6,
          font: { size: 10 },
          callback: (value: number | string) => formatValue(Number(value)),
        },
        grid: { color: gridColor },
        border: { display: false },
      },
    },
  }

  // refLine 라벨을 Chart.js가 계산한 정확한 Y 픽셀 좌표에 그리는 플러그인
  const refLabelPlugin: Plugin<'line'> = {
    id: 'refLabels',
    afterDraw(chart) {
      if (!refLineLabels) return
      const { ctx, scales } = chart
      const yScale = scales.y
      const xScale = scales.x
      if (!yScale || !xScale) return

      Object.entries(refLineLabels).forEach(([valStr, lbl]) => {
        const val = Number(valStr)
        const yPx = yScale.getPixelForValue(val)
        const xStart = xScale.left + 4
        const above = lbl.position !== 'below'

        ctx.save()
        ctx.font = '600 9px system-ui, sans-serif'
        ctx.fillStyle = lbl.color ?? 'rgba(148,163,184,0.8)'
        ctx.textAlign = 'left'
        ctx.textBaseline = above ? 'bottom' : 'top'
        ctx.fillText(lbl.text, xStart, yPx + (above ? -3 : 3))
        ctx.restore()
      })
    },
  }

  return (
    <div>
      {/* 범례: 2개 이상 데이터셋이고 hideLegend가 아닐 때 표시 */}
      {secondary && !hideLegend && (
        <div className="flex items-center gap-3 mb-1.5">
          <div className="flex items-center gap-1">
            <span className="inline-block w-5 h-[2px] rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-ink-4">{label}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* 점선 표현: 짧은 세그먼트 2개 */}
            <span className="flex items-center gap-px">
              <span className="inline-block w-2 h-[2px] rounded-full" style={{ backgroundColor: secondary.color }} />
              <span className="inline-block w-1 h-[2px]" />
              <span className="inline-block w-2 h-[2px] rounded-full" style={{ backgroundColor: secondary.color }} />
            </span>
            <span className="text-[10px] text-ink-4">{secondary.label}</span>
          </div>
        </div>
      )}
      <div style={{ height }} className="relative">
        <Line<TimePoint[]>
          data={{ datasets: [primaryDataset, ...secondaryDatasets, ...refLineDatasets] }}
          options={options}
          plugins={[crosshairPlugin, refLabelPlugin]}
        />
      </div>
    </div>
  )
}

export default MacroLineChart
