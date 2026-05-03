'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/cn';

const NAV_ITEMS = [
  { label: '시그마 전략', href: '/sigma' },
  { label: '무한 매수법', href: '/infinite' },
  { label: '포트폴리오 관리', href: '/portfolio' },
] as const;

const NavTabs = () => {
  const pathname = usePathname();

  return (
    <nav className="self-stretch flex items-stretch">
      {NAV_ITEMS.map(({ label, href }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center px-3 text-sm border-b-2 transition-colors',
              isActive
                ? 'text-ink-1 font-medium border-ink-1'
                : 'text-ink-3 hover:text-ink-2 border-transparent'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavTabs;
