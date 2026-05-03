import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle, ThemeProvider, Logo, HeaderSearch, AuthProvider } from '@/shared/ui';
import { UserMenu } from '@/features/auth';
import { createClient } from '@/shared/lib/supabase/server';
import NavTabs from './_components/NavTabs';
import './globals.css';

const LoginButton = () => (
  <Link
    href="/login"
    title="로그인"
    className="w-6 h-6 flex items-center justify-center rounded-full text-ink-4 hover:text-ink-1 transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  </Link>
);

export const metadata: Metadata = {
  title: { default: 'fires', template: '%s | fires' },
  description: `Fires is a personal portfolio management tool built for the path to FIRE(Financial Independence, Retire Early).

Just as small embers come together to kindle a great fire,
fires helps you grow and manage your investments — 
one spark at a time — until the day you no longer need to work.`,
};

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-canvas antialiased">
        <ThemeProvider>
          <AuthProvider user={user ?? null}>
            <header className="border-b border-edge bg-canvas/80 backdrop-blur-md sticky top-0 z-10">
              <div className="px-4 sm:px-6 max-w-4xl mx-auto h-12 flex items-center gap-4">
                <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
                  <Logo size="sm" />
                </Link>
                <NavTabs />
                <div className="flex items-center gap-2 ml-auto">
                  <HeaderSearch />
                  {user ? <UserMenu email={user.email} /> : <LoginButton />}
                  <ThemeToggle />
                </div>
              </div>
            </header>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout
