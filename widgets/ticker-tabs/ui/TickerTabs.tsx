"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { TradeJournal } from "@/features/trade-journal";
import type { Trade } from "@/features/trade-journal";
import { useLivePrice } from "@/shared/hooks";

interface Props {
  ticker: string;
  currentPrice: number;
  sigmaContent: ReactNode;
  mddContent: ReactNode;
  initialTrades: Trade[];
}

const TABS = [
  { key: "sigma", label: "σ 지표" },
  { key: "mdd", label: "MDD 지표" },
  { key: "journal", label: "매매일지" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function TickerTabs({
  ticker,
  currentPrice,
  sigmaContent,
  mddContent,
  initialTrades,
}: Props) {
  const [tab, setTab] = useState<TabKey>("sigma");
  const { price: livePrice } = useLivePrice(ticker.toUpperCase(), currentPrice);

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-tab-bar rounded-xl p-1 border border-edge">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
              tab === t.key
                ? "bg-tab-active text-ink-1 shadow-sm"
                : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={tab === "sigma" ? "" : "hidden"}>{sigmaContent}</div>
      <div className={tab === "mdd" ? "" : "hidden"}>{mddContent}</div>
      <div className={tab === "journal" ? "" : "hidden"}>
        <TradeJournal ticker={ticker} currentPrice={livePrice} initialTrades={initialTrades} />
      </div>
    </div>
  );
}
