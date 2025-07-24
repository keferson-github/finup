import React from 'react'

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
        <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center shadow-lg overflow-hidden`}>
          <img 
            src="/images/logo-finup.png" 
            alt="FinUp Logo" 
            className="w-full h-full object-contain p-1"
          />
        </div>

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