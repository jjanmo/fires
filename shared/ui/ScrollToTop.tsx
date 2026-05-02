'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      onClick={handleClick}
      aria-label="맨 위로 이동"
      className={cn(
        'fixed bottom-6 right-4 sm:right-6 z-50',
        'flex items-center justify-center',
        'w-10 h-10 rounded-full',
        'bg-card border border-edge text-ink-3',
        'shadow-md hover:text-ink-1 hover:border-ink-4',
        'transition-all duration-200',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  )
}

export default ScrollToTop
