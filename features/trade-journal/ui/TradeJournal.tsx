"use client";

import { useState, useCallback, useTransition } from "react";
import type { Trade, EnrichedTrade } from "../model/journal";
import { calcStats, enrichTrades } from "../model/journal";
import { addTrade, updateTrade, deleteTrade } from "../actions";
import { useFxRate } from "@/shared/hooks";
import { isKoreanTicker, formatPrice as fmtTickerPrice } from "@/shared/lib/ticker";

interface Props {
  ticker: string;
  symbol: string;
  currentPrice: number;
  initialTrades: Trade[];
}

const today = () => new Date().toISOString().slice(0, 10);

const fmtUSD = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtUSD4 = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
const fmtKRW = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const fmtQty = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 6 });
const sign = (n: number) => (n > 0 ? "+" : "");
const pnlCls = (n: number) =>
  n > 0 ? "text-gain" : n < 0 ? "text-loss" : "text-ink-3";

/* ── 편집 가능한 테이블 Row ── */
function TradeRow({
  trade,
  symbol,
  onEdit,
  onDelete,
}: {
  trade: EnrichedTrade;
  symbol: string;
  onEdit: (id: string, fields: Partial<Omit<Trade, "id">>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    date: trade.date,
    type: trade.type,
    qty: String(trade.qty),
    price: String(trade.price),
    memo: trade.memo,
  });
  const isBuy = trade.type === "buy";

  const handleSave = () => {
    const qty = parseFloat(draft.qty);
    const price = parseFloat(draft.price);
    if (!qty || !price || !draft.date) return;
    onEdit(trade.id, {
      date: draft.date,
      type: draft.type,
      qty,
      price,
      memo: draft.memo.trim(),
    });
    setEditing(false);
  };

  const inputCls =
    "bg-field border border-edge-hi rounded-md px-2 py-1.5 text-ink-1 text-[11px] font-mono focus:outline-none focus:border-edge transition-colors";

  if (editing) {
    return (
      <tr className="border-t border-edge bg-inset/50">
        <td className="py-2 pl-4 pr-2">
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
            className={`${inputCls} w-full`}
          />
        </td>
        <td className="py-2 px-2">
          <select
            value={draft.type}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                type: e.target.value as "buy" | "sell",
              }))
            }
            className={`${inputCls} w-full`}
          >
            <option value="buy">매수</option>
            <option value="sell">매도</option>
          </select>
        </td>
        <td className="py-2 px-2">
          <input
            type="number"
            step="0.000001"
            value={draft.qty}
            onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
            className={`${inputCls} w-full text-right`}
          />
        </td>
        <td className="py-2 px-2">
          <input
            type="number"
            step="0.01"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            className={`${inputCls} w-full text-right`}
          />
        </td>
        <td className="py-2 px-2">
          <input
            type="text"
            value={draft.memo}
            onChange={(e) => setDraft((d) => ({ ...d, memo: e.target.value }))}
            placeholder="메모"
            className={`${inputCls} w-full text-right`}
          />
        </td>
        <td className="py-2 pl-2 pr-4">
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="cursor-pointer flex-1 text-[10px] font-medium rounded-md px-2.5 py-1 bg-buy-badge text-buy-text border border-buy-edge hover:bg-buy-bg transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => {
                setDraft({
                  date: trade.date,
                  type: trade.type,
                  qty: String(trade.qty),
                  price: String(trade.price),
                  memo: trade.memo,
                });
                setEditing(false);
              }}
              className="cursor-pointer flex-1 text-[10px] font-medium rounded-md px-2.5 py-1 bg-inset text-ink-3 border border-edge hover:text-ink-1 transition-colors"
            >
              취소
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group border-t border-edge hover:bg-row-hover transition-colors duration-150">
      <td className="py-2.5 pl-4 pr-2 font-mono text-ink-3 text-[11px] whitespace-nowrap">
        {trade.date}
      </td>
      <td className="py-2.5 px-2">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            isBuy
              ? "text-buy-text bg-buy-badge border-buy-edge"
              : "text-sell-text bg-sell-badge border-sell-edge"
          }`}
        >
          {isBuy ? "매수" : "매도"}
        </span>
      </td>
      <td className="py-2.5 px-2 text-right font-mono text-ink-1 tabular-nums text-[12px]">
        {fmtQty(trade.qty)}주
      </td>
      <td className="py-2.5 px-2 text-right font-mono text-ink-2 tabular-nums text-[12px]">
        {fmtTickerPrice(trade.price, symbol)}
      </td>
      <td className="py-2.5 px-2 text-ink-4 text-[11px] truncate text-right">
        {trade.memo || "—"}
      </td>
      <td className="py-2.5 pl-2 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => setEditing(true)}
            className="cursor-pointer flex-1 text-[10px] font-medium rounded-md px-2.5 py-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/30 hover:bg-amber-100 dark:hover:bg-amber-400/20 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => {
              if (window.confirm("해당 매매 기록을 삭제하시겠습니까?"))
                onDelete(trade.id);
            }}
            className="cursor-pointer flex-1 text-[10px] font-medium rounded-md px-2.5 py-1 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/30 hover:bg-red-100 dark:hover:bg-red-400/20 transition-colors"
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TradeJournal({
  ticker,
  symbol,
  currentPrice,
  initialTrades,
}: Props) {
  const isKR = isKoreanTicker(symbol);
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const { rate: fxRate, updatedAt, loading: fxLoading, refresh } = useFxRate();
  const [form, setForm] = useState({
    type: "buy" as "buy" | "sell",
    date: today(),
    qty: "",
    price: "",
    memo: "",
  });
  const [pending, startTransition] = useTransition();

  const handleAdd = useCallback(() => {
    const qty = parseFloat(form.qty);
    const price = parseFloat(form.price);
    if (!qty || !price || !form.date) return;

    const newTrade: Omit<Trade, "id"> = {
      date: form.date,
      type: form.type,
      qty,
      price,
      memo: form.memo.trim(),
    };
    const optimisticId = crypto.randomUUID();

    setTrades((prev) => [...prev, { ...newTrade, id: optimisticId }]);
    setForm((f) => ({ ...f, qty: "", price: "", memo: "", date: today() }));

    startTransition(async () => {
      const saved = await addTrade(ticker, newTrade);
      if (saved) {
        setTrades((prev) =>
          prev.map((t) => (t.id === optimisticId ? saved : t)),
        );
      }
    });
  }, [form, ticker, startTransition]);

  const handleEdit = useCallback(
    (id: string, fields: Partial<Omit<Trade, "id">>) => {
      setTrades((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...fields } : t)),
      );
      startTransition(async () => {
        const saved = await updateTrade(ticker, id, fields);
        if (saved) {
          setTrades((prev) => prev.map((t) => (t.id === id ? saved : t)));
        }
      });
    },
    [ticker, startTransition],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setTrades((prev) => prev.filter((t) => t.id !== id));
      startTransition(async () => {
        await deleteTrade(ticker, id);
      });
    },
    [ticker, startTransition],
  );

  // 국내주식: 이미 KRW이므로 fxRate=1, 해외주식: 실제 환율 적용
  const effectiveFxRate = isKR ? 1 : fxRate;
  const stats = calcStats(trades, currentPrice, effectiveFxRate);
  // 국내주식 통화 포맷 헬퍼
  const fmtAmt = (n: number) => isKR ? fmtKRW(n) : fmtUSD(n);
  const fmtAmt4 = (n: number) => isKR ? fmtKRW(n) : fmtUSD4(n);
  const enriched = enrichTrades(trades).reverse();

  return (
    <div className="space-y-5">
      {/* ── 포지션 요약 ── */}
      {trades.length > 0 ? (
        <div className="space-y-3">
          {/* 상단 카드: 수익률 + 평균단가 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`rounded-2xl p-5 border ${
                stats.unrealizedReturnPct >= 0
                  ? "bg-buy-bg border-buy-edge"
                  : "bg-sell-bg border-sell-edge"
              }`}
            >
              <p className="text-[10px] text-ink-4 uppercase tracking-wider mb-1">
                수익률
              </p>
              <p
                className={`text-3xl font-bold tabular-nums font-mono ${pnlCls(stats.unrealizedReturnPct)}`}
              >
                {sign(stats.unrealizedReturnPct)}
                {stats.unrealizedReturnPct.toFixed(2)}%
              </p>
              <p
                className={`text-[11px] font-mono tabular-nums mt-1 ${pnlCls(stats.unrealizedPnlUSD)}`}
              >
                {sign(stats.unrealizedPnlUSD)}
                {fmtAmt(stats.unrealizedPnlUSD)}
                {!isKR && <span className="text-[10px] ml-1">({sign(stats.unrealizedPnlKRW)}{fmtKRW(stats.unrealizedPnlKRW)})</span>}
              </p>
            </div>
            <div className="rounded-2xl bg-card border border-edge p-5">
              <p className="text-[10px] text-ink-4 uppercase tracking-wider mb-1">
                평균단가
              </p>
              <p className="text-3xl font-bold tabular-nums text-ink-1 font-mono">
                {fmtAmt4(stats.avgCost)}
              </p>
              <p className="text-[11px] font-mono text-ink-4 mt-1">
                {fmtQty(stats.totalShares)}주 보유
              </p>
            </div>
          </div>

          {/* 하단 카드: 평가금액 / 매입금액 / 실현손익 */}
          <div
            className={`grid gap-4 ${stats.realizedPnlUSD !== 0 ? "grid-cols-3" : "grid-cols-2"}`}
          >
            <div className="rounded-2xl bg-card border border-edge p-5">
              <p className="text-[10px] text-ink-4 uppercase tracking-wider mb-1">
                평가금액
              </p>
              <p className="text-lg font-semibold tabular-nums text-ink-1 font-mono">
                {fmtAmt(stats.valuationUSD)}
              </p>
              {!isKR && (
                <p className="text-[10px] font-mono tabular-nums text-ink-4 mt-1">
                  {fmtKRW(stats.valuationUSD * fxRate)}
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-card border border-edge p-5">
              <p className="text-[10px] text-ink-4 uppercase tracking-wider mb-1">
                매입금액
              </p>
              <p className="text-lg font-semibold tabular-nums text-ink-1 font-mono">
                {fmtAmt(stats.investedUSD)}
              </p>
              {!isKR && (
                <p className="text-[10px] font-mono tabular-nums text-ink-4 mt-1">
                  {fmtKRW(stats.investedUSD * fxRate)}
                </p>
              )}
            </div>
            {stats.realizedPnlUSD !== 0 && (
              <div className="rounded-2xl bg-card border border-edge p-5">
                <p className="text-[10px] text-ink-4 uppercase tracking-wider mb-1">
                  실현 손익
                </p>
                <p
                  className={`text-lg font-semibold tabular-nums font-mono ${pnlCls(stats.realizedPnlUSD)}`}
                >
                  {sign(stats.realizedPnlUSD)}
                  {fmtAmt(stats.realizedPnlUSD)}
                </p>
                {!isKR && (
                  <p
                    className={`text-[10px] font-mono tabular-nums mt-1 ${pnlCls(stats.realizedPnlKRW)}`}
                  >
                    {sign(stats.realizedPnlKRW)}
                    {fmtKRW(stats.realizedPnlKRW)}
                  </p>
                )}
              </div>
            )}
          </div>

          {!isKR && (
            <div className="flex items-center gap-2 justify-end">
              <p className="text-[10px] text-ink-4 font-mono">
                {fxRate.toLocaleString("ko-KR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                원/$
                {updatedAt &&
                  ` · ${new Date(updatedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
              </p>
              <button
                onClick={refresh}
                disabled={fxLoading}
                className="flex items-center gap-1 text-[10px] text-ink-3 hover:text-ink-1 disabled:opacity-40 transition-colors border border-edge rounded-md px-2 py-0.5"
              >
                <span className={fxLoading ? "animate-spin" : ""}>↻</span>
                갱신
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-edge p-8 text-center">
          <p className="text-ink-3 text-sm">아직 매매 내역이 없습니다</p>
          <p className="text-ink-4 text-xs mt-1">
            아래 폼에서 첫 매매를 기록해보세요
          </p>
        </div>
      )}

      {/* ── 매매 추가 폼 ── */}
      <div className="rounded-2xl bg-card border border-edge p-5">
        <p className="text-[11px] text-ink-3 uppercase tracking-widest mb-4">
          매매 기록 추가
        </p>

        <div className="flex gap-1 mb-4 bg-inset rounded-lg p-1 w-fit">
          {(["buy", "sell"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                form.type === t
                  ? t === "buy"
                    ? "bg-buy-badge text-buy-text border border-buy-edge"
                    : "bg-sell-badge text-sell-text border border-sell-edge"
                  : "text-ink-3 hover:text-ink-2"
              }`}
            >
              {t === "buy" ? "매수" : "매도"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ink-3">날짜</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="bg-field border border-edge-hi rounded-lg px-3 py-2 text-ink-1 text-sm tabular-nums focus:outline-none focus:border-edge transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ink-3">수량 (주)</span>
            <input
              type="number"
              step="0.000001"
              value={form.qty}
              placeholder="0.000000"
              onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
              className="bg-field border border-edge-hi rounded-lg px-3 py-2 text-ink-1 text-sm tabular-nums focus:outline-none focus:border-edge transition-colors placeholder:text-ink-4"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ink-3">체결가 ({isKR ? '₩' : '$'})</span>
            <input
              type="number"
              step="0.01"
              value={form.price}
              placeholder="0.00"
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              className="bg-field border border-edge-hi rounded-lg px-3 py-2 text-ink-1 text-sm tabular-nums focus:outline-none focus:border-edge transition-colors placeholder:text-ink-4"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ink-3">메모 (선택)</span>
            <input
              type="text"
              value={form.memo}
              placeholder="2σ 매수 신호"
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              className="bg-field border border-edge-hi rounded-lg px-3 py-2 text-ink-1 text-sm focus:outline-none focus:border-edge transition-colors placeholder:text-ink-4"
            />
          </label>
        </div>

        <button
          onClick={handleAdd}
          disabled={pending}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50 cursor-pointer ${
            form.type === "buy"
              ? "bg-buy-badge text-buy-text border border-buy-edge hover:bg-buy-bg"
              : "bg-sell-badge text-sell-text border border-sell-edge hover:bg-sell-bg"
          }`}
        >
          {form.type === "buy" ? "매수 기록 추가" : "매도 기록 추가"}
        </button>
      </div>

      {/* ── 매매 내역 테이블 ── */}
      {enriched.length > 0 && (
        <div className="rounded-2xl bg-card border border-edge overflow-hidden">
          <div className="px-5 py-4 border-b border-edge">
            <p className="text-[11px] text-ink-3 uppercase tracking-widest">
              매매 내역
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[108px]" />
                <col className="w-[56px]" />
                <col className="w-[108px]" />
                <col className="w-[96px]" />
                <col className="w-[80px]" />
                <col className="w-[96px]" />
              </colgroup>
              <thead>
                <tr className="text-[10px] text-ink-4 uppercase tracking-wider border-b border-edge">
                  <th className="py-2.5 pl-4 pr-2 text-left font-medium">
                    날짜
                  </th>
                  <th className="py-2.5 px-2 text-left font-medium">유형</th>
                  <th className="py-2.5 px-2 text-right font-medium">수량</th>
                  <th className="py-2.5 px-2 text-right font-medium">체결가</th>
                  <th className="py-2.5 px-2 text-right font-medium">메모</th>
                  <th className="py-2.5 pl-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {enriched.map((t) => (
                  <TradeRow
                    key={t.id}
                    trade={t}
                    symbol={symbol}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
