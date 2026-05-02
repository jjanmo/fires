import { fetchAllChartData } from '../api/fetch-chart-data';
import { GROUPS } from '../lib/group-config';
import type { DataSourceId } from '../types';
import MacroGroupSection from './MacroGroupSection';
import MacroSummaryGrid from './MacroSummaryGrid';

const SOURCES: { id: DataSourceId; label: string; interval: string }[] = [
  { id: 'yahoo', label: 'Yahoo', interval: '15분' },
  { id: 'fred', label: 'FRED', interval: '24시간' },
  { id: 'ecos', label: 'ECOS', interval: '24시간' },
  { id: 'cnn', label: 'CNN', interval: '1시간' },
];

const MacroIndicatorSection = async () => {
  const data = await fetchAllChartData();
  const { sourceErrors } = data;
  const errorEntries = SOURCES.filter(({ id }) => sourceErrors[id]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-ink-1">매크로 대시보드</h2>

        {/* 모바일: 타이틀 아래 / 데스크탑: 우측 정렬 */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <div className="flex items-center gap-2">
            {SOURCES.map(({ id, label, interval }) => {
              const hasErr = Boolean(sourceErrors[id]);
              return (
                <span
                  key={id}
                  className={hasErr ? 'text-[10px] text-sell-text' : 'text-[10px] text-ink-4'}
                >
                  {label}
                  <span className={hasErr ? 'text-sell-text' : 'text-ink-5'}>
                    {hasErr ? ' ⚠' : ` (${interval})`}
                  </span>
                </span>
              );
            })}
          </div>

          {/* 에러 상세: 오류 소스가 있을 때만 표시 */}
          {errorEntries.length > 0 && (
            <div className="flex flex-col items-end gap-0.5">
              {errorEntries.map(({ id, label }) => (
                <p key={id} className="text-[10px] text-sell-text leading-tight">
                  {label}: {sourceErrors[id]}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <MacroSummaryGrid data={data} />

      {GROUPS.map((group) => (
        <MacroGroupSection key={group.id} group={group} data={data} />
      ))}
    </section>
  );
};

export default MacroIndicatorSection;
