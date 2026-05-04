'use client';

import { useState } from 'react';
import type { HistoryRow, SignalRow, RollingWindow } from '@/entities/sigma';
import { ROLLING_WINDOWS } from '@/entities/sigma';
import { SigmaWindowContext } from '../_context/SigmaWindowContext';
import { SigmaTabContent, SigmaTouchChart } from '@/widgets/sigma-chart';
import SigmaWindowBar from './SigmaWindowBar';

interface Props {
  signalsByWindow: Record<RollingWindow, HistoryRow | null>;
  signalHistoryByWindow: Record<RollingWindow, SignalRow[]>;
  historyByWindow: Record<RollingWindow, HistoryRow[]>;
  availableDays: number;
  insufficientData: boolean;
  insufficientMsg?: string;
  symbol: string;
}

const SigmaPageShell = ({
  signalsByWindow,
  signalHistoryByWindow,
  historyByWindow,
  availableDays,
  insufficientData,
  insufficientMsg,
  symbol,
}: Props) => {
  const isEnabled = (w: RollingWindow) => availableDays >= w;
  const defaultWindow = ROLLING_WINDOWS.find(isEnabled) ?? ROLLING_WINDOWS[ROLLING_WINDOWS.length - 1];
  const [selected, setSelected] = useState<RollingWindow>(defaultWindow);

  return (
    <SigmaWindowContext.Provider
      value={{ selected, setSelected, signalsByWindow, signalHistoryByWindow, historyByWindow, availableDays }}
    >
      <SigmaWindowBar />
      <div className="space-y-5 pt-6">
        <SigmaTabContent symbol={symbol} insufficientData={insufficientData} insufficientMsg={insufficientMsg} />
        <SigmaTouchChart />
      </div>
    </SigmaWindowContext.Provider>
  );
};

export default SigmaPageShell;
