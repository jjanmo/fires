'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'

export type FavoriteTab = {
  id: string
  name: string
  position: number
}

// ─── Favorite 조회 ───────────────────────────────────────────

export const getFavoriteSymbols = async (userId: string): Promise<string[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('favorites')
    .select('symbol')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  return data?.map(d => d.symbol) ?? []
}

export const getAllFavoritesByTab = async (
  userId: string,
): Promise<Array<{ symbol: string; tab_id: string | null }>> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('favorites')
    .select('symbol, tab_id')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

// ─── Favorite 뮤테이션 ───────────────────────────────────────

export const addFavoriteToTab = async (symbol: string, tabId: string) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: last } = await supabase
    .from('favorites')
    .select('position')
    .eq('user_id', user.id)
    .eq('tab_id', tabId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = last ? last.position + 1 : 0
  await supabase.from('favorites').insert({
    user_id: user.id,
    symbol: symbol.toUpperCase(),
    tab_id: tabId,
    position: nextPosition,
  })

  revalidatePath('/sigma')
  revalidatePath(`/sigma/${symbol.toLowerCase()}`)
}

export const removeFavorite = async (symbol: string) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('symbol', symbol.toUpperCase())

  revalidatePath('/sigma')
  revalidatePath(`/sigma/${symbol.toLowerCase()}`)
}

export const moveFavoriteToTab = async (symbol: string, newTabId: string) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: last } = await supabase
    .from('favorites')
    .select('position')
    .eq('user_id', user.id)
    .eq('tab_id', newTabId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = last ? last.position + 1 : 0

  await supabase
    .from('favorites')
    .update({ tab_id: newTabId, position: nextPosition })
    .eq('user_id', user.id)
    .eq('symbol', symbol.toUpperCase())

  revalidatePath('/sigma')
}

export const reorderFavorites = async (symbols: string[], tabId: string) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await Promise.all(
    symbols.map((symbol, position) =>
      supabase
        .from('favorites')
        .update({ position })
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .eq('tab_id', tabId),
    ),
  )

  revalidatePath('/sigma')
}

// ─── Tab 조회 ────────────────────────────────────────────────

export const getFavoriteTabs = async (userId: string): Promise<FavoriteTab[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('favorite_tabs')
    .select('id, name, position')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

// ─── Tab 뮤테이션 ────────────────────────────────────────────

export const createFavoriteTab = async (name: string): Promise<FavoriteTab | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: last } = await supabase
    .from('favorite_tabs')
    .select('position')
    .eq('user_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = last ? last.position + 1 : 0
  const { data } = await supabase
    .from('favorite_tabs')
    .insert({ user_id: user.id, name: name.trim(), position: nextPosition })
    .select('id, name, position')
    .single()

  revalidatePath('/sigma')
  return data
}

export const deleteFavoriteTab = async (tabId: string) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('favorite_tabs').delete().eq('id', tabId).eq('user_id', user.id)

  revalidatePath('/sigma')
}

export const renameFavoriteTab = async (tabId: string, name: string) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('favorite_tabs')
    .update({ name: name.trim() })
    .eq('id', tabId)
    .eq('user_id', user.id)

  revalidatePath('/sigma')
}

export const reorderFavoriteTabs = async (tabIds: string[]) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await Promise.all(
    tabIds.map((id, position) =>
      supabase
        .from('favorite_tabs')
        .update({ position })
        .eq('id', id)
        .eq('user_id', user.id),
    ),
  )

  revalidatePath('/sigma')
}
