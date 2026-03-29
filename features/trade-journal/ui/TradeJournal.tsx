'use client';

import { useState, useCallback, useTransition } from 'react';
import type { Trade, EnrichedTrade } from '../model/journal';
import { calcStats, enrichTrades } from '../model/journal';
import { addTrade, deleteTrade } from '../actions';
import { useFxRate } from '@/shared/hooks';

interface Props { ticker: string; currentPrice: number; initialTrades: Trade[] }

const today = () => new Date().toISOString().slice(0, 10);

const fmtUSD = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtKRW = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
const sign = (n: number) => (n > 0 ? '+' : '');
const pnlCls = (n: number) => n > 0 ? 'text-gain' : n < 0 ? 'text-loss' : 'text-ink-3';

function PnlCell({ usd, fxRate }: { usd: number; fxRate: number }) {
  return (
    <div>
      <p className={`font-mono font-semibold text-[12px] tabular-nums ${pnlCls(usd)}`}>{sign(usd)}{fmtUSD(usd)}</p>
      <p className={`font-mono text-[11px] tabular-nums ${pnlCls(usd)}`}>{sign(usd)}{fmtKRW(usd * fxRate)}</p>
    </div>
  );
}

function StatCard({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-xl bg-inset border border-edge p-4">
      <p className="text-[11px] text-ink-3 uppercase tracking-wider mb-2">{label}</p>
      {children}
      {note && <p className="text-[10px] text-ink-4 mt-1.5">{note}</p>}
    </div>
  );
}

function TradeRow({ trade, fxRate, onDelete }: { trade: EnrichedTrade; fxRate: number; onDelete: (id: string) => void }) {
  const isBuy = trade.type === 'buy';
  return (
    <tr className="border-t border-edge hover:bg-row-hover transition-colors">
      <td className="px-4 py-2.5 font-mono text-ink-3 text-[11px] whitespace-nowrap">{trade.date}</td>
      <td className="px-3 py-2.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          isBuy
            ? 'text-buy-text bg-buy-badge border-buy-edge'
            : 'text-sell-text bg-sell-badge border-sell-edge'
        }`}>
          {isBuy ? '매수' : '매도'}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-ink-1 tabular-nums text-[12px]">{trade.qty}주</td>
      <td className="px-3 py-2.5 text-right font-mono text-ink-2 tabular-nums text-[12px]">{fmtUSD(trade.price)}</td>
      <td className="px-3 py-2.5 text-right">
        {isBuy ? (
          <div>
            <p className="font-mono text-ink-2 tabular-nums text-[12px]">{fmtUSD(trade.investedUSD)}</p>
            <p className="font-mono text-ink-4 tabular-nums text-[11px]">{fmtKRW(trade.investedUSD * fxRate)}</p>
          </div>
        ) : (
          <PnlCell usd={trade.pnlUSD ?? 0} fxRate={fxRate} />
        )}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-ink-4 tabular-nums text-[11px]">
        {trade.type === 'sell' ? fmtUSD(trade.avgCostAtTime) : '—'}
      </td>
      <td className="px-3 py-2.5 text-ink-4 text-[11px] max-w-[100px] truncate">{trade.memo || '—'}</td>
      <td className="px-4 py-2.5 text-right">
        <button onClick={() => onDelete(trade.id)} className="text-ink-4 hover:text-loss transition-colors text-[12px]">✕</button>
      </td>
    </tr>
  );
}

export default function TradeJournal({ ticker, currentPrice, initialTrades }: Props) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const { rate: fxRate, updatedAt, loading: fxLoading, refresh } = useFxRate();
  const [form, setForm] = useState({ type: 'buy' as 'buy' | 'sell', date: today(), qty: '', price: '', memo: '' });
  const [pending, startTransition] = useTransition();

  const handleAdd = useCallback(() => {
    const qty = parseFloat(form.qty);
    const price = parseFloat(form.price);
    if (!qty || !price || !form.date) return;

    const newTrade: Omit<Trade, 'id'> = { date: form.date, type: form.type, qty, price, memo: form.memo.trim() };
    const optimisticId = crypto.randomUUID();

    setTrades(prev => [...prev, { ...newTrade, id: optimisticId }]);
    setForm(f => ({ ...f, qty: '', price: '', memo: '', date: today() }));

    startTransition(async () => {
      const saved = await addTrade(ticker, newTrade);
      if (saved) {
        setTrades(prev => prev.map(t => t.id === optimisticId ? saved : t));
      }
    });
  }, [form, ticker, startTransition]);

  const handleDelete = useCallback((id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
    startTransition(async () => {
      await deleteTrade(ticker, id);
    });
  }, [ticker, startTransition]);

  const stats = calcStats(trades, currentPrice, fxRate);
  const enriched = enrichTrades(trades).reverse();

  return (
    <div className="space-y-5">
      {/* ── 통계 ── */}
      {trades.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="보유 수량">
              <p className="text-lg font-semibold text-ink-1 tabular-nums">{stats.totalShares}주</p>
              {stats.avgCost > 0 && <p className="text-[11px] text-ink-3 font-mono mt-0.5">평균단가 {fmtUSD(stats.avgCost)}</p>}
            </StatCard>

            <StatCard label="미실현 손익">
              <p className={`text-lg font-semibold tabular-nums ${pnlCls(stats.unrealizedPnlUSD)}`}>
                {sign(stats.unrealizedPnlUSD)}{fmtUSD(stats.unrealizedPnlUSD)}
              </p>
              <p className={`text-[11px] font-mono mt-0.5 ${pnlCls(stats.unrealizedPnlUSD)}`}>
                {sign(stats.unrealizedPnlKRW)}{fmtKRW(stats.unrealizedPnlKRW)}
              </p>
              <p className={`text-[11px] font-mono mt-0.5 ${pnlCls(stats.unrealizedReturnPct)}`}>
                {sign(stats.unrealizedReturnPct)}{stats.unrealizedReturnPct.toFixed(2)}%
              </p>
            </StatCard>

            <StatCard label="실현 손익">
              <p className={`text-lg font-semibold tabular-nums ${pnlCls(stats.realizedPnlUSD)}`}>
                {sign(stats.realizedPnlUSD)}{fmtUSD(stats.realizedPnlUSD)}
              </p>
              <p className={`text-[11px] font-mono mt-0.5 ${pnlCls(stats.realizedPnlUSD)}`}>
                {sign(stats.realizedPnlKRW)}{fmtKRW(stats.realizedPnlKRW)}
              </p>
            </StatCard>

            <StatCard label="총 손익" note="참고용 · 증권사 계산방식에 따라 다를 수 있음">
              <p className={`text-lg font-semibold tabular-nums ${pnlCls(stats.totalPnlUSD)}`}>
                {sign(stats.totalPnlUSD)}{fmtUSD(stats.totalPnlUSD)}
              </p>
              <p className={`text-[11px] font-mono mt-0.5 ${pnlCls(stats.totalPnlUSD)}`}>
                {sign(stats.totalPnlKRW)}{fmtKRW(stats.totalPnlKRW)}
              </p>
            </StatCard>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <p className="text-[11px] text-ink-4 font-mono">
              {fxRate.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/$
              {updatedAt && ` · ${new Date(updatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
            </p>
            <button
              onClick={refresh}
              disabled={fxLoading}
              className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink-1 disabled:opacity-40 transition-colors border border-edge-hi rounded-md px-2 py-1"
            >
              <span className={fxLoading ? 'animate-spin' : ''}>↻</span>
              환율 갱신
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-edge p-8 text-center">
          <p className="text-ink-3 text-sm">아직 매매 내역이 없습니다</p>
          <p className="text-ink-4 text-xs mt-1">아래 폼에서 첫 매매를 기록해보세요</p>
        </div>
      )}

      {/* ── 매매 추가 폼 ── */}
      <div className="rounded-2xl bg-card border border-edge p-5">
        <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">매매 기록 추가</p>

        <div className="flex gap-1 mb-4 bg-inset rounded-lg p-1 w-fit">
          {(['buy', 'sell'] as const).map(t => (
            <button
              key={t}
              onClick={() => setForm(f => ({ ...f, type: t }))}
              className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                form.type === t
                  ? t === 'buy'
                    ? 'bg-buy-badge text-buy-text border border-buy-edge'
                    : 'bg-sell-badge text-sell-text border border-sell-edge'
                  : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {t === 'buy' ? '매수' : '매도'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {([
            { label: '날짜',      key: 'date',  type: 'date',   placeholder: '' },
            { label: '수량 (주)', key: 'qty',   type: 'number', placeholder: '10' },
            { label: '체결가 ($)',key: 'price', type: 'number', placeholder: '0.00' },
            { label: '메모 (선택)',key: 'memo', type: 'text',   placeholder: '2σ 매수 신호' },
          ] as const).map(({ label, key, type, placeholder }) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-[11px] text-ink-3">{label}</span>
              <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="bg-field border border-edge-hi rounded-lg px-3 py-2 text-ink-1 text-sm tabular-nums focus:outline-none focus:border-edge transition-colors placeholder:text-ink-4"
              />
            </label>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={pending}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50 ${
            form.type === 'buy'
              ? 'bg-buy-badge text-buy-text border border-buy-edge hover:bg-buy-bg'
              : 'bg-sell-badge text-sell-text border border-sell-edge hover:bg-sell-bg'
          }`}
        >
          {form.type === 'buy' ? '매수 기록 추가' : '매도 기록 추가'}
        </button>
      </div>

      {/* ── 매매 내역 테이블 ── */}
      {enriched.length > 0 && (
        <div className="rounded-2xl bg-card border border-edge overflow-hidden">
          <div className="px-5 py-4 border-b border-edge">
            <p className="text-[11px] text-ink-3 uppercase tracking-widest">매매 내역</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-ink-4 uppercase tracking-wider border-b border-edge">
                  <th className="px-4 py-3 text-left font-medium">날짜</th>
                  <th className="px-3 py-3 text-left font-medium">유형</th>
                  <th className="px-3 py-3 text-right font-medium">수량</th>
                  <th className="px-3 py-3 text-right font-medium">체결가</th>
                  <th className="px-3 py-3 text-right font-medium">금액 / 손익</th>
                  <th className="px-3 py-3 text-right font-medium">기준단가</th>
                  <th className="px-3 py-3 text-left font-medium">메모</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {enriched.map(t => <TradeRow key={t.id} trade={t} fxRate={fxRate} onDelete={handleDelete} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
