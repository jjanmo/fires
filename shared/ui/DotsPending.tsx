import { cn } from '@/shared/lib/cn'

type DotsPendingProps = {
  className?: string
}

const DotsPending = ({ className }: DotsPendingProps) => (
  <div
    className={cn(
      'flex items-center justify-center gap-0.5 py-24',
      className,
    )}
    role="status"
    aria-label="불러오는 중"
  >
    <div className="h-2 w-2 skeleton rounded-full animate-pulse [animation-duration:800ms] [animation-delay:-0.3s]" />
    <div className="h-2 w-2 skeleton rounded-full animate-pulse [animation-duration:800ms] [animation-delay:-0.15s]" />
    <div className="h-2 w-2 skeleton rounded-full animate-pulse [animation-duration:800ms]" />
  </div>
)

export default DotsPending
