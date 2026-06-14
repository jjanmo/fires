'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { FavoriteTab } from '@/features/favorite'
import { moveFavoriteToTab, removeFavorite, reorderFavorites } from '@/features/favorite'
import { cn } from '@/shared/lib/cn'
import TabBar from './TabBar'
import DraggableGrid from './DraggableGrid'

interface Props {
  tabs: FavoriteTab[]
  symbolsByTabId: Record<string, string[]>
  allCardsBySymbol: Record<string, ReactNode>
}

const FavoriteTabs = ({ tabs, symbolsByTabId, allCardsBySymbol }: Props) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '')
  const [clientSymbols, setClientSymbols] = useState(symbolsByTabId)
  const prevTabsLengthRef = useRef(tabs.length)
  const router = useRouter()
  const [, startTransition] = useTransition()

  // 서버 refresh 후 props가 바뀌면 클라이언트 상태 동기화
  useEffect(() => {
    setClientSymbols(symbolsByTabId)
  }, [symbolsByTabId])

  useEffect(() => {
    if (tabs.length > prevTabsLengthRef.current) {
      setActiveTabId(tabs[tabs.length - 1].id)
    } else if (tabs.length > 0 && !tabs.find(t => t.id === activeTabId)) {
      setActiveTabId(tabs[0].id)
    }
    prevTabsLengthRef.current = tabs.length
  }, [tabs, activeTabId])

  const handleTabCreated = (tabId: string) => {
    setActiveTabId(tabId)
  }

  // 즉시 UI 업데이트 후 백그라운드에서 서버 동기화
  const handleMoveCard = (symbol: string, toTabId: string) => {
    const fromTabId = Object.keys(clientSymbols).find(id =>
      clientSymbols[id]?.includes(symbol)
    )
    if (!fromTabId) return

    setClientSymbols(prev => ({
      ...prev,
      [fromTabId]: prev[fromTabId].filter(s => s !== symbol),
      [toTabId]: [...(prev[toTabId] ?? []), symbol],
    }))

    startTransition(async () => {
      await moveFavoriteToTab(symbol, toTabId)
      router.refresh()
    })
  }

  const handleReorderTab = (tabId: string, newOrder: string[]) => {
    setClientSymbols(prev => ({ ...prev, [tabId]: newOrder }))
    reorderFavorites(newOrder, tabId)
  }

  const handleRemoveCard = (symbol: string) => {
    setClientSymbols(prev => {
      const next = { ...prev }
      for (const tabId of Object.keys(next)) {
        next[tabId] = next[tabId].filter(s => s !== symbol)
      }
      return next
    })

    startTransition(async () => {
      await removeFavorite(symbol)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onTabCreated={handleTabCreated}
      />

      {tabs.length === 0 ? (
        <p className="text-sm text-ink-4 py-8 text-center">
          + 버튼으로 탭을 만들고 즐겨찾기 종목을 추가해보세요
        </p>
      ) : (
        tabs.map(tab => (
          <div key={tab.id} className={cn(tab.id === activeTabId ? 'block' : 'hidden')}>
            {(clientSymbols[tab.id]?.length ?? 0) > 0 ? (
              <DraggableGrid
                symbols={clientSymbols[tab.id]}
                allCardsBySymbol={allCardsBySymbol}
                tabId={tab.id}
                tabs={tabs}
                onReorder={handleReorderTab}
                onMoveCard={handleMoveCard}
                onRemoveCard={handleRemoveCard}
              />
            ) : (
              <p className="text-sm text-ink-4 py-6 text-center">이 탭에 즐겨찾기가 없습니다</p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default FavoriteTabs
