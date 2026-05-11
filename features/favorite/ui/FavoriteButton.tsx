'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toggleFavorite } from '../actions'
import { useAuth } from '@/shared/hooks'

interface Props {
  symbol: string
  isFavorited: boolean
}

const FavoriteButton = ({ symbol, isFavorited: initial }: Props) => {
  const user = useAuth()
  const [isFavorited, setOptimistic] = useOptimistic(initial)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = () => {
    if (!user) {
      router.push(`/login?redirect=${pathname}`)
      return
    }
    startTransition(async () => {
      setOptimistic(!isFavorited)
      await toggleFavorite(symbol)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleClick}
      title={isFavorited ? '관심종목 해제' : '관심종목 추가'}
      className="text-xl leading-none hover:scale-110 active:scale-95 transition-all"
    >
      {isFavorited
        ? <span className="text-amber-400">★</span>
        : <span className="text-ink-4 hover:text-amber-400">☆</span>
      }
    </button>
  )
}

export default FavoriteButton
