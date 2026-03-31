'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import type { Plugin } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import type { HistoryRow } from '@/entities/sigma';


ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Filler);

const DARK = {
  tailFill:   'rgba( 74,222,128, 0.30)',
  innerFill:  'rgba( 74,222,128, 0.10)',
  centerFill: 'rgba(167,139,250, 0.22)',
  innerFillR: 'rgba( 96,165,250, 0.10)',
  tailFillR:  'rgba( 96,165,250, 0.30)',
  curveLine: '#a78bfa',
  s2d: '#4ade80', s1d: '#86efac',
  mu: '#64748b',
  s1u: '#93c5fd', s2u: '#60a5fa',
  actual: '#fbbf24',
  grid: '#1e293b', ticks: '#94a3b8',
  tooltipBg: '#1e293b', tooltipBorder: '#475569',
  tooltipTitle: '#94a3b8', tooltipBody: '#e2e8f0',
  labelText: '#e2e8f0', zonePctText: 'rgba(148,163,184,0.8)',
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
  labelText: '#334155', zonePctText: 'rgba(100,116,139,0.8)',
};

interface LineLabel { x: number; name: string; value: string; price: string; color: string }
interface ZoneLabel { xLeft: number; xRight: number; pct: string }

const pdf = (x: number, mu: number, sigma: number) =>
  Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));

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

function fmtPct(v: number): string {
  return (v > 0 ? '+' : '') + v.toFixed(2) + '%';
}

/** 차트 위에 수직선 라벨 + 구간 비율을 직접 렌더링하는 플러그인 */
function makeLabelPlugin(
  lineLabels: LineLabel[],
  zoneLabels: ZoneLabel[],
  colors: typeof DARK,
): Plugin<'scatter'> {
  return {
    id: 'sigmaLabels',
    afterDraw(chart) {
      const { ctx } = chart;
      const xScale = chart.scales['x'];
      const yScale = chart.scales['y'];
      if (!xScale || !yScale) return;

      const top = yScale.top;

      ctx.save();

      // ── 수직선 라벨: 이름 + 경계값 + 예측 가격 ──
      for (const { x, name, value, price, color } of lineLabels) {
        const px = xScale.getPixelForValue(x);
        if (px < xScale.left || px > xScale.right) continue;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // 이름 (예: "2σ↓")
        ctx.font = 'bold 10px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = color;
        ctx.fillText(name, px, top - 24);

        // 변동률 (예: "-14.32%")
        ctx.font = '9px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = colors.labelText;
        ctx.fillText(value, px, top - 13);

        // 예측 가격 (예: "$123.45")
        ctx.font = '9px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = color;
        ctx.fillText(price, px, top - 3);
      }

      // ── 구간 비율 라벨 ──
      for (const { xLeft, xRight, pct } of zoneLabels) {
        const pxLeft = xScale.getPixelForValue(xLeft);
        const pxRight = xScale.getPixelForValue(xRight);
        const pxMid = (pxLeft + pxRight) / 2;

        // 구간이 너무 좁으면 스킵
        if (pxRight - pxLeft < 28) continue;

        const midY = (yScale.top + yScale.bottom) / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = colors.zonePctText;
        ctx.fillText(pct, pxMid, midY);
      }

      ctx.restore();
    },
  };
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

  const { mu, sigma, s2d, s2u, actualReturn, window: returns, buyPrice, sellPrice, s1BuyPrice, s1SellPrice, close } = latest;
  const s1d = mu - sigma;
  const s1u = mu + sigma;
  const muPrice = +(close * (1 + mu / 100)).toFixed(2);

  // 실제 252일 데이터 기반 구간별 비율 계산
  const total = returns.length;
  const pctS2d = ((returns.filter(r => r <= s2d).length / total) * 100).toFixed(1) + '%';
  const pctS1d = ((returns.filter(r => r > s2d && r <= s1d).length / total) * 100).toFixed(1) + '%';
  const pctMid = ((returns.filter(r => r > s1d && r < s1u).length / total) * 100).toFixed(1) + '%';
  const pctS1u = ((returns.filter(r => r >= s1u && r < s2u).length / total) * 100).toFixed(1) + '%';
  const pctS2u = ((returns.filter(r => r >= s2u).length / total) * 100).toFixed(1) + '%';

  const far = mu - 3.8 * sigma;
  const farR = mu + 3.8 * sigma;
  const c = isDark ? DARK : LIGHT;
  const maxY = pdf(mu, mu, sigma);

  const fmtPrice = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lineLabels: LineLabel[] = [
    { x: s2d, name: '2σ↓', value: fmtPct(s2d), price: '$' + fmtPrice(buyPrice),     color: c.s2d },
    { x: s1d, name: '1σ↓', value: fmtPct(s1d), price: '$' + fmtPrice(s1BuyPrice),   color: c.s1d },
    { x: mu,  name: 'μ',   value: fmtPct(mu),  price: '$' + fmtPrice(muPrice),       color: c.mu  },
    { x: s1u, name: '1σ↑', value: fmtPct(s1u), price: '$' + fmtPrice(s1SellPrice),   color: c.s1u },
    { x: s2u, name: '2σ↑', value: fmtPct(s2u), price: '$' + fmtPrice(sellPrice),     color: c.s2u },
  ];

  const zoneLabels: ZoneLabel[] = [
    { xLeft: far, xRight: s2d, pct: pctS2d },
    { xLeft: s2d, xRight: s1d, pct: pctS1d },
    { xLeft: s1d, xRight: s1u, pct: pctMid  },
    { xLeft: s1u, xRight: s2u, pct: pctS1u },
    { xLeft: s2u, xRight: farR, pct: pctS2u },
  ];

  const labelPlugin = useMemo(
    () => makeLabelPlugin(lineLabels, zoneLabels, c),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mu, sigma, s2d, s2u, isDark],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datasets: any[] = [
    filledSegment(segment(mu, sigma, far,  s2d), c.tailFill),
    filledSegment(segment(mu, sigma, s2d,  s1d), c.innerFill),
    filledSegment(segment(mu, sigma, s1d,  s1u), c.centerFill),
    filledSegment(segment(mu, sigma, s1u,  s2u), c.innerFillR),
    filledSegment(segment(mu, sigma, s2u, farR), c.tailFillR),

    {
      label: '정규분포',
      data: segment(mu, sigma, far, farR, 300),
      showLine: true, fill: false,
      borderColor: c.curveLine, borderWidth: 1.5,
      pointRadius: 0,
    },

    { label: '2σ↓', data: vLine(s2d, maxY), showLine: true, fill: false, borderColor: c.s2d, borderWidth: 2, pointRadius: 0, borderDash: [5, 4] },
    { label: '1σ↓', data: vLine(s1d, maxY), showLine: true, fill: false, borderColor: c.s1d, borderWidth: 2, pointRadius: 0, borderDash: [5, 4] },
    { label: 'μ',    data: vLine(mu,  maxY), showLine: true, fill: false, borderColor: c.mu,  borderWidth: 1, pointRadius: 0 },
    { label: '1σ↑', data: vLine(s1u, maxY), showLine: true, fill: false, borderColor: c.s1u, borderWidth: 2, pointRadius: 0, borderDash: [5, 4] },
    { label: '2σ↑', data: vLine(s2u, maxY), showLine: true, fill: false, borderColor: c.s2u, borderWidth: 2, pointRadius: 0, borderDash: [5, 4] },

    ...(actualReturn != null ? [{
      label: '실제 등락률',
      data: [{ x: actualReturn, y: pdf(actualReturn, mu, sigma) }],
      showLine: false, fill: false,
      borderColor: c.actual, backgroundColor: c.actual,
      borderWidth: 2, pointRadius: 7, pointHoverRadius: 9,
    }] : []),
  ];

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">
        <span className="normal-case">σ</span> 통계 · 정규분포 (Rolling 252일)
      </p>

      <div className="relative h-64">
        <Scatter
          data={{ datasets }}
          plugins={[labelPlugin]}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: { padding: { top: 42 } },
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
              <span className="font-semibold" style={{ color: c.s2d }}>2<span className="normal-case">σ</span> 이하 하락 ({pctS2d})</span>
              {' '}— 매수 신호 구간. 당일 저가가 매수 지정가({fmtPct(s2d)})에 도달하면 신호 발동.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[11px] mt-0.5" style={{ color: c.s1d }}>■</span>
            <p className="text-[11px] text-ink-3 leading-relaxed">
              <span className="font-semibold" style={{ color: c.s1d }}>1<span className="normal-case">σ</span> ~ 2<span className="normal-case">σ</span> 하락 ({pctS1d})</span>
              {' '}— 평균보다 낮은 하락이지만 신호 미발동 구간. 참고용 1<span className="normal-case">σ</span> 매수가({fmtPct(s1d)}) 활용 가능.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[11px] mt-0.5" style={{ color: c.mu }}>■</span>
            <p className="text-[11px] text-ink-3 leading-relaxed">
              <span className="font-semibold text-ink-2">평균 ±1<span className="normal-case">σ</span> 중앙 ({pctMid})</span>
              {' '}— 일반적인 변동 구간. 252일 중 대부분의 거래일이 이 범위 안에서 마감.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[11px] mt-0.5" style={{ color: c.s2u }}>■</span>
            <p className="text-[11px] text-ink-3 leading-relaxed">
              <span className="font-semibold" style={{ color: c.s2u }}>2<span className="normal-case">σ</span> 이상 상승 ({pctS2u})</span>
              {' '}— 매도 신호 구간. 당일 고가가 매도 지정가({fmtPct(s2u)})에 도달하면 신호 발동.
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
