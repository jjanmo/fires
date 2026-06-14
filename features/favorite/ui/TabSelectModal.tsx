'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import type { FavoriteTab } from '../actions'
import { cn } from '@/shared/lib/cn'

interface Props {
  tabs: FavoriteTab[]
  onSelect: (tabId: string) => void
  onClose: () => void
}

const TabSelectModal = ({ tabs, onSelect, onClose }: Props) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 bg-card border border-edge rounded-2xl shadow-2xl',
          'w-full mx-4 sm:w-[320px]',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
          <p className="text-sm font-semibold text-ink-1">탭 선택</p>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-4 hover:text-ink-2 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="p-2">
          {tabs.length === 0 ? (
            <p className="px-3 py-4 text-xs text-ink-4 text-center">
              탭이 없습니다.{' '}
              <Link href="/sigma" className="underline text-ink-3 hover:text-ink-1">
                즐겨찾기 페이지
              </Link>
              에서 탭을 먼저 만들어주세요.
            </p>
          ) : (
            tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-ink-2 hover:bg-white/5 hover:text-ink-1 transition-colors"
              >
                {tab.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default TabSelectModal
