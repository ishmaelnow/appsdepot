import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
  showCount?: boolean
}

export function StarRating({ rating, reviewCount, size = 'sm', showCount = true }: StarRatingProps) {
  const starSize = size === 'sm' ? 14 : 18
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className={cn('flex items-center gap-1', textSize)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={starSize}
            className={i <= Math.round(rating) ? 'text-depot-yellow fill-depot-yellow' : 'text-stone-300 fill-stone-300'}
          />
        ))}
      </div>
      <span className="font-semibold text-stone-700">{rating.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className="text-stone-400">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  )
}
