'use client';

import { useState, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { INDICATOR_CONFIGS, getSignal, type RangeOption } from '../lib/indicator-config';
import type { IndicatorData, ChartPoint } from '../types';
import MacroLineChart from './MacroLineChart';
import IndicatorStat from './IndicatorStat';
import RateSuiteInterpretation from './RateSuiteInterpretation';

type SuiteId = 'long-rate' | 'short-rate' | 'yield-spread';

const SUITE_IDS: SuiteId[] = ['long-rate', 'short-rate', 'yield-spread'];

// 3M/1Y: 서버 1y/1d 데이터 슬라이싱, 3Y: 클라이언트 3y/1wk on-demand fetch
const RANGE_OPTIONS: RangeOption[] = [
  { label: '3M', pointsBack: 66  },
  { label: '1Y', pointsBack: 252 },
  { label: '3Y', clientFetch: true, apiRange: '3y', apiInterval: '1wk' },
];

const slicePoints = (points: ChartPoint[], n: number): ChartPoint[] => points.slice(-n);

const computeSpread = (primary: ChartPoint[], secondary: ChartPoint[]): ChartPoint[] => {
  const secMap = new Map(secondary.map((p) => [p.date, p.value]));
  return primary.filter((p) => secMap.has(p.date)).map((p) => ({ date: p.date, value: p.value - secMap.get(p.date)! }));
};

type Props = {
  longRate: IndicatorData | null;
  shortRate: IndicatorData | null;
};

const MacroRateSuiteCard = ({ longRate, shortRate }: Props) => {
  const [selected, setSelected] = useState<Set<SuiteId>>(new Set(['long-rate', 'short-rate', 'yield-spread']));
  const [activeRange, setActiveRange] = useState('1Y');
  const [isLoading, setIsLoading] = useState(false);

  // 범위별 차트 포인트 캐시 — 서버 데이터로 초기화, 3Y는 클라이언트 패칭 후 추가됨
  const longCache = useRef(new Map(
    RANGE_OPTIONS
      .filter((opt) => !opt.clientFetch)
      .map((opt) => [opt.label, slicePoints(longRate?.points ?? [], opt.pointsBack ?? 252)])
  ));
  const shortCache = useRef(new Map(
    RANGE_OPTIONS
      .filter((opt) => !opt.clientFetch)
      .map((opt) => [opt.label, slicePoints(shortRate?.points ?? [], opt.pointsBack ?? 252)])
  ));

  const longRateConfig = INDICATOR_CONFIGS['long-rate'];
  const shortRateConfig = INDICATOR_CONFIGS['short-rate'];
  const yieldSpreadConfig = INDICATOR_CONFIGS['yield-spread'];

  const handleRange = async (opt: RangeOption) => {
    setActiveRange(opt.label);

    if (opt.clientFetch) {
      if (longCache.current.has(opt.label)) return; // 캐시 히트 → setActiveRange 리렌더로 즉시 표시
      setIsLoading(true);
      try {
        const interval = opt.apiInterval ?? '1wk';
        const [longRes, shortRes] = await Promise.all([
          fetch(`/api/macro/chart?symbol=${encodeURIComponent('^TNX')}&range=${opt.apiRange}&interval=${interval}`),
          fetch(`/api/macro/chart?symbol=${encodeURIComponent('^IRX')}&range=${opt.apiRange}&interval=${interval}`),
        ]);
        const [longJson, shortJson] = await Promise.all([longRes.json(), shortRes.json()]);
        longCache.current.set(opt.label, longJson.points ?? []);
        shortCache.current.set(opt.label, shortJson.points ?? []);
      } catch {
        // 실패 시 캐시 미저장 → 다음 클릭 시 재시도
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ── 헤더 stat 계산 (stable prevDay 기준, 탭 무관) ──────────────────────────
  const yieldSpreadCurrent =
    longRate?.current != null && shortRate?.current != null
      ? +(longRate.current - shortRate.current).toFixed(3)
      : null;

  const headerLongPrevDay = longRate?.prevDay ?? null;
  const headerShortPrevDay = shortRate?.prevDay ?? null;

  // 장단기 금리차 변화 = 장기 변화 - 단기 변화 (일관된 기준 보장)
  const headerLongChange =
    longRate?.current != null && headerLongPrevDay != null
      ? +(longRate.current - headerLongPrevDay).toFixed(3)
      : null;
  const headerShortChange =
    shortRate?.current != null && headerShortPrevDay != null
      ? +(shortRate.current - headerShortPrevDay).toFixed(3)
      : null;
  const yieldSpreadChange =
    headerLongChange !== null && headerShortChange !== null
      ? +(headerLongChange - headerShortChange).toFixed(3)
      : null;
  const yieldSpreadPrevDay =
    yieldSpreadCurrent !== null && yieldSpreadChange !== null
      ? +(yieldSpreadCurrent - yieldSpreadChange).toFixed(3)
      : null;

  const statCurrents: Record<SuiteId, number | null> = {
    'long-rate': longRate?.current ?? null,
    'short-rate': shortRate?.current ?? null,
    'yield-spread': yieldSpreadCurrent,
  };

  const displayLongRate: ChartPoint[] = longCache.current.get(activeRange) ?? [];
  const displayShortRate: ChartPoint[] = shortCache.current.get(activeRange) ?? [];

  const displayYieldSpread: ChartPoint[] = computeSpread(displayLongRate, displayShortRate);

  const toggleId = (id: SuiteId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const showUpperChart = selected.has('long-rate') || selected.has('short-rate');
  const showLowerChart = selected.has('yield-spread');

  const upperPrimary: ChartPoint[] = selected.has('long-rate') ? displayLongRate : displayShortRate;
  const upperPrimaryConfig = selected.has('long-rate') ? longRateConfig : shortRateConfig;
  const upperSecondary =
    selected.has('long-rate') && selected.has('short-rate')
      ? {
          points: displayShortRate,
          color: shortRateConfig.color,
          fill: shortRateConfig.fill,
          label: shortRateConfig.title,
          formatValue: shortRateConfig.formatValue,
        }
      : undefined;

  return (
    <div className="rounded-2xl border border-edge bg-card p-4 md:p-5 scroll-mt-16 relative">
      {/* 앵커 — 요약 그리드 링크 대응 */}
      <span id="long-rate" className="absolute -top-16" />
      <span id="short-rate" className="absolute -top-16" />
      <span id="yield-spread" className="absolute -top-16" />

      {/* 헤더: 카드 타이틀 + 3개 지표 stat */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-ink-1">미 금리 & 수익률 곡선</p>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {SUITE_IDS.map((id, i) => {
              const cfg = INDICATOR_CONFIGS[id];
              const sig = getSignal(statCurrents[id], cfg.signals);
              return sig ? (
                <span key={id} className="flex items-center gap-1">
                  {i > 0 && <span className="text-ink-4 text-[10px] select-none">·</span>}
                  <span className="text-[10px] sm:text-xs font-medium leading-none" style={{ color: cfg.color }}>
                    {sig.label}
                  </span>
                </span>
              ) : null;
            })}
          </div>
        </div>

        {/* 헤더 stat: 탭과 완전히 독립 */}
        <div className="flex gap-4 shrink-0">
          <IndicatorStat
            current={longRate?.current ?? null}
            prevDay={headerLongPrevDay}
            config={longRateConfig}
          />
          <IndicatorStat
            current={shortRate?.current ?? null}
            prevDay={headerShortPrevDay}
            config={shortRateConfig}
          />
          <IndicatorStat
            current={yieldSpreadCurrent}
            prevDay={yieldSpreadPrevDay}
            config={yieldSpreadConfig}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 mb-1.5">
        {/* 범위 탭 */}
        <div className="flex bg-inset rounded-lg p-0.5 h-fit w-fit">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleRange(opt)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer',
                activeRange === opt.label ? 'bg-card text-ink-1 shadow-sm' : 'text-ink-4 hover:text-ink-2'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 토글 칩 */}
        <div className="flex gap-1.5 flex-wrap">
          {SUITE_IDS.map((id) => {
            const cfg = INDICATOR_CONFIGS[id];
            const isOn = selected.has(id);
            return (
              <button
                key={id}
                onClick={() => toggleId(id)}
                className={cn(
                  'px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-full border transition-colors cursor-pointer',
                  isOn ? 'text-white' : 'border-edge bg-inset text-ink-4 hover:text-ink-2'
                )}
                style={isOn ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
              >
                {cfg.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* 로딩 스피너 */}
      {isLoading && (
        <div className="h-[140px] flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-ink-4 border-t-transparent animate-spin" />
        </div>
      )}

      {/* 상단 차트: 미 장기금리 + 단기금리 */}
      {!isLoading && showUpperChart && (
        <MacroLineChart
          points={upperPrimary}
          color={upperPrimaryConfig.color}
          fill={upperPrimaryConfig.fill}
          label={upperPrimaryConfig.title}
          formatValue={upperPrimaryConfig.formatValue}
          secondary={upperSecondary}
          refLines={selected.has('long-rate') ? longRateConfig.refLines : undefined}
          height={140}
          hideLegend
        />
      )}

      {!isLoading && showUpperChart && showLowerChart && <div className="mt-2 mb-1 border-t border-edge border-dashed" />}

      {/* 하단 차트: 장단기 금리차 */}
      {!isLoading && showLowerChart && (
        <MacroLineChart
          points={displayYieldSpread}
          color={yieldSpreadConfig.color}
          fill={yieldSpreadConfig.fill}
          label={yieldSpreadConfig.title}
          formatValue={yieldSpreadConfig.formatValue}
          variant="area"
          refLines={yieldSpreadConfig.refLines}
          height={100}
        />
      )}

      <RateSuiteInterpretation
        longRate={longRate}
        shortRate={shortRate}
        yieldSpreadCurrent={yieldSpreadCurrent}
        yieldSpreadPrevDay={yieldSpreadPrevDay}
      />
    </div>
  );
};

export default MacroRateSuiteCard;
