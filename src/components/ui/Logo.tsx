import React from 'react'
import { TrendingUp } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Logo Background */}
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-success-emphasis to-accent-emphasis dark:from-success-dark-emphasis dark:to-accent-dark-emphasis rounded-lg flex items-center justify-center shadow-md`}>
          <TrendingUp className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-6 w-6'} text-white`} />
        </div>
        
        {/* Subtle glow effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-br from-success-emphasis to-accent-emphasis dark:from-success-dark-emphasis dark:to-accent-dark-emphasis rounded-lg opacity-20 blur-sm -z-10`} />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold text-fg-default dark:text-fg-dark-default tracking-tight`}>
            FinUp
          </span>
          {size === 'lg' && (
            <span className="text-xs text-fg-muted dark:text-fg-dark-muted font-medium tracking-wide">
              Financial Control
            </span>
          )}
        </div>
      )}
    </div>
  )
}