"use client";

import { useState, useEffect, Suspense } from "react";
import type { ReactNode } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";

interface Props {
  sigmaContent: ReactNode;
  mddContent: ReactNode;
}

const TABS = [
  { key: "sigma", label: "σ 지표" },
  { key: "mdd", label: "MDD 지표" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TickerTabsInner = ({ sigmaContent, mddContent }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as TabKey | null;
  const validTab = tabParam && TABS.some((t) => t.key === tabParam) ? tabParam : null;

  const [tab, setTab] = useState<TabKey>(validTab ?? "sigma");

  // tab 파라미터로 진입한 경우 URL 정리
  useEffect(() => {
    if (validTab) {
      router.replace(pathname);
    }
  }, [validTab, router, pathname]);

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-tab-bar rounded-xl p-1 border border-edge">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150",
              tab === t.key
                ? "bg-tab-active text-ink-1 shadow-sm"
                : "text-ink-3 hover:text-ink-2"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={tab === "sigma" ? "" : "hidden"}>{sigmaContent}</div>
      <div className={tab === "mdd" ? "" : "hidden"}>{mddContent}</div>
    </div>
  );
};

// useSearchParams는 Suspense 경계 필요
const TickerTabs = (props: Props) => (
  <Suspense>
    <TickerTabsInner {...props} />
  </Suspense>
);

export default TickerTabs;
