'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toggleWatchlist } from '../actions'
import { useAuth } from '@/shared/hooks'

interface Props {
  symbol: string
  isWatchlisted: boolean
}

const WatchlistButton = ({ symbol, isWatchlisted: initial }: Props) => {
  const user = useAuth()
  const [isWatchlisted, setOptimistic] = useOptimistic(initial)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = () => {
    if (!user) {
      router.push(`/login?redirect=${pathname}`)
      return
    }
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

export default WatchlistButton
