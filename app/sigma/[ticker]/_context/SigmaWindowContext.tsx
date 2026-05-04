'use client';

import { createContext, useContext } from 'react';
import type { HistoryRow, RollingWindow } from '@/entities/sigma';
import { ROLLING_WINDOWS } from '@/entities/sigma';

export interface SigmaWindowContextValue {
  selected: RollingWindow;
  setSelected: (w: RollingWindow) => void;
  signalsByWindow: Record<RollingWindow, HistoryRow | null>;
  availableDays: number;
}

const defaultValue: SigmaWindowContextValue = {
  selected: 252,
  setSelected: () => {},
  signalsByWindow: Object.fromEntries(ROLLING_WINDOWS.map((w) => [w, null])) as unknown as Record<RollingWindow, null>,
  availableDays: 0,
};

export const SigmaWindowContext = createContext<SigmaWindowContextValue>(defaultValue);

export const useSigmaWindow = () => useContext(SigmaWindowContext);
