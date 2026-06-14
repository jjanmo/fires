'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { addFavoriteToTab, removeFavorite } from '../actions'
import { useAuth } from '@/shared/hooks'
import type { FavoriteTab } from '../actions'
import TabSelectModal from './TabSelectModal'

interface Props {
  symbol: string
  isFavorited: boolean
  tabs: FavoriteTab[]
}

const FavoriteButton = ({ symbol, isFavorited, tabs }: Props) => {
  const user = useAuth()
  const [showTabSelect, setShowTabSelect] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  // 서버 응답 전에 별 아이콘을 즉시 전환, transition 완료 후 서버 값으로 확정
  const [optimisticFavorited, setOptimistic] = useOptimistic(
    isFavorited,
    (_state, next: boolean) => next,
  )

  const handleClick = () => {
    if (!user) {
      router.push(`/login?redirect=${pathname}`)
      return
    }

    if (optimisticFavorited) {
      startTransition(async () => {
        setOptimistic(false)
        await removeFavorite(symbol)
        router.refresh()
      })
    } else {
      setShowTabSelect(true)
    }
  }

  const handleTabSelect = (tabId: string) => {
    setShowTabSelect(false)
    startTransition(async () => {
      setOptimistic(true)
      await addFavoriteToTab(symbol, tabId)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        title={optimisticFavorited ? '관심종목 해제' : '관심종목 추가'}
        className="text-xl leading-none hover:scale-110 active:scale-95 transition-all disabled:opacity-60"
      >
        {optimisticFavorited
          ? <span className="text-amber-400">★</span>
          : <span className="text-ink-4 hover:text-amber-400">☆</span>
        }
      </button>

      {showTabSelect && (
        <TabSelectModal
          tabs={tabs}
          onSelect={handleTabSelect}
          onClose={() => setShowTabSelect(false)}
        />
      )}
    </>
  )
}

export default FavoriteButton
