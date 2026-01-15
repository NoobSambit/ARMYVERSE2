'use client'

import Image from 'next/image'

type StreakBadgeWithOverlayProps = {
    imagePath: string
    badgeName: string
    streakCount: number
    size?: 'sm' | 'md' | 'lg' | 'xl'
    fallbackIcon?: string
    className?: string
    type?: 'daily' | 'weekly'
}

/**
 * Badge component that displays the streak count as an overlay in the bottom-right corner.
 * Used for completion badges to show the streak number (e.g., "69" for 69th day streak).
 */
export default function StreakBadgeWithOverlay({
    imagePath,
    badgeName,
    streakCount,
    size = 'md',
    fallbackIcon = '⭐',
    className = '',
    type = 'daily'
}: StreakBadgeWithOverlayProps) {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-20 h-20',
        xl: 'w-24 h-24'
    }

    const badgeSizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-14 h-14',
        lg: 'w-18 h-18',
        xl: 'w-22 h-22'
    }

    const overlayFontSize = {
        sm: 'text-[9px]',
        md: 'text-xs',
        lg: 'text-sm',
        xl: 'text-base'
    }

    const overlaySize = {
        sm: 'min-w-[16px] h-4 px-0.5',
        md: 'min-w-[20px] h-5 px-1',
        lg: 'min-w-[24px] h-6 px-1.5',
        xl: 'min-w-[28px] h-7 px-2'
    }

    // Gradient colors based on type
    const overlayGradient = type === 'daily'
        ? 'from-orange-500 to-red-600' // Warm colors for daily
        : 'from-blue-500 to-purple-600' // Cool colors for weekly

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {/* Badge Image Container */}
            <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden`}>
                <Image
                    src={imagePath}
                    alt={badgeName}
                    width={size === 'xl' ? 96 : size === 'lg' ? 80 : size === 'md' ? 64 : 40}
                    height={size === 'xl' ? 96 : size === 'lg' ? 80 : size === 'md' ? 64 : 40}
                    className={`${badgeSizeClasses[size]} object-contain`}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                            parent.innerHTML = `<span class="text-2xl">${fallbackIcon}</span>`
                        }
                    }}
                />
            </div>

            {/* Streak Count Overlay - Bottom Right Corner */}
            {streakCount > 0 && (
                <div
                    className={`
            absolute -bottom-0.5 -right-0.5
            ${overlaySize[size]}
            bg-gradient-to-br ${overlayGradient}
            rounded-full
            flex items-center justify-center
            ${overlayFontSize[size]} font-bold text-white
            shadow-lg shadow-black/40
            ring-2 ring-black/30
            backdrop-blur-sm
          `}
                >
                    {streakCount}
                </div>
            )}
        </div>
    )
}
