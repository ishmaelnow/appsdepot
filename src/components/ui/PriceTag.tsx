import type { App } from '../../types'
import { formatStartingPrice } from '../../lib/utils'

interface PriceTagProps {
  app: App
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'text-sm font-bold',
  md: 'text-base font-bold',
  lg: 'text-2xl font-extrabold',
}

export function PriceTag({ app, size = 'md' }: PriceTagProps) {
  const label = formatStartingPrice(app)
  return (
    <span className={`${sizes[size]} text-depot-black`}>{label}</span>
  )
}
