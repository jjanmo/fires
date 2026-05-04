import type { ClosePrice, HistoryRow, HistoryRowLite, RollingWindow, SignalRow } from '@/entities/sigma';
import {
  buildHistory,
  buildSignalHistory,
  ROLLING_WINDOWS,
  stripHistoryRows,
} from '@/entities/sigma';
import SigmaChartsLower from '@/app/sigma/[ticker]/_components/SigmaChartsLower';

interface Props {
  closes: ClosePrice[];
  signalsByWindow: Record<RollingWindow, HistoryRow | null>;
}

const SigmaDeferredCharts = async ({ closes, signalsByWindow }: Props) => {
  const signalHistoryByWindow = Object.fromEntries(
    ROLLING_WINDOWS.map((w) => [w, signalsByWindow[w] ? buildSignalHistory(closes, signalsByWindow[w]!, 30) : []])
  ) as Record<RollingWindow, SignalRow[]>;

  const historyByWindow = Object.fromEntries(
    ROLLING_WINDOWS.map((w) => [w, stripHistoryRows(buildHistory(closes, w))])
  ) as Record<RollingWindow, HistoryRowLite[]>;

  return <SigmaChartsLower signalHistoryByWindow={signalHistoryByWindow} historyByWindow={historyByWindow} />;
};

export default SigmaDeferredCharts;
