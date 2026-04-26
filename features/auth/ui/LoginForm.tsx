'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/shared/lib/cn'
import { Logo } from '@/shared/ui'
import { signIn, signUp } from '../actions'

type Mode = 'login' | 'signup'

interface Props {
  redirectUrl?: string
}

const LoginForm = ({ redirectUrl }: Props) => {
  const [mode, setMode] = useState<Mode>('login')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const action = mode === 'login' ? signIn : signUp
      const result = await action(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <Logo size="lg" />
      </div>

      <div className="flex gap-1 border-b border-edge">
        {(['login', 'signup'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              'flex-1 pb-2.5 text-sm font-semibold transition-all relative cursor-pointer',
              mode === m ? 'text-ink-1' : 'text-ink-4 hover:text-ink-2'
            )}
          >
            {m === 'login' ? '로그인' : '회원가입'}
            {mode === m && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-red-500 via-orange-400 to-yellow-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {redirectUrl && <input type="hidden" name="redirectTo" value={redirectUrl} />}
        <input
          name="email"
          type="email"
          placeholder="이메일"
          required
          autoComplete="email"
          className="w-full px-4 py-3 rounded-xl bg-card border border-edge text-ink-1 placeholder:text-ink-4 text-sm focus:outline-none focus:border-ink-3 transition-colors"
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={6}
          className="w-full px-4 py-3 rounded-xl bg-card border border-edge text-ink-1 placeholder:text-ink-4 text-sm focus:outline-none focus:border-ink-3 transition-colors"
        />

        {error && <p className="text-xs text-loss px-1">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-linear-to-r from-red-500 via-orange-400 to-yellow-400 text-white text-sm font-bold tracking-wide shadow-md hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
        >
          {isPending ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </form>
    </div>
  )
}

export default LoginForm
