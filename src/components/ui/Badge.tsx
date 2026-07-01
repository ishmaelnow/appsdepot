import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'orange' | 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  const variants = {
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-violet-100 text-violet-800',
    gray: 'bg-stone-100 text-stone-700',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }
  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size])}>
      {children}
    </span>
  )
}
