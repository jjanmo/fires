'use client';

import { cn } from '@/shared/lib/cn';
import type { HistoryRowLite } from '@/entities/sigma';
import { SIGMA_FREQUENCY_DARK, SIGMA_FREQUENCY_LIGHT, buildYearSignalRows } from './_sigmaFrequencyUtils';

interface Props {
  rows: HistoryRowLite[];
  isDark: boolean;
  label2s: string;
  label1s: string;
}

const SigmaFrequencySummary = ({ rows, isDark, label2s, label1s }: Props) => {
  const c = isDark ? SIGMA_FREQUENCY_DARK : SIGMA_FREQUENCY_LIGHT;
  const yearRows = buildYearSignalRows(rows);
  const total2s = yearRows.reduce((s, r) => s + r['buy-2s'], 0);
  const total1s = yearRows.reduce((s, r) => s + r['buy-1s'], 0);
  const grandTotal = total1s + total2s;
  const yearCount = yearRows.length;
  const fmtAvg = (x: number) => (yearCount > 0 ? (x / yearCount).toFixed(1) : '0');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ['buy-1s', label1s, total1s, c.buy1s],
            ['buy-2s', label2s, total2s, c.buy2s],
          ] as const
        ).map(([key, label, count, color]) => (
          <div key={key} className="rounded-xl bg-card border border-edge px-4 py-4 text-center">
            <p className="text-[11px] mb-2" style={{ color }}>
              {label}
            </p>
            <p className="text-3xl font-bold tabular-nums" style={{ color }}>
              {count}
            </p>
            <p className="text-[10px] text-ink-4 mt-0.5">회</p>
          </div>
        ))}
      </div>

      {yearRows.length > 0 ? (
        <div className="rounded-xl bg-card border border-edge overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left px-4 py-2.5 text-ink-4 font-medium">연도</th>
                <th className="text-center px-3 py-2.5 font-medium" style={{ color: c.buy1s }}>
                  {label1s}
                </th>
                <th className="text-center px-3 py-2.5 font-medium" style={{ color: c.buy2s }}>
                  {label2s}
                </th>
                <th className="text-center px-4 py-2.5 text-ink-3 font-medium">합계</th>
              </tr>
            </thead>
            <tbody>
              {yearRows.map((yr, idx) => (
                <tr key={yr.year} className={cn('border-b border-edge', idx % 2 === 0 && 'bg-inset/30')}>
                  <td className="px-4 py-2 text-ink-2 font-mono">{yr.year}</td>
                  <td className="text-center px-3 py-2 font-mono tabular-nums">
                    {yr['buy-1s'] > 0 ? (
                      <span style={{ color: c.buy1s }}>{yr['buy-1s']}</span>
                    ) : (
                      <span className="text-ink-4/40">—</span>
                    )}
                  </td>
                  <td className="text-center px-3 py-2 font-mono tabular-nums">
                    {yr['buy-2s'] > 0 ? (
                      <span style={{ color: c.buy2s }}>{yr['buy-2s']}</span>
                    ) : (
                      <span className="text-ink-4/40">—</span>
                    )}
                  </td>
                  <td className="text-center px-4 py-2 font-mono tabular-nums text-ink-2 font-semibold">{yr.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-edge-hi bg-inset/40">
                <td className="px-4 py-2.5 text-ink-3 font-medium">합계</td>
                <td className="text-center px-3 py-2.5 font-mono tabular-nums font-semibold" style={{ color: c.buy1s }}>
                  {total1s}
                </td>
                <td className="text-center px-3 py-2.5 font-mono tabular-nums font-semibold" style={{ color: c.buy2s }}>
                  {total2s}
                </td>
                <td className="text-center px-4 py-2.5 font-mono tabular-nums text-ink-2 font-semibold">
                  {grandTotal}
                </td>
              </tr>
              <tr className="border-b border-edge bg-inset/20">
                <td className="px-4 py-2 text-ink-4 text-[11px]">연평균</td>
                <td className="text-center px-3 py-2 font-mono tabular-nums text-[11px]" style={{ color: c.buy1s }}>
                  {fmtAvg(total1s)}
                </td>
                <td className="text-center px-3 py-2 font-mono tabular-nums text-[11px]" style={{ color: c.buy2s }}>
                  {fmtAvg(total2s)}
                </td>
                <td className="text-center px-4 py-2 font-mono tabular-nums text-ink-3 text-[11px]">
                  {fmtAvg(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-[12px] text-ink-4 text-center py-6">신호 데이터가 없습니다.</p>
      )}
    </div>
  );
};

export default SigmaFrequencySummary;
