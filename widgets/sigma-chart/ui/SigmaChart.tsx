'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import type { HistoryRow } from '@/entities/sigma';


ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Filler);

const DARK = {
  // 구간 면적 색상
  tailFill:   'rgba( 74,222,128, 0.30)',  // ±2σ 바깥 (신호 구간)
  innerFill:  'rgba( 74,222,128, 0.10)',  // ±1σ~±2σ
  centerFill: 'rgba(167,139,250, 0.22)',  // ±1σ 중앙 (68%)
  innerFillR: 'rgba( 96,165,250, 0.10)',  // 오른쪽 1σ~2σ
  tailFillR:  'rgba( 96,165,250, 0.30)',  // 오른쪽 2σ 바깥
  // 아웃라인 곡선
  curveLine: '#a78bfa',
  // 수직선
  s2d: '#4ade80', s1d: '#86efac',
  mu: '#64748b',
  s1u: '#93c5fd', s2u: '#60a5fa',
  // 실제 등락률
  actual: '#fbbf24',
  // 차트
  grid: '#1e293b', ticks: '#94a3b8',
  tooltipBg: '#1e293b', tooltipBorder: '#475569',
  tooltipTitle: '#94a3b8', tooltipBody: '#e2e8f0',
};
const LIGHT = {
  tailFill:   'rgba( 22,163, 74, 0.18)',
  innerFill:  'rgba( 22,163, 74, 0.07)',
  centerFill: 'rgba(124, 58,237, 0.10)',
  innerFillR: 'rgba( 37, 99,235, 0.07)',
  tailFillR:  'rgba( 37, 99,235, 0.18)',
  curveLine: '#7c3aed',
  s2d: '#16a34a', s1d: '#4ade80',
  mu: '#94a3b8',
  s1u: '#93c5fd', s2u: '#2563eb',
  actual: '#d97706',
  grid: '#f1f5f9', ticks: '#64748b',
  tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0',
  tooltipTitle: '#64748b', tooltipBody: '#0f172a',
};

const pdf = (x: number, mu: number, sigma: number) =>
  Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));

/** xStart ~ xEnd 구간의 곡선 점 배열 생성 */
function segment(mu: number, sigma: number, xStart: number, xEnd: number, n = 60) {
  const step = (xEnd - xStart) / n;
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = xStart + i * step;
    return { x, y: pdf(x, mu, sigma) };
  });
}

function vLine(x: number, maxY: number) {
  return [{ x, y: 0 }, { x, y: maxY * 1.08 }];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filledSegment(data: { x: number; y: number }[], color: string): any {
  return { data, showLine: true, fill: 'origin', backgroundColor: color, borderColor: 'transparent', borderWidth: 0, pointRadius: 0 };
}

export default function SigmaChart({ latest }: { latest: HistoryRow }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => setIsDark(!document.documentElement.classList.contains('light'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const { mu, sigma, s2d, s2u, actualReturn } = latest;
  const s1d = mu - sigma;
  const s1u = mu + sigma;
  const far = mu - 3.8 * sigma;
  const farR = mu + 3.8 * sigma;
  const c = isDark ? DARK : LIGHT;
  const maxY = pdf(mu, mu, sigma);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datasets: any[] = [
    // ── 1. 5개 구간 면적 (아래에서부터 채워짐) ──
    filledSegment(segment(mu, sigma, far,  s2d), c.tailFill),    // 왼쪽 꼬리 (≤ 2σ↓, 매수 신호)
    filledSegment(segment(mu, sigma, s2d,  s1d), c.innerFill),   // 1σ~2σ 왼쪽
    filledSegment(segment(mu, sigma, s1d,  s1u), c.centerFill),  // ±1σ 중앙 (68%)
    filledSegment(segment(mu, sigma, s1u,  s2u), c.innerFillR),  // 1σ~2σ 오른쪽
    filledSegment(segment(mu, sigma, s2u, farR), c.tailFillR),   // 오른쪽 꼬리 (≥ 2σ↑, 매도 신호)

    // ── 2. 아웃라인 곡선 (전체 윤곽선) ──
    {
      label: '정규분포',
      data: segment(mu, sigma, far, farR, 300),
      showLine: true, fill: false,
      borderColor: c.curveLine, borderWidth: 1.5,
      pointRadius: 0,
    },

    // ── 3. 수직 기준선 ──
    { label: '2시그마↓', data: vLine(s2d, maxY), showLine: true, fill: false, borderColor: c.s2d, borderWidth: 2,   pointRadius: 0, borderDash: [5, 4] },
    { label: '1시그마↓', data: vLine(s1d, maxY), showLine: true, fill: false, borderColor: c.s1d, borderWidth: 2,   pointRadius: 0, borderDash: [5, 4] },
    { label: '평균(μ)', data: vLine(mu,  maxY), showLine: true, fill: false, borderColor: c.mu,  borderWidth: 1,   pointRadius: 0 },
    { label: '1시그마↑', data: vLine(s1u, maxY), showLine: true, fill: false, borderColor: c.s1u, borderWidth: 2,   pointRadius: 0, borderDash: [5, 4] },
    { label: '2시그마↑', data: vLine(s2u, maxY), showLine: true, fill: false, borderColor: c.s2u, borderWidth: 2,   pointRadius: 0, borderDash: [5, 4] },

    // ── 4. 실제 등락률 마커 ──
    ...(actualReturn != null ? [{
      label: '실제 등락률',
      data: [{ x: actualReturn, y: pdf(actualReturn, mu, sigma) }],
      showLine: false, fill: false,
      borderColor: c.actual, backgroundColor: c.actual,
      borderWidth: 2, pointRadius: 7, pointHoverRadius: 9,
    }] : []),
  ];

  const summaryItems = [
    { key: 's2d', label: <><>2<span className="normal-case">σ</span>↓</></>, val: s2d, color: c.s2d, pct: '2.3%' },
    { key: 's1d', label: <><>1<span className="normal-case">σ</span>↓</></>, val: s1d, color: c.s1d, pct: '13.6%' },
    { key: 'mu',  label: <>평균</>,             val: mu,  color: c.mu,  pct: '68.3%' },
    { key: 's1u', label: <><>1<span className="normal-case">σ</span>↑</></>, val: s1u, color: c.s1u, pct: '13.6%' },
    { key: 's2u', label: <><>2<span className="normal-case">σ</span>↑</></>, val: s2u, color: c.s2u, pct: '2.3%' },
  ];

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-1"><span className="normal-case">σ</span> 통계 · 정규분포 (Rolling 252일)</p>
      <p className="text-[11px] text-ink-4 mb-4">1<span className="normal-case">σ</span> = {sigma.toFixed(2)}%</p>

      <div className="relative h-48">
        <Scatter
          data={{ datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                mode: 'nearest',
                intersect: true,
                backgroundColor: c.tooltipBg,
                titleColor: c.tooltipTitle,
                bodyColor: c.tooltipBody,
                borderColor: c.tooltipBorder,
                borderWidth: 1,
                padding: 10,
                // 면적·아웃라인·수직선 제외, 실제 등락률 마커만 툴팁
                filter: (item) => item.datasetIndex === datasets.length - 1 && actualReturn != null,
                callbacks: {
                  title: () => '',
                  label: (ctx) => `실제 등락률: ${(ctx.parsed.x ?? 0).toFixed(2)}%`,
                },
              },
            },
            scales: {
              x: {
                type: 'linear',
                ticks: {
                  color: c.ticks,
                  font: { size: 10 },
                  callback: (v) => `${(v as number).toFixed(1)}%`,
                  maxTicksLimit: 9,
                },
                grid: { color: c.grid },
              },
              y: {
                ticks: { display: false },
                grid: { display: false },
                border: { display: false },
              },
            },
          }}
        />
      </div>

      {/* 요약 수치 행 */}
      <div className="grid grid-cols-5 gap-1 mt-4 pt-3 border-t border-edge text-center">
        {summaryItems.map(({ key, label, val, color, pct }) => (
          <div key={key}>
            <p className="text-[10px] text-ink-4 mb-0.5">{label}</p>
            <p className="font-mono text-[11px] font-semibold tabular-nums" style={{ color }}>
              {val > 0 ? '+' : ''}{val.toFixed(2)}%
            </p>
            <p className="text-[10px] text-ink-4 mt-0.5 tabular-nums">{pct}</p>
          </div>
        ))}
      </div>

      {actualReturn != null && (
        <p className="text-[11px] font-mono mt-2.5 text-right" style={{ color: c.actual }}>
          ● 실제 등락률&nbsp;&nbsp;{actualReturn > 0 ? '+' : ''}{actualReturn.toFixed(2)}%
        </p>
      )}

      {/* 구간 설명 */}
      <div className="mt-4 pt-4 border-t border-edge space-y-2">
        <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-3">구간 해석</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="text-[11px] mt-0.5" style={{ color: c.s2d }}>■</span>
            <p className="text-[11px] text-ink-3 leading-relaxed">
              <span className="font-semibold" style={{ color: c.s2d }}>2<span className="normal-case">σ</span> 이하 하락 (약 2.3%)</span>
              {' '}— 매수 신호 구간. 252일 역사상 하위 2.3% 수준의 하락일. 당일 저가가 매수 지정가({(s2d).toFixed(2)}%)에 도달하면 신호 발동.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[11px] mt-0.5" style={{ color: c.s1d }}>■</span>
            <p className="text-[11px] text-ink-3 leading-relaxed">
              <span className="font-semibold" style={{ color: c.s1d }}>1<span className="normal-case">σ</span> ~ 2<span className="normal-case">σ</span> 하락 (약 13.6%)</span>
              {' '}— 평균보다 낮은 하락이지만 신호 미발동 구간. 참고용 1<span className="normal-case">σ</span> 매수가({(s1d).toFixed(2)}%) 활용 가능.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[11px] mt-0.5" style={{ color: c.mu }}>■</span>
            <p className="text-[11px] text-ink-3 leading-relaxed">
              <span className="font-semibold text-ink-2">평균 ±1<span className="normal-case">σ</span> 중앙 (약 68.3%)</span>
              {' '}— 일반적인 변동 구간. 대부분의 거래일(약 2/3)이 이 범위 안에서 마감.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[11px] mt-0.5" style={{ color: c.s2u }}>■</span>
            <p className="text-[11px] text-ink-3 leading-relaxed">
              <span className="font-semibold" style={{ color: c.s2u }}>2<span className="normal-case">σ</span> 이상 상승 (약 2.3%)</span>
              {' '}— 매도 신호 구간. 당일 고가가 매도 지정가({(s2u).toFixed(2)}%)에 도달하면 신호 발동.
            </p>
          </div>
          {actualReturn != null && (
            <div className="flex items-start gap-2">
              <span className="text-[11px] mt-0.5" style={{ color: c.actual }}>●</span>
              <p className="text-[11px] text-ink-3 leading-relaxed">
                <span className="font-semibold" style={{ color: c.actual }}>황색 점 (오늘 실제 등락률)</span>
                {' '}— 곡선 위 위치로 오늘 등락률이 전체 분포에서 어느 구간에 해당하는지 확인.
                {actualReturn <= s2d && ' 현재 매수 신호 구간 진입.'}
                {actualReturn >= s2u && ' 현재 매도 신호 구간 진입.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
