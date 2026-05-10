import Link from 'next/link';
import { ThemeToggle, Logo, HeaderSearch } from '@/shared/ui';
import { UserMenu } from '@/features/auth';
import { createClient } from '@/shared/lib/supabase/server';
import NavTabs from './NavTabs';
import LoginButton from './LoginButton';

const AppHeader = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b border-edge bg-canvas/80 backdrop-blur-md sticky top-0 z-10">
      <div className="relative px-4 sm:px-6 max-w-5xl mx-auto h-12 flex items-center gap-4">
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
  );
};

export default AppHeader;
