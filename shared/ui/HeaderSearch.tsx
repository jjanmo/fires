'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';

function HeaderSearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';

  const [expanded, setExpanded] = useState(isSearchPage);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prevPathnameRef = useRef(pathname);

  // 페이지 전환 감지 — /search 진입 시 확장, 이탈 시 축소
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (pathname === '/search' && prev !== '/search') {
      setExpanded(true);
    } else if (pathname !== '/search' && prev === '/search') {
      setExpanded(false);
      setQuery('');
    }
  }, [pathname]);

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    const url = `/search${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''}`;
    if (isSearchPage) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };

  const handleClose = () => {
    setQuery('');
    setExpanded(false);
    if (isSearchPage) {
      router.back();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };

  const handleBlur = () => {
    if (!isSearchPage && !query) {
      setExpanded(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={handleExpand}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-inset transition-colors"
        aria-label="검색"
      >
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
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    );
  }

  return (
    <div className="animate-search-expand flex items-center gap-2.5 bg-field border-2 border-edge-hi focus-within:border-ink-3 rounded-lg px-3 h-9 transition-colors">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink-3 shrink-0"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        autoFocus
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="종목명, 티커 심볼, 종목 코드"
        autoComplete="off"
        className="w-36 sm:w-52 bg-transparent text-sm text-ink-1 placeholder:text-ink-3 focus:outline-none"
      />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          handleClose();
        }}
        className="flex items-center justify-center w-4 h-4 rounded-full bg-ink-4 hover:bg-ink-3 transition-colors shrink-0 cursor-pointer"
        aria-label="검색 닫기"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-canvas"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function HeaderSearch() {
  return (
    <Suspense>
      <HeaderSearchContent />
    </Suspense>
  );
}
