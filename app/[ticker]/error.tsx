'use client';

import Link from 'next/link';
import type { AppErrorCode } from '@/shared/lib/app-error';

const ERROR_UI: Record<AppErrorCode | 'UNKNOWN', { title: string; description: string; canRetry: boolean }> = {
  SYMBOL_NOT_FOUND: {
    title: '종목을 찾을 수 없습니다',
    description: '입력한 티커 심볼이 존재하지 않거나 지원하지 않는 종목입니다.',
    canRetry: false,
  },
  FETCH_FAILED: {
    title: '데이터를 불러오지 못했습니다',
    description: '일시적인 서버 오류입니다. 잠시 후 다시 시도해 주세요.',
    canRetry: true,
  },
  UNKNOWN: {
    title: '서버 오류가 발생했습니다',
    description: '일시적인 오류입니다. 잠시 후 다시 시도해 주세요.',
    canRetry: true,
  },
};

function resolveCode(message: string): AppErrorCode | 'UNKNOWN' {
  const codes: (AppErrorCode | 'UNKNOWN')[] = ['SYMBOL_NOT_FOUND', 'FETCH_FAILED'];
  return codes.find((c) => c === message) ?? 'UNKNOWN';
}

export default function TickerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const code = resolveCode(error.message);
  const { title, description, canRetry } = ERROR_UI[code];

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <p className="text-4xl font-bold text-ink-4">—</p>
        <p className="text-ink-2 font-medium">{title}</p>
        <p className="text-ink-4 text-sm">{description}</p>
        <div className="flex gap-3 justify-center pt-3">
          {canRetry && (
            <button
              onClick={reset}
              className="text-sm text-ink-3 hover:text-ink-1 transition-colors px-4 py-2 rounded-lg border border-edge hover:border-edge-hi"
            >
              다시 시도
            </button>
          )}
          <Link
            href="/"
            className="text-sm text-ink-3 hover:text-ink-1 transition-colors px-4 py-2 rounded-lg border border-edge hover:border-edge-hi"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
