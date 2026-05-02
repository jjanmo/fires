'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { INDICATOR_CONFIGS, getSignal } from '../lib/indicator-config';
import type { FearGreedData } from '../types';
import MacroLineChart from './MacroLineChart';

type Props = { data: FearGreedData };
type Tab = 'overview' | 'timeline';

const GAUGE_ZONES = [
  { label: 'Extreme Fear', lines: ['EXTREME', 'FEAR'], min: 0, max: 25, color: '#ef4444' },
  { label: 'Fear', lines: ['FEAR'], min: 25, max: 45, color: '#f97316' },
  { label: 'Neutral', lines: ['NEUTRAL'], min: 45, max: 55, color: '#eab308' },
  { label: 'Greed', lines: ['GREED'], min: 55, max: 75, color: '#84cc16' },
  { label: 'Extreme Greed', lines: ['EXTREME', 'GREED'], min: 75, max: 100, color: '#22c55e' },
];

const getRating = (score: number | null) => {
  if (score === null) return { label: '—', color: '#94a3b8' };
  const zone = GAUGE_ZONES.find((z) => score >= z.min && score < z.max) ?? GAUGE_ZONES[4];
  return { label: zone.label, color: zone.color };
};

const SCORE_ROWS = [
  { key: 'previousClose' as const, label: '직전 종가' },
  { key: 'oneWeekAgo' as const, label: '1주일 전' },
  { key: 'oneMonthAgo' as const, label: '1개월 전' },
  { key: 'oneYearAgo' as const, label: '1년 전' },
];

// SVG 레이아웃 상수
const CX = 100;
const CY = 108;
const R_OUT = 86; // 외호 반지름
const R_IN = 60; // 내호 반지름 (도넛 두께 = 26)
const R_LBL = 73; // 구역 레이블 반지름
const R_NUM = 53; // 경계 숫자 반지름 (내호 바로 안쪽)

const toRad = (deg: number) => (deg * Math.PI) / 180;
const valueToAngle = (v: number) => -180 + (v / 100) * 180; // -180° ~ 0°

/** 도넛 호 세그먼트 path 문자열 */
const zonePath = (min: number, max: number): string => {
  const a1 = toRad(valueToAngle(min));
  const a2 = toRad(valueToAngle(max));
  const large = max - min > 50 ? 1 : 0;
  const x1o = CX + R_OUT * Math.cos(a1),
    y1o = CY + R_OUT * Math.sin(a1);
  const x2o = CX + R_OUT * Math.cos(a2),
    y2o = CY + R_OUT * Math.sin(a2);
  const x2i = CX + R_IN * Math.cos(a2),
    y2i = CY + R_IN * Math.sin(a2);
  const x1i = CX + R_IN * Math.cos(a1),
    y1i = CY + R_IN * Math.sin(a1);
  return `M ${x1o} ${y1o} A ${R_OUT} ${R_OUT} 0 ${large} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${R_IN} ${R_IN} 0 ${large} 0 ${x1i} ${y1i} Z`;
};

const ScoreBadge = ({ score, label }: { score: number | null; label: string }) => {
  const { color } = getRating(score);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-edge last:border-0">
      <span className="text-xs text-ink-4">{label}</span>
      {score !== null ? (
        <span
          className="text-sm font-semibold tabular-nums w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + '33', color }}
        >
          {Math.round(score)}
        </span>
      ) : (
        <span className="text-sm text-ink-4">—</span>
      )}
    </div>
  );
};

const GaugeSvg = ({ score }: { score: number | null }) => {
  const { color } = getRating(score);
  const activeLabel =
    score !== null ? (GAUGE_ZONES.find((z) => score >= z.min && score < z.max) ?? GAUGE_ZONES[4]).label : null;

  const pct = score !== null ? Math.max(0, Math.min(100, score)) / 100 : 0;
  const needleAngle = toRad(valueToAngle(pct * 100));
  const nx = CX + (R_IN - 4) * Math.cos(needleAngle);
  const ny = CY + (R_IN - 4) * Math.sin(needleAngle);

  const boundaries = [0, 25, 45, 55, 75, 100];

  return (
    <svg viewBox="0 0 200 120" className="w-full">
      {/* 도넛 호 세그먼트 */}
      {GAUGE_ZONES.map((zone) => {
        const isActive = zone.label === activeLabel;
        return (
          <path
            key={zone.label}
            d={zonePath(zone.min, zone.max)}
            fill={isActive ? zone.color + '55' : zone.color + '1a'}
            stroke={isActive ? zone.color + 'aa' : zone.color + '44'}
            strokeWidth={0.4}
          />
        );
      })}

      {/* 구역 레이블 (호 안쪽) */}
      {GAUGE_ZONES.map((zone) => {
        const mid = (zone.min + zone.max) / 2;
        const angle = valueToAngle(mid);
        const rad = toRad(angle);
        const lx = CX + R_LBL * Math.cos(rad);
        const ly = CY + R_LBL * Math.sin(rad);
        const rotation = angle + 90;
        const isActive = zone.label === activeLabel;
        // 호 호弧 폭(arc length)에 맞게 폰트 크기 동적 계산
        const arcLen = R_LBL * ((zone.max - zone.min) / 100) * Math.PI;
        const maxChars = Math.max(...zone.lines.map((l) => l.length));
        const fontSize = Math.min(5.5, arcLen / (maxChars * 0.72));
        const lineH = fontSize * 1.3;

        return (
          <g key={zone.label} transform={`translate(${lx},${ly}) rotate(${rotation})`}>
            {zone.lines.map((line, i) => {
              const offset = (i - (zone.lines.length - 1) / 2) * lineH;
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
              );
            })}
          </g>
        );
      })}

      {/* 경계 눈금 + 숫자 (눈금: 바깥 테두리, 숫자: 호 안쪽) */}
      {boundaries.map((v) => {
        const a = toRad(valueToAngle(v));
        const tx1 = CX + R_OUT * Math.cos(a);
        const ty1 = CY + R_OUT * Math.sin(a);
        const tx2 = CX + (R_OUT - 4) * Math.cos(a);
        const ty2 = CY + (R_OUT - 4) * Math.sin(a);
        const lx = CX + R_NUM * Math.cos(a);
        const ly = CY + R_NUM * Math.sin(a);
        return (
          <g key={v}>
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#475569" strokeWidth={0.8} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={4.5} fill="#64748b">
              {v}
            </text>
          </g>
        );
      })}

      {/* 바늘 */}
      {score !== null && (
        <>
          <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={CX} cy={CY} r={4} fill={color} />
          <circle cx={CX} cy={CY} r={2} fill="#1e293b" />
        </>
      )}
    </svg>
  );
};

const FearGreedCard = ({ data }: Props) => {
  const [tab, setTab] = useState<Tab>('overview');
  const { score, rating } = data;
  const { color } = getRating(score);
  const config = INDICATOR_CONFIGS['fear-greed'];
  const signal = getSignal(score, config.signals);

  const isUp = data.previousClose !== null && score !== null && score > data.previousClose;
  const isDown = data.previousClose !== null && score !== null && score < data.previousClose;

  return (
    <div id="fear-greed" className="rounded-2xl border border-edge bg-card p-4 md:p-5 scroll-mt-16">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-semibold text-ink-1">공포탐욕지수</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-edge text-ink-4 leading-none">CNN</span>
          </div>
          {signal && (
            <p className="text-[10px] sm:text-xs font-medium mt-1 leading-none" style={{ color: signal.color }}>
              {signal.label}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl sm:text-2xl font-bold tabular-nums leading-none" style={{ color }}>
            {score !== null ? Math.round(score) : '—'}
          </p>
        </div>
      </div>

      {/* 탭 버튼 */}
      <div className="flex bg-inset rounded-lg p-0.5 self-start mb-3 w-fit">
        {(['overview', 'timeline'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer',
              tab === t ? 'bg-card text-ink-1 shadow-sm' : 'text-ink-4 hover:text-ink-2'
            )}
          >
            {t === 'overview' ? '오버뷰' : '타임라인'}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {tab === 'overview' ? (
        <div className="grid grid-cols-5 gap-4 py-1 ">
          <div className="col-span-3">
            <GaugeSvg score={score} />
          </div>
          <div className="col-span-2 flex flex-col justify-center">
            <p className="text-[10px] font-semibold text-ink-4 uppercase tracking-wide mb-1">역사적 비교</p>
            {SCORE_ROWS.map(({ key, label }) => (
              <ScoreBadge key={key} score={data[key]} label={label} />
            ))}
          </div>
        </div>
      ) : (
        <MacroLineChart
          points={data.points}
          color="#f97316"
          fill="rgba(249,115,22,0.08)"
          label="공포탐욕지수"
          formatValue={(v) => Math.round(v).toString()}
          refLines={[25, 75]}
          refLineLabels={{
            75: { text: 'Extreme Greed', color: '#22c55e', position: 'above' },
            25: { text: 'Extreme Fear', color: '#ef4444', position: 'below' },
          }}
          height={180}
          yMin={0}
          yMax={100}
        />
      )}

      {/* 하단: 해석 */}
      <div className="mt-4 pt-4 border-t border-edge space-y-3">
        {signal && (
          <p className="text-[10px] sm:text-xs text-ink-3 leading-relaxed">
            <span className="font-semibold" style={{ color: signal.color }}>
              {signal.label}:
            </span>{' '}
            {signal.desc}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div
            className={cn(
              'rounded-lg p-2.5 border transition-colors',
              isUp ? 'border-buy-edge bg-buy-bg' : 'border-edge bg-inset'
            )}
          >
            <p className={cn('text-[10px] font-semibold mb-1', isUp ? 'text-buy-text' : 'text-ink-4')}>
              ▲ {config.upLabel}
            </p>
            <p className="text-[10px] sm:text-[11px] text-ink-3 leading-relaxed">{config.upEffect}</p>
          </div>
          <div
            className={cn(
              'rounded-lg p-2.5 border transition-colors',
              isDown ? 'border-sell-edge bg-sell-bg' : 'border-edge bg-inset'
            )}
          >
            <p className={cn('text-[10px] font-semibold mb-1', isDown ? 'text-sell-text' : 'text-ink-4')}>
              ▼ {config.downLabel}
            </p>
            <p className="text-[10px] sm:text-[11px] text-ink-3 leading-relaxed">{config.downEffect}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-ink-4 uppercase tracking-wide mb-1.5">지표 의미</p>
          <p className="text-[10px] sm:text-xs text-ink-3 leading-relaxed">{config.meaning}</p>
        </div>
      </div>
    </div>
  );
};

export default FearGreedCard;
