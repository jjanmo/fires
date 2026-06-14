import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { createClient } from '@/shared/lib/supabase/server'
import { getFavoriteTabs, getAllFavoritesByTab } from '@/features/favorite'
import FavoriteCard from './FavoriteCard'
import FavoriteTabs from './FavoriteTabs'
import RecentOrRecommended from './RecentOrRecommended'
import CardSkeleton from './CardSkeleton'

const SigmaSection = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <RecentOrRecommended />

  const [tabs, allFavorites] = await Promise.all([
    getFavoriteTabs(user.id),
    getAllFavoritesByTab(user.id),
  ])

  // 탭별 심볼 그룹핑
  const symbolsByTabId: Record<string, string[]> = Object.fromEntries(
    tabs.map(tab => [tab.id, []])
  )
  for (const fav of allFavorites) {
    if (fav.tab_id && symbolsByTabId[fav.tab_id]) {
      symbolsByTabId[fav.tab_id].push(fav.symbol)
    }
  }

  // 전체 심볼을 flat map으로 미리 렌더링
  // → 탭 이동 optimistic update 시 어느 탭에서도 카드를 즉시 표시 가능
  const allCardsBySymbol: Record<string, ReactNode> = {}
  allFavorites.forEach((fav, i) => {
    allCardsBySymbol[fav.symbol] = (
      <Suspense key={fav.symbol} fallback={<CardSkeleton />}>
        <FavoriteCard symbol={fav.symbol} index={i} />
      </Suspense>
    )
  })

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink-3">즐겨찾기</p>
      <FavoriteTabs
        tabs={tabs}
        symbolsByTabId={symbolsByTabId}
        allCardsBySymbol={allCardsBySymbol}
      />
    </div>
  )
}

export default SigmaSection
