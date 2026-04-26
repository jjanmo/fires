import { cn } from '@/shared/lib/cn';

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
}

const Logo = ({ size = 'md' }: Props) => (
  <span className={cn('font-bold tracking-tight bg-linear-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent', sizeClass[size])}>
    fires
  </span>
)

export default Logo;
