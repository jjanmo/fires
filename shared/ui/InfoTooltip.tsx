'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface Props {
  children: ReactNode;
  placement?: Placement;
}

const PANEL: Record<Placement, string> = {
  top: 'left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)]',
  bottom: 'left-1/2 -translate-x-1/2 top-[calc(100%+8px)]',
  right: 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
  left: 'right-[calc(100%+8px)] top-1/2 -translate-y-1/2',
};

const TAIL: Record<Placement, string> = {
  top: 'left-1/2 -translate-x-1/2 top-full border-x-[6px] border-x-transparent border-t-[6px] border-t-edge',
  bottom: 'left-1/2 -translate-x-1/2 bottom-full border-x-[6px] border-x-transparent border-b-[6px] border-b-edge',
  right: 'right-full top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-edge',
  left: 'left-full top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-l-[6px] border-l-edge',
};

const InfoQuestionIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('shrink-0', className)}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

const InfoTooltip = ({ children, placement = 'right' }: Props) => {
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
      <div className="flex flex-row items-center gap-1">
        <InfoQuestionIcon className="w-4 h-4 text-ink-4" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="도움말"
          className="flex cursor-pointer items-center justify-center text-ink-4 select-none text-[12px] font-medium"
        >
          롤링 기간 선택 가이드
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute z-50 w-72 rounded-xl bg-card border border-edge shadow-xl p-4 text-left opacity-95',
              PANEL[placement]
            )}
          >
            <span className={cn('absolute w-0 h-0', TAIL[placement])} />
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default InfoTooltip;
