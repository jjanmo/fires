'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import type { RollingWindow } from '@/entities/sigma';
import { ROLLING_WINDOWS } from '@/entities/sigma';
import { RollingGuideModal } from '@/shared/ui';
import { useSigmaWindow } from '../_context/SigmaWindowContext';

const WINDOW_LABELS: Record<RollingWindow, string> = {
  252: '1년',
  120: '6개월',
  60: '3개월',
  20: '1개월',
};

const WINDOW_DAYS: Record<RollingWindow, string> = {
  252: '252일',
  120: '120일',
  60: '60일',
  20: '20일',
};

const WINDOW_GUIDE: Record<RollingWindow, { sub: string; desc: string }> = {
  252: {
    sub: '252 거래일 · 기본값',
    desc: '1년치 데이터를 기준으로 삼아 계절 흐름과 시장 사이클을 반영합니다. 평상시 매매 기준으로 가장 안정적입니다.',
  },
  120: {
    sub: '120 거래일',
    desc: '최근 반년의 흐름을 반영합니다. 금리 변화나 특정 섹터 이슈가 있을 때 유용합니다.',
  },
  60: {
    sub: '60 거래일',
    desc: '최근 3개월의 주가 흐름을 기준으로 합니다. 분기 실적 발표 전후처럼 중기 변동성을 파악할 때 적합합니다.',
  },
  20: {
    sub: '20 거래일',
    desc: '최근 한 달의 움직임만 반영합니다. 전쟁·정책 급변처럼 단기 충격이 큰 시기의 현재 상황을 빠르게 파악할 수 있습니다.',
  },
};

const SigmaWindowBar = () => {
  const { selected, setSelected, availableDays } = useSigmaWindow();
  const isEnabled = (w: RollingWindow) => availableDays >= w;

  const disabledWindows = ROLLING_WINDOWS.filter((w) => !isEnabled(w));
  const activeIdx = ROLLING_WINDOWS.indexOf(selected);
  const BTN_W = 68;

  const [isAtTop, setIsAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setIsAtTop(window.scrollY < 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="sticky top-12 z-10 bg-canvas/95 backdrop-blur-sm border-b border-edge mb-0">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-1">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex shrink-0 bg-inset rounded-lg border border-edge p-1">
            <div
              className="absolute top-0.5 bottom-0.5 rounded-md bg-card border border-edge shadow-sm pointer-events-none transition-transform duration-200 ease-out"
              style={{
                width: BTN_W - 1,
                transform: `translateX(calc(${activeIdx * BTN_W}px + ${activeIdx}px))`,
              }}
            />

            {ROLLING_WINDOWS.map((w) => {
              const enabled = isEnabled(w);
              const isActive = selected === w;
              return (
                <button
                  key={w}
                  onClick={() => enabled && setSelected(w)}
                  disabled={!enabled}
                  style={{ width: BTN_W }}
                  className={cn(
                    'relative z-10 flex shrink-0 flex-col items-center justify-center rounded-md py-1 transition-colors duration-150',
                    !enabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] font-medium leading-none transition-colors duration-150',
                      !enabled ? 'text-ink-4/30' : isActive ? 'text-ink-1' : 'text-ink-3'
                    )}
                  >
                    {WINDOW_LABELS[w]}
                  </span>
                  <span
                    className={cn(
                      'text-[9px] leading-none mt-0.5 transition-colors duration-150 tabular-nums',
                      !enabled ? 'text-ink-4/20' : isActive ? 'text-ink-3' : 'text-ink-4'
                    )}
                  >
                    {WINDOW_DAYS[w]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 비활성 안내 */}
          {disabledWindows.length > 0 && (
            <p className="hidden text-[11px] text-ink-4 sm:block">
              데이터 부족 <br />
              <span className="opacity-50">{disabledWindows.map((w) => WINDOW_LABELS[w]).join(' · ')}</span>
            </p>
          )}
        </div>

        {/* 최상단이 아니면 레이아웃에서 제거 — w-0 + 긴 라벨이 줄바꿈되며 행 높이가 비정상적으로 커지는 현상 방지 */}
        <div
          className={cn('shrink-0 self-end sm:self-auto sm:translate-y-[4px]', isAtTop ? 'overflow-visible' : 'hidden')}
        >
          <RollingGuideModal>
            <div className="space-y-3">
              {ROLLING_WINDOWS.map((w) => (
                <div key={w}>
                  <p className="text-[12px] font-semibold text-ink-2">
                    {WINDOW_LABELS[w]} <span className="font-normal text-ink-4">— {WINDOW_GUIDE[w].sub}</span>
                  </p>
                  <p className="text-[11px] text-ink-3 leading-relaxed mt-0.5">{WINDOW_GUIDE[w].desc}</p>
                </div>
              ))}
            </div>
          </RollingGuideModal>
        </div>
      </div>
    </div>
  );
};

export default SigmaWindowBar;
