'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { HistoryRowLite } from '@/entities/sigma';
import {
  SIGMA_FREQUENCY_DARK,
  SIGMA_FREQUENCY_LIGHT,
  generateFullYearDates,
  getYearFromDate,
} from './_sigmaFrequencyUtils';

ChartJS.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip);

const Y_AXIS_GRACE = '12%';

const FOOTER_LABEL_BUY_1S = '1σ 매수';
const FOOTER_LABEL_BUY_2S = '2σ 매수';

const formatSignedPct = (n: number | null | undefined) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
};

interface Props {
  rows: HistoryRowLite[];
  year: string;
  isDark: boolean;
  label2s: string;
  label1s: string;
}

const SigmaFrequencyYearChart = ({ rows, year, isDark, label2s, label1s }: Props) => {
  const c = isDark ? SIGMA_FREQUENCY_DARK : SIGMA_FREQUENCY_LIGHT;
  const yearRows = rows.filter((r) => getYearFromDate(r.date) === year);
  const fullDates = generateFullYearDates(year);
  const rowMap = new Map(yearRows.map((r) => [r.date, r]));

  const closeData = fullDates.map((d) => rowMap.get(d)?.close ?? null);
  const buy2sData = fullDates.map((d) => {
    const r = rowMap.get(d);
    return r?.triggered === 'buy-2s' ? r.close : null;
  });
  const buy1sData = fullDates.map((d) => {
    const r = rowMap.get(d);
    return r?.triggered === 'buy-1s' ? r.close : null;
  });

  const count2s = buy2sData.filter(Boolean).length;
  const count1s = buy1sData.filter(Boolean).length;

  const radius2s = buy2sData.map((v) => (v !== null ? 4 : 0));
  const hover2s = buy2sData.map((v) => (v !== null ? 6 : 0));
  const radius1s = buy1sData.map((v) => (v !== null ? 4 : 0));
  const hover1s = buy1sData.map((v) => (v !== null ? 6 : 0));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datasets: any[] = [
    {
      type: 'line',
      label: '종가',
      data: closeData,
      borderColor: c.close,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.1,
      spanGaps: true,
      order: 2,
    },
    {
      type: 'line',
      label: label2s,
      data: buy2sData,
      borderColor: 'transparent',
      backgroundColor: c.buy2s,
      pointBackgroundColor: c.buy2s,
      pointBorderColor: 'transparent',
      pointRadius: radius2s,
      pointHoverRadius: hover2s,
      showLine: false,
      spanGaps: false,
      order: 1,
    },
    {
      type: 'line',
      label: label1s,
      data: buy1sData,
      borderColor: 'transparent',
      backgroundColor: c.buy1s,
      pointBackgroundColor: c.buy1s,
      pointBorderColor: 'transparent',
      pointRadius: radius1s,
      pointHoverRadius: hover1s,
      showLine: false,
      spanGaps: false,
      order: 1,
    },
  ];

  return (
    <>
      <div className="h-64">
        <Chart
          key={`${year}-${isDark}`}
          type="line"
          data={{ labels: fullDates, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: c.tooltipBg,
                titleColor: c.tooltipTitle,
                bodyColor: c.tooltipBody,
                borderColor: c.tooltipBorder,
                borderWidth: 1,
                padding: 10,
                filter: (item) => item.parsed.y !== null && item.parsed.y !== undefined,
                callbacks: {
                  title: (items) => fullDates[items[0].dataIndex] ?? '',
                  label: (ctx) => {
                    const y = ctx.parsed.y as number | null;
                    if (y === null || y === undefined) return '';
                    if (ctx.datasetIndex === 0) return undefined;
                    const lbl = ctx.datasetIndex === 1 ? label2s : label1s;
                    return ` ${lbl}`;
                  },
                  afterBody: (items) => {
                    const idx = items[0]?.dataIndex;
                    if (idx === undefined) return '';
                    const row = rowMap.get(fullDates[idx]);
                    if (!row) return '';
                    return [
                      '',
                      ` 저가: ${row.low.toLocaleString()} (전일대비 ${formatSignedPct(row.lowReturn)})`,
                      ` 종가: ${row.close.toLocaleString()} (전일대비 ${formatSignedPct(row.actualReturn)})`,
                    ];
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { color: c.grid },
                ticks: {
                  color: c.ticks,
                  font: { size: 10 },
                  maxRotation: 0,
                  autoSkip: false,
                  callback: (_, idx) => {
                    const date = fullDates[idx];
                    if (!date) return '';
                    const month = date.slice(5, 7);
                    const prevMonth = fullDates[idx - 1]?.slice(5, 7);
                    return prevMonth !== month ? `${parseInt(month)}월` : '';
                  },
                },
              },
              y: {
                position: 'right',
                grace: Y_AXIS_GRACE,
                grid: { color: c.grid },
                ticks: { color: c.ticks, font: { size: 10 }, callback: (v) => `$${Number(v).toLocaleString()}` },
              },
            },
          }}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-edge grid grid-cols-2 gap-2 text-center">
        {(
          [
            ['buy-1s', FOOTER_LABEL_BUY_1S, count1s, c.buy1s],
            ['buy-2s', FOOTER_LABEL_BUY_2S, count2s, c.buy2s],
          ] as const
        ).map(([key, label, count, color]) => (
          <div key={key}>
            <p className="text-[10px] tracking-wider mb-1 normal-case" style={{ color }}>
              {label}
            </p>
            <p className="text-xl font-semibold tabular-nums" style={{ color }}>
              {count}
            </p>
            <p className="text-[10px] text-ink-4">회</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default SigmaFrequencyYearChart;
