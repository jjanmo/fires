'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import type { RollingWindow } from '@/entities/sigma';
import { useSigmaWindow } from '@/app/sigma/[ticker]/_context/SigmaWindowContext';
import { SIGMA_TOUCH_DARK, SIGMA_TOUCH_LIGHT, getYearFromDate } from './_sigmaTouchUtils';
import SigmaTouchSummary from './SigmaTouchSummary';
import SigmaTouchYearChart from './SigmaTouchYearChart';

const SigmaTouchChart = () => {
  const { selected, historyByWindow, signalsByWindow } = useSigmaWindow();
  const rows = historyByWindow[selected] ?? [];
  const latestSignal = signalsByWindow[selected];

  const s2dPct = latestSignal != null ? latestSignal.s2d.toFixed(2) : null;
  const s1dPct = latestSignal != null ? (latestSignal.mu - latestSignal.sigma).toFixed(2) : null;
  const label2s = s2dPct != null ? `2σ 매수 (${s2dPct}%)` : '2σ 매수';
  const label1s = s1dPct != null ? `1σ 매수 (${s1dPct}%)` : '1σ 매수';

  const years = Array.from(new Set(rows.map((r) => getYearFromDate(r.date)))).sort((a, b) => b.localeCompare(a));
  const tabs = ['all', ...years];

  const [activeTab, setActiveTab]   = useState<'all' | string>('all');
  const prevSelected                = useRef<RollingWindow>(selected);
  const [isDark, setIsDark]         = useState(true);

  useEffect(() => {
    const update = () => setIsDark(!document.documentElement.classList.contains('light'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (prevSelected.current !== selected) {
      prevSelected.current = selected;
      setActiveTab('all');
    }
  }, [selected]);

  const c = isDark ? SIGMA_TOUCH_DARK : SIGMA_TOUCH_LIGHT;

  return (
    <div className="rounded-2xl bg-card border border-edge p-5">
      <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">시그마 터치 차트</p>

      {/* 연도 탭 + 범례 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-inset rounded-lg p-1 w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1 text-[11px] rounded-md transition-colors cursor-pointer',
                activeTab === tab ? 'bg-card text-ink-1 border border-edge font-medium' : 'text-ink-3 hover:text-ink-2'
              )}
            >
              {tab === 'all' ? '전체' : tab}
            </button>
          ))}
        </div>

        {activeTab !== 'all' && (
          <div className="flex items-center gap-3 shrink-0 ml-2">
            {(
              [
                ['buy1s', c.buy1s, label1s],
                ['buy2s', c.buy2s, label2s],
              ] as const
            ).map(([key, color, label]) => (
              <div key={key} className="flex items-center gap-1.5 text-[11px] text-ink-3">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'all' ? (
        <SigmaTouchSummary rows={rows} isDark={isDark} label2s={label2s} label1s={label1s} />
      ) : (
        <SigmaTouchYearChart rows={rows} year={activeTab} isDark={isDark} label2s={label2s} label1s={label1s} />
      )}
    </div>
  );
};

export default SigmaTouchChart;
