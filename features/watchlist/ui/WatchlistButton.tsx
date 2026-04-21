'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleWatchlist } from '../actions'

interface Props {
  symbol: string
  isWatchlisted: boolean
}

export default function WatchlistButton({ symbol, isWatchlisted: initial }: Props) {
  const [isWatchlisted, setOptimistic] = useOptimistic(initial)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = () => {
    startTransition(async () => {
      setOptimistic(!isWatchlisted)
      await toggleWatchlist(symbol)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleClick}
      title={isWatchlisted ? '관심종목 해제' : '관심종목 추가'}
      className="text-xl leading-none hover:scale-110 active:scale-95 transition-all"
    >
      {isWatchlisted
        ? <span className="text-amber-400">★</span>
        : <span className="text-ink-4 hover:text-amber-400">☆</span>
      }
    </button>
  )
}
