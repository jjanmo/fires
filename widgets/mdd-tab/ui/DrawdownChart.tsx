'use client'

import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { MddPoint } from '@/entities/sigma'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const DARK  = { grid: '#1e293b', ticks: '#94a3b8', tooltipBg: '#1e293b', tooltipBorder: '#475569', tooltipTitle: '#94a3b8', tooltipBody: '#e2e8f0' }
const LIGHT = { grid: '#f1f5f9', ticks: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0', tooltipTitle: '#64748b', tooltipBody: '#0f172a' }

function downsample(data: MddPoint[], max = 600): MddPoint[] {
  if (data.length <= max) return data
  const step = Math.ceil(data.length / max)
  const result = data.filter((_, i) => i % step === 0)
  const last = data[data.length - 1]
  if (result[result.length - 1] !== last) result.push(last)
  return result
}

interface Props {
  series:    MddPoint[]
  mdd:       number   // MDD 기준선 (음수)
  currentDD: number   // 현재 낙폭
}

export default function DrawdownChart({ series, mdd, currentDD }: Props) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const c    = isDark ? DARK : LIGHT
  const data = downsample(series)

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-1">역사적 낙폭 흐름</p>
      <p className="text-[10px] text-ink-4 mb-4">종가 기준 고점 대비 낙폭 (수중 곡선)</p>
      <div className="relative h-52">
        <Line
          data={{
            labels: data.map(p => p.date.slice(0, 7)),
            datasets: [
              {
                // 수중 곡선
                data:            data.map(p => p.dd),
                borderColor:     'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderWidth:     1.5,
                pointRadius:     0,
                tension:         0.2,
                fill:            true,
              },
              {
                // 현재 위치 (마지막 포인트 강조)
                data:            data.map((_, i) => i === data.length - 1 ? currentDD : null),
                borderColor:     'transparent',
                backgroundColor: 'rgb(251, 191, 36)',
                pointRadius:     5,
                pointHoverRadius: 7,
                showLine:        false,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                mode: 'index', intersect: false,
                backgroundColor: c.tooltipBg,
                titleColor:      c.tooltipTitle,
                bodyColor:       c.tooltipBody,
                borderColor:     c.tooltipBorder,
                borderWidth:     1,
                padding:         10,
                filter:          item => item.datasetIndex === 0,
                callbacks: {
                  label: ctx => `낙폭: ${(ctx.parsed.y ?? 0).toFixed(2)}%`,
                },
              },
            },
            scales: {
              x: {
                ticks: { color: c.ticks, maxTicksLimit: 6, font: { size: 10 } },
                grid:  { color: c.grid },
              },
              y: {
                max: 0,
                ticks: { color: c.ticks, font: { size: 10 }, callback: v => `${v}%` },
                grid:  { color: c.grid },
              },
            },
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-ink-4 mt-2">
        <span>MDD: <span className="font-mono text-rose-500">{mdd.toFixed(2)}%</span></span>
        <span>현재: <span className="font-mono text-amber-400">{currentDD.toFixed(2)}%</span></span>
      </div>
    </div>
  )
}
