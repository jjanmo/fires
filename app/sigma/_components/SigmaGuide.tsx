'use client';

import Link from 'next/link';

const STEPS = [
  { step: '01', label: '종목 검색', desc: '상단 검색창에서 관심 종목을 찾는다' },
  { step: '02', label: '신호 확인', desc: '종목 페이지에서 매수·매도 기준가를 확인한다' },
  { step: '03', label: '지정가 주문', desc: '기준가에 지정가 주문을 설정하고 기다린다' },
];

const EXAMPLE_TICKERS = [
  { label: 'SOXL', slug: 'soxl' },
  { label: 'TQQQ', slug: 'tqqq' },
  { label: 'FNGU', slug: 'fngu' },
  { label: 'NVDA', slug: 'nvda' },
  { label: 'SK하이닉스', slug: '000660.ks' },
  { label: 'TIGER 미국S&P500', slug: '261220.ks' },
];

const SigmaGuide = () => (
  <div className="rounded-2xl border border-edge bg-card p-5 sm:p-6 space-y-6">
    <div className="space-y-1">
      <p className="text-base font-semibold text-ink-1">시그마 전략 시작하기</p>
      <p className="text-sm text-ink-3">
        롤링 252일 표준편차(σ)를 기반으로 통계적 매수·매도 기준가를 계산합니다.
        과매도 구간에서 분할 매수하고, 과매수 구간에서 일부 매도하는 전략입니다.
      </p>
    </div>

    <ol className="flex flex-col sm:flex-row gap-3">
      {STEPS.map(({ step, label, desc }) => (
        <li key={step} className="flex-1 rounded-xl bg-inset border border-edge px-4 py-3 space-y-1">
          <p className="text-xs font-mono text-ink-4">{step}</p>
          <p className="text-sm font-semibold text-ink-1">{label}</p>
          <p className="text-xs text-ink-3 leading-relaxed">{desc}</p>
        </li>
      ))}
    </ol>

    <div className="space-y-2.5">
      <p className="text-xs font-medium text-ink-4">이런 종목부터 시작해보세요</p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_TICKERS.map(({ label, slug }) => (
          <Link
            key={slug}
            href={`/sigma/${slug}`}
            className="px-3 py-1.5 rounded-full border border-edge bg-inset text-sm text-ink-2 hover:text-ink-1 hover:border-edge-hi transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default SigmaGuide;
