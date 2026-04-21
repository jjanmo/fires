'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { SignalRow } from '@/entities/sigma';

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, LineController, LineElement, PointElement, Tooltip);

type SignalType = 'buy-2s' | 'buy-1s' | 'sell-2s' | 'sell-1s' | 'none';

function getSignalType(row: SignalRow): SignalType {
  const { actualReturn, s2d, s2u, mu, sigma } = row;
  if (actualReturn == null) return 'none';
  const s1d = mu - sigma;
  const s1u = mu + sigma;
  if (actualReturn <= s2d) return 'buy-2s';
  if (actualReturn <= s1d) return 'buy-1s';
  if (actualReturn >= s2u) return 'sell-2s';
  if (actualReturn >= s1u) return 'sell-1s';
  return 'none';
}

// SigmaChart DARK/LIGHT 팔레트와 동일하게 맞춤
const DARK = {
  buy2s:  '#4ade80',               // s2d 색
  buy1s:  '#86efac',               // s1d 색
  none:   'rgba(167,139,250,0.35)', // centerFill 색
  sell1s: '#93c5fd',               // s1u 색
  sell2s: '#60a5fa',               // s2u 색
  s2d: '#4ade80', s1d: '#86efac', mu: '#64748b', s1u: '#93c5fd', s2u: '#60a5fa',
  grid: '#1e293b', ticks: '#94a3b8',
  tooltipBg: '#1e293b', tooltipBorder: '#475569',
  tooltipTitle: '#94a3b8', tooltipBody: '#e2e8f0',
};
const LIGHT = {
  buy2s:  '#16a34a',
  buy1s:  '#4ade80',
  none:   'rgba(124,58,237,0.2)',
  sell1s: '#93c5fd',
  sell2s: '#2563eb',
  s2d: '#16a34a', s1d: '#4ade80', mu: '#94a3b8', s1u: '#93c5fd', s2u: '#2563eb',
  grid: '#f1f5f9', ticks: '#64748b',
  tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0',
  tooltipTitle: '#64748b', tooltipBody: '#0f172a',
};

function fmt(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${m}/${d}`;
}

export default function SignalHistoryChart({
  rows,
  windowSize,
}: {
  rows: SignalRow[];
  windowSize: number;
}) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => setIsDark(!document.documentElement.classList.contains('light'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-edge p-5">
        <p className="text-[11px] text-ink-3 uppercase tracking-widest">신호 이력</p>
        <p className="text-[11px] text-ink-4 mt-3">데이터가 충분하지 않습니다.</p>
      </div>
    );
  }

  const c = isDark ? DARK : LIGHT;
  const signals = rows.map(getSignalType);
  const latest = rows[rows.length - 1];

  const barColor = (s: SignalType) =>
    s === 'buy-2s'  ? c.buy2s  :
    s === 'buy-1s'  ? c.buy1s  :
    s === 'sell-2s' ? c.sell2s :
    s === 'sell-1s' ? c.sell1s : c.none;

  // Y축 σ 기준점 (최신 행 기준)
  const yTicks = [
    { value: latest.s2d,              label: '2σ↓', color: c.s2d  },
    { value: latest.mu - latest.sigma, label: '1σ↓', color: c.s1d  },
    { value: latest.mu,               label: 'μ',    color: c.mu   },
    { value: latest.mu + latest.sigma, label: '1σ↑', color: c.s1u  },
    { value: latest.s2u,              label: '2σ↑', color: c.s2u  },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datasets: any[] = [
    {
      type: 'bar',
      label: '등락률',
      data: rows.map(r => r.actualReturn ?? 0),
      backgroundColor: signals.map(barColor),
      borderWidth: 0,
      borderRadius: 2,
      order: 2,
    },
    { type: 'line', label: '2σ↓', data: rows.map(r => r.s2d),              borderColor: c.s2d, borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, fill: false, order: 1 },
    { type: 'line', label: '1σ↓', data: rows.map(r => r.mu - r.sigma),     borderColor: c.s1d, borderWidth: 1,   borderDash: [4,3], pointRadius: 0, fill: false, order: 1 },
    { type: 'line', label: 'μ',   data: rows.map(r => r.mu),               borderColor: c.mu,  borderWidth: 1,                    pointRadius: 0, fill: false, order: 1 },
    { type: 'line', label: '1σ↑', data: rows.map(r => r.mu + r.sigma),     borderColor: c.s1u, borderWidth: 1,   borderDash: [4,3], pointRadius: 0, fill: false, order: 1 },
    { type: 'line', label: '2σ↑', data: rows.map(r => r.s2u),              borderColor: c.s2u, borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, fill: false, order: 1 },
  ];

  const counts = (['buy-2s', 'buy-1s', 'sell-1s', 'sell-2s'] as SignalType[]).map(k => ({
    key: k,
    label: k === 'buy-2s' ? '2σ 매수' : k === 'buy-1s' ? '1σ 매수' : k === 'sell-1s' ? '1σ 매도' : '2σ 매도',
    color: barColor(k),
    count: signals.filter(s => s === k).length,
  }));

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">
        신호 이력 · 최근 {rows.length}일 (Rolling {windowSize}일)
      </p>

      <div className="h-52">
        <Chart
          key={`${windowSize}-${isDark}`}
          type="bar"
          data={{ labels: rows.map(r => fmt(r.date)), datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                filter: (item) => item.datasetIndex === 0,
                backgroundColor: c.tooltipBg,
                titleColor: c.tooltipTitle,
                bodyColor: c.tooltipBody,
                borderColor: c.tooltipBorder,
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  title: (items) => rows[items[0].dataIndex]?.date ?? '',
                  label: (ctx) => {
                    const val = ctx.parsed.y as number;
                    const sig = signals[ctx.dataIndex];
                    const sigLabel =
                      sig === 'buy-2s'  ? '2σ 매수 신호' :
                      sig === 'buy-1s'  ? '1σ 매수 신호' :
                      sig === 'sell-2s' ? '2σ 매도 신호' :
                      sig === 'sell-1s' ? '1σ 매도 신호' : '신호 없음';
                    return ` ${val >= 0 ? '+' : ''}${val.toFixed(2)}%  ${sigLabel}`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { color: c.grid },
                ticks: {
                  color: c.ticks,
                  font: { size: 10 },
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 8,
                },
              },
              y: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                afterBuildTicks(axis: any) {
                  axis.ticks = yTicks.map(t => ({ value: t.value }));
                },
                ticks: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  color: (ctx: any) => {
                    const v = ctx.tick?.value as number;
                    const match = yTicks.find(t => Math.abs(t.value - v) < 0.0001);
                    return match?.color ?? c.ticks;
                  },
                  font: { size: 10 },
                  callback: (_v, index) => yTicks[index]?.label ?? '',
                },
                grid: { color: c.grid },
              },
            },
          }}
        />
      </div>

      {/* 신호 발생 횟수 요약 */}
      <div className="mt-4 pt-4 border-t border-edge grid grid-cols-4 gap-2 text-center">
        {counts.map(({ key, label, color, count }) => (
          <div key={key}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color }}>
              {label.split('σ')[0]}<span className="normal-case">σ</span>{label.split('σ')[1]}
            </p>
            <p className="text-xl font-semibold tabular-nums" style={{ color }}>{count}</p>
            <p className="text-[10px] text-ink-4">회</p>
          </div>
        ))}
      </div>
    </div>
  );
}
