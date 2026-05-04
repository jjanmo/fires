'use client';

import { createContext, useContext } from 'react';
import type { HistoryRow, SignalRow, RollingWindow } from '@/entities/sigma';
import { ROLLING_WINDOWS } from '@/entities/sigma';

export interface SigmaWindowContextValue {
  selected: RollingWindow;
  setSelected: (w: RollingWindow) => void;
  signalsByWindow: Record<RollingWindow, HistoryRow | null>;
  signalHistoryByWindow: Record<RollingWindow, SignalRow[]>;
  historyByWindow: Record<RollingWindow, HistoryRow[]>;
  availableDays: number;
}

const defaultValue: SigmaWindowContextValue = {
  selected: 252,
  setSelected: () => {},
  signalsByWindow: Object.fromEntries(ROLLING_WINDOWS.map((w) => [w, null])) as unknown as Record<RollingWindow, null>,
  signalHistoryByWindow: Object.fromEntries(ROLLING_WINDOWS.map((w) => [w, []])) as unknown as Record<RollingWindow, SignalRow[]>,
  historyByWindow: Object.fromEntries(ROLLING_WINDOWS.map((w) => [w, []])) as unknown as Record<RollingWindow, HistoryRow[]>,
  availableDays: 0,
};

export const SigmaWindowContext = createContext<SigmaWindowContextValue>(defaultValue);

export const useSigmaWindow = () => useContext(SigmaWindowContext);
