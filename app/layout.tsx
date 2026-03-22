import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle, ThemeProvider } from '@/shared/ui';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'fires', template: '%s | fires' },
  description: `Fires is a personal portfolio management tool built for the path to FIRE(Financial Independence, Retire Early).

Just as small embers come together to kindle a great fire,
fires helps you grow and manage your investments — 
one spark at a time — until the day you no longer need to work.`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-canvas antialiased">
        <ThemeProvider>
          <header className="border-b border-edge bg-canvas/80 backdrop-blur-md sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <span className="text-xl font-bold tracking-tight bg-linear-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  fires
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ink-4 font-mono">v1.0</span>
                <ThemeToggle />
              </div>
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
