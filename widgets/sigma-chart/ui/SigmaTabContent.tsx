'use client';

import { useState } from 'react';
import type { HistoryRow, SignalRow, RollingWindow } from '@/entities/sigma';
import { ROLLING_WINDOWS } from '@/entities/sigma';
import { InfoTooltip } from '@/shared/ui';
import SignalCards from '@/widgets/signal-cards/ui/SignalCards';
import SigmaChart from './SigmaChart';
import SignalHistoryChart from './SignalHistoryChart';

const WINDOW_LABELS: Record<RollingWindow, string> = {
  252: '1년',
  120: '6개월',
  60: '3개월',
  20: '1개월',
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

interface Props {
  signalsByWindow: Record<RollingWindow, HistoryRow | null>;
  signalHistoryByWindow: Record<RollingWindow, SignalRow[]>;
  symbol: string;
}

/** 가장 넓은 롤링 기간(252 → 120 → 60 → 20 순)을 기준으로 X축 고정 범위 계산 */
function calcFixedXRange(signalsByWindow: Record<RollingWindow, HistoryRow | null>) {
  const base = signalsByWindow[252] ?? signalsByWindow[120] ?? signalsByWindow[60] ?? signalsByWindow[20];
  if (!base) return { xMin: undefined, xMax: undefined };
  return {
    xMin: base.mu - 3.8 * base.sigma,
    xMax: base.mu + 3.8 * base.sigma,
  };
}

export default function SigmaTabContent({ signalsByWindow, signalHistoryByWindow, symbol }: Props) {
  const [selected, setSelected] = useState<RollingWindow>(252);

  const latest = signalsByWindow[selected];
  const { xMin, xMax } = calcFixedXRange(signalsByWindow);

  return (
    <div className="space-y-5">
      {/* 롤링 기간 선택 */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-ink-4 uppercase tracking-widest shrink-0">롤링 기간</span>
        <div className="flex gap-1 bg-inset rounded-lg p-0.5 border border-edge">
          {ROLLING_WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setSelected(w)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors duration-150 cursor-pointer border ${
                selected === w
                  ? 'bg-card text-ink-1 shadow-sm border-edge'
                  : 'border-transparent text-ink-3 hover:text-ink-2'
              }`}
            >
              {WINDOW_LABELS[w]}
            </button>
          ))}
        </div>
        <InfoTooltip>
          <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-3">롤링 기간 선택 가이드</p>
          <div className="space-y-3">
            {ROLLING_WINDOWS.map((w) => (
              <div key={w}>
                <p className="text-[12px] font-semibold text-ink-2">
                  {WINDOW_LABELS[w]}{' '}
                  <span className="font-normal text-ink-4">— {WINDOW_GUIDE[w].sub}</span>
                </p>
                <p className="text-[11px] text-ink-3 leading-relaxed mt-0.5">{WINDOW_GUIDE[w].desc}</p>
              </div>
            ))}
          </div>
        </InfoTooltip>
      </div>

      {latest == null ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-[12px] text-amber-500 leading-relaxed">
            선택한 기간({WINDOW_LABELS[selected]})의 데이터가 부족합니다.
          </p>
        </div>
      ) : (
        <>
          <SignalCards latest={latest} symbol={symbol} />
          <SigmaChart latest={latest} symbol={symbol} windowSize={selected} xMin={xMin} xMax={xMax} />
          <SignalHistoryChart rows={signalHistoryByWindow[selected]} windowSize={selected} />
        </>
      )}
    </div>
  );
}
