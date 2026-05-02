'use client'

import 'chartjs-adapter-date-fns'
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Tooltip,
  BarController,
  LineController,
  type ChartDataset,
  type ChartData,
  type TooltipItem,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { useEffect, useState } from 'react'
import type { ChartPoint } from '../types'

ChartJS.register(
  TimeScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Tooltip,
  BarController,
  LineController,
)

type TimePoint = { x: string; y: number }

type Props = {
  points: ChartPoint[]
  color: string
  fill: string
  label: string
  formatValue: (v: number) => string
  refLines?: number[]
  height?: number
}

const MacroBarLineChart = ({
  points,
  color,
  fill,
  label,
  formatValue,
  refLines,
  height = 88,
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
  const refLineColor = isDark ? 'rgba(148,163,184,0.3)' : 'rgba(100,116,139,0.3)'

  const barDataset: ChartDataset<'bar', TimePoint[]> = {
    type: 'bar' as const,
    label,
    data: points.map((p) => ({ x: p.date, y: p.value })),
    backgroundColor: fill,
    borderColor: color,
    borderWidth: 0,
    borderRadius: 2,
  }

  const refLineDatasets: ChartDataset<'line', TimePoint[]>[] = (refLines ?? []).map((val) => ({
    type: 'line' as const,
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

  // bar + line 혼합 데이터셋: Chart.js 타입이 단일 차트 타입만 지원하므로
  // unknown 경유 캐스팅 (any와 달리 대상 타입이 명확함)
  const data = {
    datasets: [barDataset, ...refLineDatasets],
  } as unknown as ChartData<'bar'>

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
        filter: (item: TooltipItem<'bar'>) => item.datasetIndex === 0,
        callbacks: {
          title: (items: TooltipItem<'bar'>[]) => {
            if (!items.length) return ''
            const x = items[0].parsed.x
            if (x == null) return ''
            const d = new Date(x)
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          },
          label: (ctx: TooltipItem<'bar'>) =>
            ctx.parsed.y != null ? `${label}: ${formatValue(ctx.parsed.y)}` : '',
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: { unit: 'month' as const, displayFormats: { month: 'yy-MM' } },
        ticks: { color: tickColor, maxTicksLimit: 8, font: { size: 10 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        position: 'right' as const,
        min: (() => {
          const vals = points.map((p) => p.value).concat(refLines ?? [])
          const mn = Math.min(...vals)
          const mx = Math.max(...vals)
          const pad = (mx - mn || 1) * 0.12
          return mn - pad
        })(),
        max: (() => {
          const vals = points.map((p) => p.value).concat(refLines ?? [])
          const mn = Math.min(...vals)
          const mx = Math.max(...vals)
          const pad = (mx - mn || 1) * 0.12
          return mx + pad
        })(),
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

  return (
    <div style={{ height }} className="relative">
      <Chart type="bar" data={data} options={options} />
    </div>
  )
}

export default MacroBarLineChart
