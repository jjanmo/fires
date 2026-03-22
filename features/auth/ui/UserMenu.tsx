'use client';

import { useState } from 'react';
import { signOut } from '../actions';

const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-pink-500',
];

interface Props {
  email: string | undefined;
}

export default function UserMenu({ email }: Props) {
  const [open, setOpen] = useState(false);
  const [color] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
  const initial = email ? email[0].toUpperCase() : '?';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer`}
      >
        {initial}
      </button>

      {open && (
        <>
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="absolute right-2 top-8 w-52 rounded-xl bg-card border border-edge shadow-lg py-1 z-50">
            <p className="px-3 py-2 text-xs text-ink-4 truncate border-b border-edge">{email ?? '익명'}</p>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full text-left px-3 py-2 text-xs text-ink-2 hover:text-ink-1 hover:bg-edge/50 transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
