'use client';

import type { HistoryRowLite, RollingWindow, SignalRow } from '@/entities/sigma';
import { SigmaFrequencyChart, SignalHistoryChart } from '@/widgets/sigma-chart';
import { useSigmaWindow } from '../_context/SigmaWindowContext';

interface Props {
  signalHistoryByWindow: Record<RollingWindow, SignalRow[]>;
  historyByWindow: Record<RollingWindow, HistoryRowLite[]>;
}

const SigmaChartsLower = ({ signalHistoryByWindow, historyByWindow }: Props) => {
  const { selected } = useSigmaWindow();

  return (
    <div className="space-y-5">
      <SignalHistoryChart rows={signalHistoryByWindow[selected]} windowSize={selected} />
      <SigmaFrequencyChart rows={historyByWindow[selected] ?? []} />
    </div>
  );
};

export default SigmaChartsLower;
