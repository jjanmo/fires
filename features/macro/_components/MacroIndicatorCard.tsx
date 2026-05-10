'use client';

import { useState, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { INDICATOR_CONFIGS, getSignal, type RangeOption } from '../lib/indicator-config';
import { calcChange } from '../lib/calc-change';
import type { IndicatorId, IndicatorData, ChartPoint } from '../types';
import MacroLineChart from './MacroLineChart';
import MacroBarLineChart from './MacroBarLineChart';
import IndicatorStat from './IndicatorStat';
import IndicatorInterpretation from './IndicatorInterpretation';

type Props = {
  id: IndicatorId;
  data: IndicatorData | null;
  secondaryData?: IndicatorData | null;
};

const SOURCE_LABEL: Record<string, string> = {
  yahoo: 'Yahoo',
  fred: 'FRED',
  ecos: 'ECOS',
  cnn: 'CNN',
  calc: '계산',
};


const slicePoints = (points: ChartPoint[], opt: RangeOption): ChartPoint[] => {
  if (opt.pointsBack !== undefined) return points.slice(-opt.pointsBack);
  return points;
};

type CacheEntry = { points: ChartPoint[]; secondary?: ChartPoint[] }

const MacroIndicatorCard = ({ id, data, secondaryData }: Props) => {
  const config = INDICATOR_CONFIGS[id];
  const [activeRange, setActiveRange] = useState(config.defaultRange);
  const [isLoading, setIsLoading] = useState(false);

  // 범위별 차트 포인트 캐시 — 서버 데이터로 초기화, clientFetch 범위는 패칭 후 추가됨
  const dataCache = useRef(new Map<string, CacheEntry>(
    config.rangeOptions
      .filter((opt) => !opt.clientFetch)
      .map((opt) => [
        opt.label,
        {
          points: slicePoints(data?.points ?? [], opt),
          secondary: config.secondaryId ? slicePoints(secondaryData?.points ?? [], opt) : undefined,
        },
      ])
  ));

  const current = data?.current ?? null;
  const headerPrevDay = data?.prevDay ?? null;
  const change = calcChange(current, headerPrevDay, config.changeType);
  const isUp = change !== null && change > 0;
  const isDown = change !== null && change < 0;
  const signal = getSignal(current, config.signals);

  const prev3MChange = calcChange(current, data?.prev3M ?? null, config.changeType);

  const handleRange = async (opt: RangeOption) => {
    setActiveRange(opt.label);

    if (opt.clientFetch && config.symbol) {
      if (dataCache.current.has(opt.label)) return; // 캐시 히트 → setActiveRange 리렌더로 즉시 표시
      setIsLoading(true);
      try {
        const secondary = config.secondaryId ? INDICATOR_CONFIGS[config.secondaryId].symbol : undefined;
        const params = new URLSearchParams({
          symbol: config.symbol,
          range: opt.apiRange ?? '3y',
          interval: opt.apiInterval ?? '1wk',
        });
        if (secondary) params.set('secondary', secondary);

        const res = await fetch(`/api/macro/chart?${params}`);
        const json = await res.json();
        dataCache.current.set(opt.label, {
          points: json.points ?? [],
          secondary: secondary ? (json.secondaryPoints ?? []) : undefined,
        });
      } catch {
        // 실패 시 캐시 미저장 → 다음 클릭 시 재시도
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentEntry = dataCache.current.get(activeRange);
  const displayPoints: ChartPoint[] = currentEntry?.points ?? [];

  const displaySecondary = (() => {
    if (!config.secondaryId || !config.secondaryColor || !config.formatSecondary) return undefined;
    return {
      points: currentEntry?.secondary ?? [],
      color: config.secondaryColor,
      fill: config.secondaryFill ?? 'transparent',
      label: INDICATOR_CONFIGS[config.secondaryId].title,
      formatValue: config.formatSecondary,
    };
  })();

  return (
    <div id={id} className="rounded-2xl border border-edge bg-card p-4 md:p-5 scroll-mt-16">
      {/* 헤더: 지표명 + 소스 + 현재값 + 변화율 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs sm:text-base font-semibold text-ink-1">{config.title}</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-edge text-ink-4 leading-none shrink-0">
              {SOURCE_LABEL[config.source] ?? config.source}
            </span>
          </div>
          {signal && (
            <p className="text-[10px] sm:text-sm font-medium mt-1 leading-none" style={{ color: signal.color }}>
              {signal.label}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <IndicatorStat
            current={current}
            prevDay={headerPrevDay}
            config={config}
            valueSize="2xl"
          />
        </div>
      </div>

      {/* 범위 탭 */}
      {config.rangeOptions.length > 0 && (
        <div className="flex bg-inset rounded-lg p-0.5 self-start mb-2 w-fit">
          {config.rangeOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleRange(opt)}
              className={cn(
                'px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-md transition-colors cursor-pointer',
                activeRange === opt.label ? 'bg-card text-ink-1 shadow-sm' : 'text-ink-4 hover:text-ink-2'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* 차트 */}
      <div className="relative">
        {isLoading ? (
          <div className="h-[180px] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-ink-4 border-t-transparent animate-spin" />
          </div>
        ) : config.chartVariant === 'bar-line' ? (
          <MacroBarLineChart
            points={displayPoints}
            color={config.color}
            fill={config.fill}
            label={config.title}
            formatValue={config.formatValue}
            refLines={config.refLines}
            height={180}
          />
        ) : (
          <MacroLineChart
            points={displayPoints}
            color={config.color}
            fill={config.fill}
            label={config.title}
            formatValue={config.formatValue}
            variant={config.chartVariant === 'area' || config.chartVariant === 'step' ? config.chartVariant : 'line'}
            secondary={displaySecondary}
            refLines={config.refLines}
            height={180}
          />
        )}
      </div>

      <IndicatorInterpretation
        config={config}
        signal={signal}
        isUp={isUp}
        isDown={isDown}
        prev3MChange={prev3MChange}
      />
    </div>
  );
};

export default MacroIndicatorCard;
