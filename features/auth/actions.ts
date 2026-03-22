'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials':                      '이메일 또는 비밀번호가 올바르지 않습니다',
  'Email not confirmed':                            '이메일 인증이 필요합니다. 메일함을 확인해주세요',
  'User already registered':                        '이미 가입된 이메일입니다',
  'Password should be at least 6 characters':       '비밀번호는 최소 6자 이상이어야 합니다',
  'Unable to validate email address: invalid format': '올바른 이메일 형식이 아닙니다',
  'Email rate limit exceeded':                      '잠시 후 다시 시도해주세요',
  'signup_disabled':                                '현재 회원가입이 비활성화되어 있습니다',
}

function toKorean(message: string): string {
  return ERROR_MAP[message] ?? message
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: toKorean(error.message) }
  redirect('/')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: toKorean(error.message) }
  redirect('/')
}


export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
