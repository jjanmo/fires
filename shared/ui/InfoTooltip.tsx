'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface Props {
  children: ReactNode;
  placement?: Placement;
}

const PANEL: Record<Placement, string> = {
  top:    'left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)]',
  bottom: 'left-1/2 -translate-x-1/2 top-[calc(100%+8px)]',
  right:  'left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
  left:   'right-[calc(100%+8px)] top-1/2 -translate-y-1/2',
};

const TAIL: Record<Placement, string> = {
  top:    'left-1/2 -translate-x-1/2 top-full border-x-[6px] border-x-transparent border-t-[6px] border-t-edge',
  bottom: 'left-1/2 -translate-x-1/2 bottom-full border-x-[6px] border-x-transparent border-b-[6px] border-b-edge',
  right:  'right-full top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-edge',
  left:   'left-full top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-l-[6px] border-l-edge',
};

export default function InfoTooltip({ children, placement = 'right' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-4 h-4 rounded-full border border-ink-4/50 text-ink-4 text-[10px] font-bold flex items-center justify-center hover:border-ink-2 hover:text-ink-2 transition-colors cursor-pointer select-none"
        aria-label="도움말"
      >
        ?
      </button>

      {open && (
        <>
          {/* 배경 오버레이 (모바일) */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />
          {/* 툴팁 패널 */}
          <div className={`absolute z-50 w-72 rounded-xl bg-card border border-edge shadow-xl p-4 text-left ${PANEL[placement]}`}>
            {/* 말풍선 꼬리 */}
            <span className={`absolute w-0 h-0 ${TAIL[placement]}`} />
            {children}
          </div>
        </>
      )}
    </div>
  );
}
