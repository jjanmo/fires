'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';

const InfoQuestionIcon = () => (
  <svg
    className="shrink-0 w-4 h-4"
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

const CloseIcon = () => (
  <svg
    className="w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

interface Props {
  children: ReactNode;
}

const RollingGuideModal = ({ children }: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="flex items-center gap-1 text-ink-4 select-none cursor-pointer text-[12px] font-medium"
      >
        <InfoQuestionIcon />
        롤링 기간 선택 가이드
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />

            <div
              className={cn(
                'relative z-10 bg-card overflow-y-auto',
                'w-full h-full',
                'sm:h-auto sm:w-[420px] sm:max-h-[80vh] sm:rounded-2xl sm:border sm:border-edge sm:shadow-2xl'
              )}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
                <p className="text-[11px] text-ink-3 uppercase tracking-widest">롤링 기간 선택 가이드</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-ink-4 hover:text-ink-2 transition-colors cursor-pointer"
                  aria-label="닫기"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="p-5">{children}</div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default RollingGuideModal;
