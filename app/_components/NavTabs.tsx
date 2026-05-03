'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/cn';

const SigmaIcon = () => <span className="text-[20px] font-semibold leading-none select-none">σ</span>;

const InfinityIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
  </svg>
);

const PortfolioIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const NAV_ITEMS = [
  { label: '시그마 전략', href: '/sigma', Icon: SigmaIcon },
  { label: '무한 매수법', href: '/infinite', Icon: InfinityIcon },
  { label: '포트폴리오', href: '/portfolio', Icon: PortfolioIcon },
];

const NavTabs = () => {
  const pathname = usePathname();

  return (
    <nav className="self-stretch flex items-stretch">
      {NAV_ITEMS.map(({ label, href, Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center px-2 sm:px-3 text-sm border-b-2 transition-colors',
              isActive ? 'text-ink-1 font-medium border-ink-1' : 'text-ink-3 hover:text-ink-2 border-transparent'
            )}
          >
            <span className="sm:hidden w-6 flex justify-center items-center">
              <Icon />
            </span>
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default NavTabs;
