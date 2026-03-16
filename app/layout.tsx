import type { Metadata } from 'next'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'σ 매매 신호', template: '%s | σ 매매 신호' },
  description: 'Rolling 252일 표준편차 기반 레버리지 ETF 지정가 매매 대시보드',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 첫 렌더 전 테마 적용 — 깜빡임 방지 */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className="bg-canvas antialiased">
        <header className="border-b border-edge bg-canvas/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
            <Link href="/" className="text-sm font-semibold text-ink-2 hover:text-ink-1 transition-colors tracking-tight">
              σ 매매 신호
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ink-4 font-mono">v1.0</span>
              <ThemeToggle />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
