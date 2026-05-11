'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'

export const toggleFavorite = async (symbol: string) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('symbol', symbol.toUpperCase())
    .single()

  if (data) {
    await supabase.from('favorites').delete().eq('id', data.id)
  } else {
    const { data: last } = await supabase
      .from('favorites')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = last ? last.position + 1 : 0
    await supabase.from('favorites').insert({
      user_id: user.id,
      symbol: symbol.toUpperCase(),
      position: nextPosition,
    })
  }

  revalidatePath('/')
  revalidatePath(`/${symbol.toLowerCase()}`)
}

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

export const reorderFavorites = async (symbols: string[]) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await Promise.all(
    symbols.map((symbol, position) =>
      supabase
        .from('favorites')
        .update({ position })
        .eq('user_id', user.id)
        .eq('symbol', symbol)
    )
  )

  revalidatePath('/sigma')
}
