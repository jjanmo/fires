'use client'

import { useState } from 'react'
import type { FavoriteTab } from '@/features/favorite'
import { cn } from '@/shared/lib/cn'

interface Props {
  symbol: string
  currentTabId: string
  tabs: FavoriteTab[]
  onMove: (toTabId: string) => void
  onRemove: () => void
}

const DotsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <circle cx="7" cy="2" r="1.3" />
    <circle cx="7" cy="7" r="1.3" />
    <circle cx="7" cy="12" r="1.3" />
  </svg>
)

type MenuState = 'closed' | 'main' | 'move'

const CardMenu = ({ currentTabId, tabs, onMove, onRemove }: Props) => {
  const [state, setState] = useState<MenuState>('closed')

  const otherTabs = tabs.filter(t => t.id !== currentTabId)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          setState(s => (s === 'closed' ? 'main' : 'closed'))
        }}
        className="p-1 rounded text-ink-4 opacity-40 hover:opacity-90 transition-opacity outline-none focus:outline-none"
        aria-label="카드 메뉴"
      >
        <DotsIcon />
      </button>

      {state !== 'closed' && (
        <>
          {/* 백드롭: 클릭이 Link까지 전달되는 것을 차단 */}
          <div
            className="fixed inset-0 z-40"
            onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
            onClick={e => { e.stopPropagation(); setState('closed') }}
          />
          <div
            className={cn(
              'absolute right-0 top-full mt-1 z-50',
              'bg-card border border-edge rounded-xl shadow-lg py-1 min-w-[140px]',
            )}
            onClick={e => e.stopPropagation()}
          >
            {state === 'main' && (
              <>
                {otherTabs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setState('move')}
                    className="w-full text-left px-3 py-2 text-xs text-ink-2 hover:bg-white/5 transition-colors flex items-center justify-between"
                  >
                    <span>다른 탭으로 이동</span>
                    <span className="text-ink-4">›</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setState('closed'); onRemove() }}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors"
                >
                  즐겨찾기 해제
                </button>
              </>
            )}

            {state === 'move' && (
              <>
                <button
                  type="button"
                  onClick={() => setState('main')}
                  className="w-full text-left px-3 py-2 text-xs text-ink-4 hover:bg-white/5 transition-colors flex items-center gap-1"
                >
                  <span>‹</span>
                  <span>탭 선택</span>
                </button>
                <div className="border-t border-edge my-1" />
                {otherTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setState('closed'); onMove(tab.id) }}
                    className="w-full text-left px-3 py-2 text-xs text-ink-2 hover:bg-white/5 transition-colors truncate"
                  >
                    {tab.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CardMenu
