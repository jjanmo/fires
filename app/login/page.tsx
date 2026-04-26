import { LoginForm } from '@/features/auth'

interface Props {
  searchParams: Promise<{ redirect?: string; tab?: string }>
}

const LoginPage = async ({ searchParams }: Props) => {
  const { redirect, tab } = await searchParams
  const redirectUrl = redirect
    ? tab ? `${redirect}?tab=${tab}` : redirect
    : undefined

  return (
    <main className="min-h-[calc(100vh-3rem)] bg-canvas flex items-center justify-center px-4 pb-24">
      <LoginForm redirectUrl={redirectUrl} />
    </main>
  )
}

export default LoginPage
