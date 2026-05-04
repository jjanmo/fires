'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import type { HistoryRow, RollingWindow } from '@/entities/sigma';
import { ROLLING_WINDOWS } from '@/entities/sigma';
import { SigmaWindowContext } from '../_context/SigmaWindowContext';
import { SigmaTabContent } from '@/widgets/sigma-chart';
import SigmaWindowBar from './SigmaWindowBar';

interface Props {
  signalsByWindow: Record<RollingWindow, HistoryRow | null>;
  availableDays: number;
  insufficientData: boolean;
  insufficientMsg?: string;
  symbol: string;
  children?: ReactNode;
}

const SigmaWindowContextProvider = ({
  signalsByWindow,
  availableDays,
  insufficientData,
  insufficientMsg,
  symbol,
  children,
}: Props) => {
  const isEnabled = (w: RollingWindow) => availableDays >= w;
  const defaultWindow = ROLLING_WINDOWS.find(isEnabled) ?? ROLLING_WINDOWS[ROLLING_WINDOWS.length - 1];
  const [selected, setSelected] = useState<RollingWindow>(defaultWindow);

  return (
    <SigmaWindowContext.Provider value={{ selected, setSelected, signalsByWindow, availableDays }}>
      <SigmaWindowBar />
      <div className="space-y-5 pt-6">
        <SigmaTabContent symbol={symbol} insufficientData={insufficientData} insufficientMsg={insufficientMsg} />
        {children}
      </div>
    </SigmaWindowContext.Provider>
  );
};

export default SigmaWindowContextProvider;
