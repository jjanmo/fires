'use client'

import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { HistoryRow } from '@/entities/sigma'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const DARK  = { grid: '#1e293b', ticks: '#94a3b8', tooltipBg: '#1e293b', tooltipBorder: '#475569', tooltipTitle: '#94a3b8', tooltipBody: '#e2e8f0' }
const LIGHT = { grid: '#f1f5f9', ticks: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0', tooltipTitle: '#64748b', tooltipBody: '#0f172a' }

export default function PriceChart({ history }: { history: HistoryRow[] }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const c = isDark ? DARK : LIGHT

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">가격 차트 (최근 60일)</p>
      <div className="relative h-52">
        <Line
          data={{
            labels: history.map(r => r.date.slice(5)),
            datasets: [
              { label: '종가',     data: history.map(r => r.close),     borderColor: isDark ? '#a78bfa' : '#7c3aed', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
              { label: '2σ 매수가', data: history.map(r => r.buyPrice),  borderColor: isDark ? '#4ade80' : '#16a34a', borderWidth: 1,   pointRadius: 0, tension: 0.3, borderDash: [4, 3] },
              { label: '2σ 매도가', data: history.map(r => r.sellPrice), borderColor: isDark ? '#60a5fa' : '#2563eb', borderWidth: 1,   pointRadius: 0, tension: 0.3, borderDash: [4, 3] },
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
                titleColor: c.tooltipTitle,
                bodyColor: c.tooltipBody,
                borderColor: c.tooltipBorder,
                borderWidth: 1,
                padding: 10,
                callbacks: { label: ctx => `${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toFixed(2)}` },
              },
            },
            scales: {
              x: { ticks: { color: c.ticks, maxTicksLimit: 8, font: { size: 10 } }, grid: { color: c.grid } },
              y: { ticks: { color: c.ticks, font: { size: 10 }, callback: v => '$' + v }, grid: { color: c.grid } },
            },
          }}
        />
      </div>
    </div>
  )
}
