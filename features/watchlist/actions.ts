'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'

export async function toggleWatchlist(symbol: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('symbol', symbol.toUpperCase())
    .single()

  if (data) {
    await supabase.from('watchlist').delete().eq('id', data.id)
  } else {
    await supabase.from('watchlist').insert({ user_id: user.id, symbol: symbol.toUpperCase() })
  }

  revalidatePath('/')
  revalidatePath(`/${symbol.toLowerCase()}`)
}

export async function getWatchlistSymbols(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('watchlist')
    .select('symbol')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  return data?.map(d => d.symbol) ?? []
}
