'use client';

import type { RollingWindow } from '@/entities/sigma';
import { useSigmaWindow } from '@/app/sigma/[ticker]/_context/SigmaWindowContext';
import SignalCards from '@/widgets/signal-cards/ui/SignalCards';
import SigmaChart from './SigmaChart';
import SigmaWarning from '@/app/sigma/[ticker]/_components/SigmaWarning';

const WINDOW_LABELS: Record<RollingWindow, string> = {
  252: '1년',
  120: '6개월',
  60: '3개월',
  20: '1개월',
};

/** 가장 넓은 롤링 기간(252 → 120 → 60 → 20 순)을 기준으로 X축 고정 범위 계산 */
const calcFixedXRange = (signalsByWindow: Record<RollingWindow, { mu: number; sigma: number } | null>) => {
  const base = signalsByWindow[252] ?? signalsByWindow[120] ?? signalsByWindow[60] ?? signalsByWindow[20];
  if (!base) return { xMin: undefined, xMax: undefined };
  return {
    xMin: base.mu - 3.8 * base.sigma,
    xMax: base.mu + 3.8 * base.sigma,
  };
}

interface Props {
  symbol: string;
  insufficientData: boolean;
  insufficientMsg?: string;
}

const SigmaTabContent = ({ symbol, insufficientData, insufficientMsg }: Props) => {
  const { selected, signalsByWindow } = useSigmaWindow();
  const latest = signalsByWindow[selected];
  const { xMin, xMax } = calcFixedXRange(signalsByWindow);

  if (insufficientData) {
    return <SigmaWarning message={insufficientMsg ?? 'σ 계산에 필요한 데이터가 부족합니다.'} />;
  }

  return (
    <div className="space-y-5">
      {insufficientMsg && <SigmaWarning message={insufficientMsg} />}

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
        </>
      )}
    </div>
  );
};

export default SigmaTabContent;
