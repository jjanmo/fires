'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import type { Trade } from './model/journal'

export async function getTrades(ticker: string): Promise<Trade[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('trades')
    .select('id, date, type, qty, price, memo')
    .eq('user_id', user.id)
    .eq('ticker', ticker.toUpperCase())
    .order('date', { ascending: true })

  return (data ?? []).map(r => ({
    id:    r.id,
    date:  r.date,
    type:  r.type as 'buy' | 'sell',
    qty:   Number(r.qty),
    price: Number(r.price),
    memo:  r.memo ?? '',
  }))
}

export async function addTrade(
  ticker: string,
  trade: Omit<Trade, 'id'>,
): Promise<Trade | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('trades')
    .insert({
      user_id: user.id,
      ticker:  ticker.toUpperCase(),
      date:    trade.date,
      type:    trade.type,
      qty:     trade.qty,
      price:   trade.price,
      memo:    trade.memo,
    })
    .select('id, date, type, qty, price, memo')
    .single()

  if (!data) return null

  revalidatePath(`/${ticker.toLowerCase()}`)

  return {
    id:    data.id,
    date:  data.date,
    type:  data.type as 'buy' | 'sell',
    qty:   Number(data.qty),
    price: Number(data.price),
    memo:  data.memo ?? '',
  }
}

export async function deleteTrade(ticker: string, id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('trades')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath(`/${ticker.toLowerCase()}`)
}
