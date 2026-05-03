'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { INDICATOR_CONFIGS, getSignal } from '../lib/indicator-config';
import type { IndicatorData } from '../types';

type SuiteId = 'long-rate' | 'short-rate' | 'yield-spread';

const SUITE_IDS: SuiteId[] = ['long-rate', 'short-rate', 'yield-spread'];

type Props = {
  longRate: IndicatorData | null;
  shortRate: IndicatorData | null;
  yieldSpreadCurrent: number | null;
  yieldSpreadPrevDay: number | null;
};

const RateSuiteInterpretation = ({ longRate, shortRate, yieldSpreadCurrent, yieldSpreadPrevDay }: Props) => {
  const [interpretationTab, setInterpretationTab] = useState<SuiteId>('long-rate');

  const interpretationConfig = INDICATOR_CONFIGS[interpretationTab];
  const interpretationCurrent =
    interpretationTab === 'yield-spread'
      ? yieldSpreadCurrent
      : (interpretationTab === 'long-rate' ? longRate?.current : shortRate?.current) ?? null;
  const interpretationPrevDay =
    interpretationTab === 'yield-spread'
      ? yieldSpreadPrevDay
      : interpretationTab === 'long-rate'
      ? longRate?.prevDay ?? null
      : shortRate?.prevDay ?? null;
  const isUp =
    interpretationCurrent !== null && interpretationPrevDay !== null && interpretationCurrent > interpretationPrevDay;
  const isDown =
    interpretationCurrent !== null && interpretationPrevDay !== null && interpretationCurrent < interpretationPrevDay;
  const signal = getSignal(interpretationCurrent, interpretationConfig.signals);

  return (
    <div className="mt-4 pt-4 border-t border-edge space-y-3">
      <div className="flex bg-inset rounded-lg p-0.5 w-fit">
        {SUITE_IDS.map((id) => (
          <button
            key={id}
            onClick={() => setInterpretationTab(id)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer',
              interpretationTab === id ? 'bg-card text-ink-1 shadow-sm' : 'text-ink-4 hover:text-ink-2'
            )}
          >
            {INDICATOR_CONFIGS[id].title}
          </button>
        ))}
      </div>

      {signal && (
        <p className="text-xs text-ink-3 leading-relaxed">
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
            ▲ {interpretationConfig.upLabel}
          </p>
          <p className="text-[11px] text-ink-3 leading-relaxed">{interpretationConfig.upEffect}</p>
        </div>
        <div
          className={cn(
            'rounded-lg p-2.5 border transition-colors',
            isDown ? 'border-sell-edge bg-sell-bg' : 'border-edge bg-inset'
          )}
        >
          <p className={cn('text-[10px] font-semibold mb-1', isDown ? 'text-sell-text' : 'text-ink-4')}>
            ▼ {interpretationConfig.downLabel}
          </p>
          <p className="text-[11px] text-ink-3 leading-relaxed">{interpretationConfig.downEffect}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-ink-4 uppercase tracking-wide mb-1.5">지표 의미</p>
        <p className="text-xs text-ink-3 leading-relaxed">{interpretationConfig.meaning}</p>
      </div>
    </div>
  );
};

export default RateSuiteInterpretation;
