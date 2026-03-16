'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(localStorage.getItem('theme') !== 'light');
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', !next);
  };

  return (
    <button
      onClick={toggle}
      title={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-4 hover:text-ink-1 hover:bg-inset transition-colors text-base"
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}
