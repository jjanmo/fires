'use client';

import Link from 'next/link';

const STEPS = [
  { step: '01', label: '종목 검색', desc: '관심 종목을 검색한다. 시그마 전략은 일정 수준의 변동성이 있는 종목에 적합하다' },
  { step: '02', label: '위치 확인', desc: '현재가가 정규분포 어디에 위치하는지 확인한다. 1σ·2σ 중 자신의 성향에 맞는 기준을 직접 정해 매수·매도 포인트를 결정한다' },
  { step: '03', label: '지정가 주문', desc: '설정한 기준가에 지정가 주문을 걸고 기다린다. 감정이 아닌 통계적 판단으로 실행하는 것이 핵심이다' },
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
        종가 기준 일일 변동성으로 정규분포를 만들고, 현재가가 분포 어디에 위치하는지 파악합니다.
        평균에서 얼마나 벗어났는지(σ)를 기준으로 매수·매도를 판단해, 감정이 아닌 통계로 시스템적 매매를 실현하는 전략입니다.
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
