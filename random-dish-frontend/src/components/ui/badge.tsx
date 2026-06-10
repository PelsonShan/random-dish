import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline'
  className?: string
  onClick?: () => void
}

export function Badge({ children, variant = 'default', className, onClick }: BadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variant === 'default' && 'bg-primary-100 text-primary-700',
        variant === 'outline' && 'border border-gray-300 text-gray-600',
        onClick && 'cursor-pointer hover:bg-primary-200',
        className
      )}
    >
      {children}
    </span>
  )
}
