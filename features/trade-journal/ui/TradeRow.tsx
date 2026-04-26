"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { Trade, EnrichedTrade } from "../model/journal";
import { formatPrice as fmtTickerPrice } from "@/shared/lib/ticker";

const fmtQty = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 6 });

const inputCls = "bg-field border border-edge-hi rounded-md px-2 py-1.5 text-ink-1 text-[11px] font-mono focus:outline-none focus:border-edge transition-colors";

interface Props {
  trade: EnrichedTrade;
  symbol: string;
  onEdit: (id: string, fields: Partial<Omit<Trade, "id">>) => void;
  onDelete: (id: string) => void;
}

const TradeRow = ({ trade, symbol, onEdit, onDelete }: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    date:  trade.date,
    type:  trade.type,
    qty:   String(trade.qty),
    price: String(trade.price),
    memo:  trade.memo,
  });
  const isBuy = trade.type === "buy";

  const handleSave = () => {
    const qty = parseFloat(draft.qty);
    const price = parseFloat(draft.price);
    if (!qty || !price || !draft.date) return;
    onEdit(trade.id, { date: draft.date, type: draft.type, qty, price, memo: draft.memo.trim() });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({ date: trade.date, type: trade.type, qty: String(trade.qty), price: String(trade.price), memo: trade.memo });
    setEditing(false);
  };

  if (editing) {
    return (
      <tr className="border-t border-edge bg-inset/50">
        <td className="py-2 pl-4 pr-2">
          <input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} className={cn(inputCls, 'w-full')} />
        </td>
        <td className="py-2 px-2">
          <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as "buy" | "sell" }))} className={cn(inputCls, 'w-full')}>
            <option value="buy">매수</option>
            <option value="sell">매도</option>
          </select>
        </td>
        <td className="py-2 px-2">
          <input type="number" step="0.000001" value={draft.qty} onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))} className={cn(inputCls, 'w-full text-right')} />
        </td>
        <td className="py-2 px-2">
          <input type="number" step="0.01" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} className={cn(inputCls, 'w-full text-right')} />
        </td>
        <td className="py-2 px-2">
          <input type="text" value={draft.memo} onChange={(e) => setDraft((d) => ({ ...d, memo: e.target.value }))} placeholder="메모" className={cn(inputCls, 'w-full text-right')} />
        </td>
        <td className="py-2 pl-2 pr-4">
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="cursor-pointer flex-1 text-[10px] font-medium rounded-md px-2.5 py-1 bg-buy-badge text-buy-text border border-buy-edge hover:bg-buy-bg transition-colors">
              저장
            </button>
            <button onClick={handleCancel} className="cursor-pointer flex-1 text-[10px] font-medium rounded-md px-2.5 py-1 bg-inset text-ink-3 border border-edge hover:text-ink-1 transition-colors">
              취소
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group border-t border-edge hover:bg-row-hover transition-colors duration-150">
      <td className="py-2.5 pl-4 pr-2 font-mono text-ink-3 text-[11px] whitespace-nowrap">{trade.date}</td>
      <td className="py-2.5 px-2">
        <span className={cn(
          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
          isBuy ? 'text-buy-text bg-buy-badge border-buy-edge' : 'text-sell-text bg-sell-badge border-sell-edge'
        )}>
          {isBuy ? "매수" : "매도"}
        </span>
      </td>
      <td className="py-2.5 px-2 text-right font-mono text-ink-1 tabular-nums text-[12px]">{fmtQty(trade.qty)}주</td>
      <td className="py-2.5 px-2 text-right font-mono text-ink-2 tabular-nums text-[12px]">{fmtTickerPrice(trade.price, symbol)}</td>
      <td className="py-2.5 px-2 text-ink-4 text-[11px] truncate text-right">{trade.memo || "—"}</td>
      <td className="py-2.5 pl-2 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button onClick={() => setEditing(true)} className="cursor-pointer flex-1 text-[10px] font-medium rounded-md px-2.5 py-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/30 hover:bg-amber-100 dark:hover:bg-amber-400/20 transition-colors">
            수정
          </button>
          <button onClick={() => { if (window.confirm("해당 매매 기록을 삭제하시겠습니까?")) onDelete(trade.id); }} className="cursor-pointer flex-1 text-[10px] font-medium rounded-md px-2.5 py-1 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/30 hover:bg-red-100 dark:hover:bg-red-400/20 transition-colors">
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

export default TradeRow
