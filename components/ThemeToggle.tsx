'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  const dark = resolvedTheme !== 'light';

  return (
    <button
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-4 hover:text-ink-1 hover:bg-inset transition-colors text-base"
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}
