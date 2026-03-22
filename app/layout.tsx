import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle, ThemeProvider, Logo } from '@/shared/ui';
import { UserMenu } from '@/features/auth';
import { createClient } from '@/shared/lib/supabase/server';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'fires', template: '%s | fires' },
  description: `Fires is a personal portfolio management tool built for the path to FIRE(Financial Independence, Retire Early).

Just as small embers come together to kindle a great fire,
fires helps you grow and manage your investments — 
one spark at a time — until the day you no longer need to work.`,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-canvas antialiased">
        <ThemeProvider>
          <header className="border-b border-edge bg-canvas/80 backdrop-blur-md sticky top-0 z-10">
            <div className="px-4 sm:px-6 max-w-4xl mx-auto h-12 flex items-center justify-between">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Logo size="sm" />
              </Link>
              <div className="flex items-center gap-2">
                {user && <UserMenu email={user.email} />}
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
