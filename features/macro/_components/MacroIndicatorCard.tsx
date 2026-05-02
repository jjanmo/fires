'use client';

import { useState } from 'react';
import { useEffectOnce } from '@/shared/hooks';
import { cn } from '@/shared/lib/cn';
import { INDICATOR_CONFIGS, getSignal, type RangeOption } from '../lib/indicator-config';
import type { IndicatorId, IndicatorData, ChartPoint } from '../types';
import MacroLineChart from './MacroLineChart';
import MacroBarLineChart from './MacroBarLineChart';
import IndicatorStat from './IndicatorStat';

type Props = {
  id: IndicatorId;
  data: IndicatorData | null;
  secondaryData?: IndicatorData | null;
};

const calcChange = (current: number | null, prev: number | null, type: 'pct' | 'pp') => {
  if (current === null || prev === null) return null;
  if (type === 'pp') return +(current - prev).toFixed(3);
  if (prev === 0) return null;
  return +(((current - prev) / prev) * 100).toFixed(2);
};

const fmtChange = (change: number | null, type: 'pct' | 'pp') => {
  if (change === null) return null;
  const sign = change > 0 ? '+' : '';
  return type === 'pp' ? `${sign}${change.toFixed(2)}%p` : `${sign}${change.toFixed(2)}%`;
};
// fmtChange는 3개월 비교 표시에 사용됨

const slicePoints = (points: ChartPoint[], opt: RangeOption): ChartPoint[] => {
  if (opt.weeksBack !== undefined) return points.slice(-opt.weeksBack);
  if (opt.pointsBack !== undefined) return points.slice(-opt.pointsBack);
  return points;
};

const SOURCE_LABEL: Record<string, string> = {
  yahoo: 'Yahoo',
  fred: 'FRED',
  ecos: 'ECOS',
  cnn: 'CNN',
  calc: '계산',
};

const MacroIndicatorCard = ({ id, data, secondaryData }: Props) => {
  const config = INDICATOR_CONFIGS[id];
  const [activeRange, setActiveRange] = useState(config.defaultRange);
  const [fetchedPoints, setFetchedPoints] = useState<ChartPoint[] | null>(null);
  const [fetchedSecondary, setFetchedSecondary] = useState<ChartPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const current = data?.current ?? null;
  const headerPrevDay = data?.prevDay ?? null;
  // 방향 카드(isUp/isDown)도 동일 기준
  const change = calcChange(current, headerPrevDay, config.changeType);
  const isUp = change !== null && change > 0;
  const isDown = change !== null && change < 0;
  const signal = getSignal(current, config.signals);

  const prev3MChange = calcChange(current, data?.prev3M ?? null, config.changeType);
  const prev3MIsUp = prev3MChange !== null && prev3MChange > 0;
  const prev3MIsDown = prev3MChange !== null && prev3MChange < 0;
  const prev3MChangeStr = fmtChange(prev3MChange, config.changeType);

  const handleRange = async (opt: RangeOption) => {
    setActiveRange(opt.label);
    setFetchedPoints(null);
    setFetchedSecondary(null);

    if (opt.dailyApiCall && config.symbol) {
      setIsLoading(true);
      try {
        const secondary = config.secondaryId ? INDICATOR_CONFIGS[config.secondaryId].symbol : undefined;
        const params = new URLSearchParams({
          symbol: config.symbol,
          range: opt.apiRange ?? '1mo',
          interval: '1d',
        });
        if (secondary) params.set('secondary', secondary);

        const res = await fetch(`/api/macro/chart?${params}`);
        const json = await res.json();
        const pts: ChartPoint[] = json.points ?? [];
        setFetchedPoints(pts);
        if (secondary) setFetchedSecondary(json.secondaryPoints ?? []);
      } catch {
        // 실패 시 pre-fetch 데이터 유지
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 마운트 시 기본 범위가 일봉이면 즉시 fetch — 차트 일봉 표시
  useEffectOnce(() => {
    const defaultOpt = config.rangeOptions.find((r) => r.label === activeRange);
    if (defaultOpt?.dailyApiCall) handleRange(defaultOpt);
  });

  const currentOpt = config.rangeOptions.find((r) => r.label === activeRange);

  const displayPoints: ChartPoint[] = (() => {
    if (fetchedPoints !== null) return fetchedPoints;
    if (!data?.points.length) return [];
    if (!currentOpt) return data.points;
    return slicePoints(data.points, currentOpt);
  })();

  const displaySecondary = (() => {
    if (!config.secondaryId || !config.secondaryColor || !config.formatSecondary) return undefined;
    const secData =
      fetchedSecondary !== null
        ? fetchedSecondary
        : (() => {
            if (!secondaryData?.points.length) return [];
            if (!currentOpt) return secondaryData.points;
            return slicePoints(secondaryData.points, currentOpt);
          })();
    return {
      points: secData,
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
            <p className="text-xs sm:text-sm font-semibold text-ink-1">{config.title}</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-edge text-ink-4 leading-none shrink-0">
              {SOURCE_LABEL[config.source] ?? config.source}
            </span>
          </div>
          {signal && (
            <p className="text-[10px] sm:text-xs font-medium mt-1 leading-none" style={{ color: signal.color }}>
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
                'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer',
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

      {/* 하단: 해석 영역 */}
      <div className="mt-4 pt-4 border-t border-edge space-y-3">
        {/* 자연어 요약 + 역사 비교 */}
        {signal && (
          <div>
            <p className="text-[10px] sm:text-xs text-ink-3 leading-relaxed">
              <span className="font-semibold" style={{ color: signal.color }}>
                {signal.label}:
              </span>{' '}
              {signal.desc}
            </p>
            {prev3MChangeStr !== null && (
              <p className="text-[10px] sm:text-[11px] text-ink-4 mt-1.5">
                3개월 전 대비{' '}
                <span
                  className={cn(
                    'font-medium',
                    prev3MIsUp ? 'text-buy-text' : prev3MIsDown ? 'text-sell-text' : 'text-ink-3'
                  )}
                >
                  {prev3MIsUp ? '▲' : prev3MIsDown ? '▼' : '–'} {prev3MChangeStr.replace(/^[+-]/, '')}
                </span>
              </p>
            )}
          </div>
        )}

        {/* 방향 영향 카드 */}
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

        {/* 지표 의미 */}
        <div>
          <p className="text-[10px] font-semibold text-ink-4 uppercase tracking-wide mb-1.5">지표 의미</p>
          <p className="text-[10px] sm:text-xs text-ink-3 leading-relaxed">{config.meaning}</p>
        </div>
      </div>
    </div>
  );
};

export default MacroIndicatorCard;
