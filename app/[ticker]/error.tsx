'use client';

import Link from 'next/link';

function parseStatus(error: Error): number | null {
  const match = error.message.match(/\((\d{3})\)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function TickerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const status = parseStatus(error);
  const is404 = status === 404;

  const title = is404 ? '종목을 찾을 수 없습니다' : '서버 오류가 발생했습니다';
  const description = is404
    ? '입력한 티커 심볼이 존재하지 않거나 지원하지 않는 종목입니다.'
    : '일시적인 서버 오류입니다. 잠시 후 다시 시도해 주세요.';

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <p className="text-4xl font-bold text-ink-4">{status ?? '오류'}</p>
        <p className="text-ink-2 font-medium">{title}</p>
        <p className="text-ink-4 text-sm">{description}</p>
        <div className="flex gap-3 justify-center pt-3">
          {!is404 && (
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
