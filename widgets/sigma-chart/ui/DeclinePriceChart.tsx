'use client'

import { useMemo, useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'
import type { HistoryRow } from '@/entities/sigma'
import { formatPrice, currencySymbol } from '@/shared/lib/ticker'

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const DECLINE_LEVELS = [
  { label: '10~15%', min: 10, max: 15, color: { dark: '#38bdf8', light: '#0284c7' } },   // sky blue
  { label: '15~20%', min: 15, max: 20, color: { dark: '#a78bfa', light: '#7c3aed' } },   // purple
  { label: '20%+',   min: 20, max: Infinity, color: { dark: '#f87171', light: '#dc2626' } }, // red
]

const DARK  = { line: '#5eead4', grid: '#1e293b', ticks: '#94a3b8', tooltipBg: '#1e293b', tooltipBorder: '#475569', tooltipTitle: '#94a3b8', tooltipBody: '#e2e8f0', legendText: '#94a3b8' }
const LIGHT = { line: '#0d9488', grid: '#f1f5f9', ticks: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0', tooltipTitle: '#64748b', tooltipBody: '#0f172a', legendText: '#64748b' }

function classifyDecline(actualReturn: number | null): number {
  if (actualReturn == null) return -1
  const drop = -actualReturn
  if (drop >= 20) return 2
  if (drop >= 15) return 1
  if (drop >= 10) return 0
  return -1
}

export default function DeclinePriceChart({ history, symbol }: { history: HistoryRow[]; symbol: string }) {
  const [isDark, setIsDark] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  useEffect(() => {
    const update = () => setIsDark(!document.documentElement.classList.contains('light'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const c = isDark ? DARK : LIGHT

  const years = useMemo(() => {
    const set = new Set(history.map(r => new Date(r.date).getFullYear()))
    return [...set].sort()
  }, [history])

  const yearData = useMemo(() => {
    if (selectedYear == null) return history
    return history.filter(r => new Date(r.date).getFullYear() === selectedYear)
  }, [history, selectedYear])

  // TimeScale용: { x: date string, y: value } 형태
  const pricePoints = useMemo(
    () => yearData.map(r => ({ x: r.date, y: r.close })),
    [yearData],
  )

  const declinePoints = useMemo(
    () => DECLINE_LEVELS.map((_, li) =>
      yearData
        .filter(r => classifyDecline(r.actualReturn) === li)
        .map(r => ({ x: r.date, y: r.close }))
    ),
    [yearData],
  )

  // 연도 선택 시 x축 범위를 1/1 ~ 12/31로 고정
  const xMin = selectedYear != null ? `${selectedYear}-01-01` : undefined
  const xMax = selectedYear != null ? `${selectedYear}-12-31` : undefined

  const datasets = useMemo(() => [
    {
      label: '종가',
      data: pricePoints,
      borderColor: c.line,
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.1,
      order: 1,
    },
    ...DECLINE_LEVELS.map((level, li) => ({
      label: `${level.label} 하락`,
      data: declinePoints[li],
      showLine: false,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: isDark ? level.color.dark : level.color.light,
      pointBorderColor: isDark ? level.color.dark : level.color.light,
      pointBorderWidth: 0,
      borderWidth: 0,
      order: 0,
    })),
  ], [pricePoints, declinePoints, isDark, c.line])

  const counts = DECLINE_LEVELS.map((_, li) =>
    yearData.filter(r => classifyDecline(r.actualReturn) === li).length
  )

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-1">하락 이벤트 차트</p>
      <p className="text-[11px] text-ink-4 mb-4">10% 이상 일봉 하락일을 종가 차트 위에 표시</p>

      {/* Year tabs */}
      <div className="flex gap-1 mb-4 bg-inset rounded-lg p-1 w-fit flex-wrap">
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-3 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
            selectedYear == null
              ? 'bg-card text-ink-1 border border-edge font-medium'
              : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          전체
        </button>
        {years.map(y => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-3 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
              selectedYear === y
                ? 'bg-card text-ink-1 border border-edge font-medium'
                : 'text-ink-3 hover:text-ink-2'
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="h-56">
        <Line
          data={{ datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                  color: c.legendText,
                  font: { size: 10 },
                  boxWidth: 10,
                  boxHeight: 10,
                  borderRadius: 2,
                  useBorderRadius: true,
                  padding: 12,
                  filter: (item) => item.text !== '종가',
                  usePointStyle: true,
                  pointStyle: 'circle',
                },
              },
              tooltip: {
                mode: 'nearest',
                intersect: true,
                backgroundColor: c.tooltipBg,
                titleColor: c.tooltipTitle,
                bodyColor: c.tooltipBody,
                borderColor: c.tooltipBorder,
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  title: (items) => {
                    const raw = items[0]?.raw as { x?: string }
                    return raw?.x ?? ''
                  },
                  label: (ctx) => {
                    const raw = ctx.raw as { x?: string; y?: number }
                    const price = raw?.y ?? 0
                    if (ctx.dataset.label === '종가') {
                      return ` 종가: ${formatPrice(price, symbol)}`
                    }
                    const row = yearData.find(r => r.date === raw?.x)
                    const ret = row?.actualReturn
                    return ` ${ctx.dataset.label}: ${formatPrice(price, symbol)} (${ret != null ? ret.toFixed(2) : '?'}%)`
                  },
                },
              },
            },
            scales: {
              x: {
                type: 'time',
                min: xMin,
                max: xMax,
                time: {
                  unit: 'month',
                  displayFormats: { month: 'MM월' },
                },
                ticks: {
                  color: c.ticks,
                  font: { size: 10 },
                  maxTicksLimit: 12,
                },
                grid: { display: false },
              },
              y: {
                ticks: {
                  color: c.ticks,
                  font: { size: 10 },
                  callback: v => `${currencySymbol(symbol)}${v}`,
                },
                grid: { color: c.grid },
              },
            },
          }}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-edge">
        {DECLINE_LEVELS.map((level, i) => (
          <div key={level.min} className="text-center">
            <p className="text-[10px] text-ink-4 mb-0.5">{level.label} 하락</p>
            <p
              className="text-lg font-bold tabular-nums font-mono"
              style={{ color: isDark ? level.color.dark : level.color.light }}
            >
              {counts[i]}
              <span className="text-[10px] font-normal text-ink-4">회</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
