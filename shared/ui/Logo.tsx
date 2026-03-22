interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
}

export default function Logo({ size = 'md' }: Props) {
  return (
    <span className={`font-bold tracking-tight bg-linear-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent ${sizeClass[size]}`}>
      fires
    </span>
  )
}
