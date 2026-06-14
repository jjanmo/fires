'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { createFavoriteTab } from '@/features/favorite'
import { cn } from '@/shared/lib/cn'

interface Props {
  existingNames: string[]
  onClose: () => void
  onCreated: (tabId: string) => void
}

const CreateTabModal = ({ existingNames, onClose, onCreated }: Props) => {
  const [name, setName] = useState('')
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const trimmed = name.trim()
  const isDuplicate = existingNames.some(n => n === trimmed)
  const isDisabled = !trimmed || isDuplicate

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isDisabled) return

    startTransition(async () => {
      const tab = await createFavoriteTab(trimmed)
      if (tab) onCreated(tab.id)
      onClose()
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 bg-card border border-edge rounded-2xl shadow-2xl',
          'w-full mx-4 sm:w-[360px]',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
          <p className="text-sm font-semibold text-ink-1">새 탭 만들기</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="space-y-1.5">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="탭 이름"
              maxLength={10}
              className={cn(
                'w-full rounded-xl border bg-canvas px-4 py-2.5',
                'text-sm text-ink-1 placeholder:text-ink-4',
                'focus:outline-none transition-colors',
                isDuplicate ? 'border-red-500/60 focus:border-red-500' : 'border-edge focus:border-ink-3',
              )}
            />
            {isDuplicate && (
              <p className="text-xs text-red-400 px-1">이미 사용 중인 탭 이름입니다</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-edge px-4 py-2.5 text-sm text-ink-3 hover:text-ink-1 hover:border-ink-3 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="flex-1 rounded-xl bg-ink-1 px-4 py-2.5 text-sm text-canvas font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
            >
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default CreateTabModal
