import type { Metadata } from 'next';
import { ThemeProvider, AuthProvider } from '@/shared/ui';
import { getCurrentUser } from '@/shared/lib/supabase/server';
import AppHeader from './_components/AppHeader';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'fires', template: '%s | fires' },
  description: `Fires is a personal portfolio management tool built for the path to FIRE(Financial Independence, Retire Early).

Just as small embers come together to kindle a great fire,
fires helps you grow and manage your investments —
one spark at a time — until the day you no longer need to work.`,
};

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const user = await getCurrentUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-canvas antialiased">
        <ThemeProvider>
          <AuthProvider user={user ?? null}>
            <AppHeader />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
