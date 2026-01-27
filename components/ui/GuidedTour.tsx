'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, MapPin, Check, Loader2 } from 'lucide-react'

export interface TourStep {
    target: string // CSS selector
    title: string
    content: string
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    spotlightPadding?: number
}

interface GuidedTourProps {
    steps: TourStep[]
    tourId: string // Unique identifier for localStorage
    onComplete?: () => void
    onSkip?: () => void
    showOnFirstVisit?: boolean
}

export default function GuidedTour({
    steps,
    tourId,
    onComplete,
    onSkip,
    showOnFirstVisit = true,
}: GuidedTourProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [showWelcome, setShowWelcome] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
    const tooltipRef = useRef<HTMLDivElement>(null)
    const isScrollingRef = useRef(false)
    const lastCalculationRef = useRef(0)

    const storageKey = `tour_completed_${tourId}`

    // Check if tour should show on mount
    useEffect(() => {
        if (showOnFirstVisit) {
            const hasCompleted = localStorage.getItem(storageKey)
            if (!hasCompleted) {
                // Small delay to let the page render
                const timer = setTimeout(() => {
                    setShowWelcome(true)
                }, 500)
                return () => clearTimeout(timer)
            }
        }
    }, [showOnFirstVisit, storageKey])

    // Mobile detection
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

    // Calculate position for current step
    const calculatePosition = useCallback(() => {
        // Prevent rapid recalculation loops
        const now = Date.now()
        if (now - lastCalculationRef.current < 100) return
        lastCalculationRef.current = now

        if (isScrollingRef.current) return
        if (!isOpen || currentStep >= steps.length) return

        const step = steps[currentStep]

        // Handle Center Placement (same for desktop/mobile usually)
        if (step.placement === 'center') {
            setTargetRect(null)
            setTooltipPosition({
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
            })
            return
        }

        const target = document.querySelector(step.target)
        if (!target) {
            setTimeout(calculatePosition, 200)
            return
        }

        const rect = target.getBoundingClientRect()
        setTargetRect(rect)

        // MOBILE LOGIC: Sticky Bottom Sheet (or Top)
        if (window.innerWidth < 640) {
            // Check if element is fixed position
            const style = window.getComputedStyle(target)
            if (style.position === 'fixed') {
                // Don't try to scroll fixed elements
                setTargetRect(rect)
                return
            }

            // For mobile, we just maintain the targetRect for the spotlight. 
            // The tooltip itself will be fixed via CSS at the bottom.
            // We only need to ensure the element is scrolled into view properly.

            // Check if element is mainly out of the "safe zone" (top 60% of screen)
            // We assume tooltip takes bottom 40% roughly.
            const safeZoneBottom = window.innerHeight * 0.6
            const isOutOfSafeZone = rect.top < 60 || rect.bottom > safeZoneBottom

            if (isOutOfSafeZone) {
                isScrollingRef.current = true
                // Scroll to near top with padding for header
                const offset = 100
                const buttonPos = target.getBoundingClientRect().top + window.pageYOffset - offset

                window.scrollTo({
                    top: buttonPos,
                    behavior: 'smooth'
                })

                setTimeout(() => {
                    isScrollingRef.current = false
                    const newRect = target.getBoundingClientRect()
                    setTargetRect(newRect)
                }, 500)
            }
            return
        }

        // DESKTOP LOGIC: Floating Tooltip
        const tooltipHeight = tooltipRef.current?.offsetHeight || 200
        const tooltipWidth = tooltipRef.current?.offsetWidth || 320
        const spacing = 16

        let top = 0
        let left = 0
        let actualPlacement = step.placement || 'bottom'

        // Auto-flip placement if running out of space
        if (actualPlacement === 'bottom' && rect.bottom + tooltipHeight + spacing > window.innerHeight) {
            actualPlacement = 'top'
        }
        if (actualPlacement === 'top' && rect.top - tooltipHeight - spacing < 0) {
            actualPlacement = 'bottom'
        }

        // Calculation logic
        switch (actualPlacement) {
            case 'top':
                top = rect.top - tooltipHeight - spacing
                left = rect.left + rect.width / 2 - tooltipWidth / 2
                break
            case 'bottom':
                top = rect.bottom + spacing
                left = rect.left + rect.width / 2 - tooltipWidth / 2
                break
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2
                left = rect.left - tooltipWidth - spacing
                break
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2
                left = rect.right + spacing
                break
            default:
                top = rect.bottom + spacing
                left = rect.left + rect.width / 2 - tooltipWidth / 2
        }

        // Clamp to viewport
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16))
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16))

        setTooltipPosition({ top, left })

        // Scroll if needed (Desktop)
        const isOutOfView =
            rect.top < 20 ||
            rect.bottom > window.innerHeight - 20

        if (isOutOfView) {
            isScrollingRef.current = true
            target.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setTimeout(() => {
                isScrollingRef.current = false
                const newRect = target.getBoundingClientRect()
                setTargetRect(newRect)
            }, 500)
        }
    }, [isOpen, currentStep, steps])

    // Event Listeners
    useEffect(() => {
        if (!isOpen) return

        const initTimer = setTimeout(calculatePosition, 50)
        let resizeTimeout: NodeJS.Timeout

        const handleResize = () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(calculatePosition, 150)
        }

        window.addEventListener('resize', handleResize)
        // Re-calc on scroll to keep spotlight updated
        window.addEventListener('scroll', calculatePosition, { passive: true })

        return () => {
            clearTimeout(initTimer)
            clearTimeout(resizeTimeout)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scroll', calculatePosition)
        }
    }, [isOpen, currentStep, calculatePosition])

    // Public method to restart the tour
    const restartTour = useCallback(() => {
        setCurrentStep(0)
        setIsOpen(true)
        setShowWelcome(false)
    }, [])

    // Expose restart method globally for the independent button to use
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any)[`restartTour_${tourId}`] = restartTour
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete (window as any)[`restartTour_${tourId}`]
            }
        }
    }, [tourId, restartTour])

    const startTour = () => {
        setShowWelcome(false)
        setIsOpen(true)
        setCurrentStep(0)
    }

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            completeTour()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const completeTour = () => {
        setIsOpen(false)
        localStorage.setItem(storageKey, 'true')
        onComplete?.()
    }

    const skipTour = () => {
        setIsOpen(false)
        setShowWelcome(false)
        localStorage.setItem(storageKey, 'true')
        onSkip?.()
    }

    const declineWelcome = () => {
        setShowWelcome(false)
        localStorage.setItem(storageKey, 'true')
    }

    // Welcome modal
    if (showWelcome) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={declineWelcome} />
                <div className="relative z-10 w-full max-w-md bg-[#1a1625] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center">
                            <MapPin className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Welcome, ARMY! 💜</h2>
                        <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed">
                            First time here? Let me give you a quick tour so you can create the perfect BTS playlist!
                            <span className="text-purple-400 font-medium"> It only takes 30 seconds!</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={startTour} className="flex-1 py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                                <MapPin className="w-4 h-4" /> Yes, show me around!
                            </button>
                            <button onClick={declineWelcome} className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium rounded-xl border border-white/10 transition-colors">
                                I know my way
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!isOpen) return null

    const step = steps[currentStep]
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === steps.length - 1
    const isCenterPlacement = step?.placement === 'center'

    // Check if we are in mobile mode for rendering purposes
    const isMobileRender = typeof window !== 'undefined' && window.innerWidth < 640
    const isMobileTop = isMobileRender && step?.placement === 'top'

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Overlay with spotlight cutout */}
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id={`spotlight-mask-${tourId}`}>
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && !isCenterPlacement && (
                            <rect
                                x={targetRect.left - (step?.spotlightPadding || 12)}
                                y={targetRect.top - (step?.spotlightPadding || 12)}
                                width={targetRect.width + (step?.spotlightPadding || 12) * 2}
                                height={targetRect.height + (step?.spotlightPadding || 12) * 2}
                                rx="12"
                                ry="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.85)"
                    mask={`url(#spotlight-mask-${tourId})`}
                    onClick={skipTour}
                />
            </svg>

            {/* Spotlight border */}
            {targetRect && !isCenterPlacement && (
                <div
                    className="absolute pointer-events-none"
                    style={{
                        top: targetRect.top - (step?.spotlightPadding || 12) - 2,
                        left: targetRect.left - (step?.spotlightPadding || 12) - 2,
                        width: targetRect.width + (step?.spotlightPadding || 12) * 2 + 4,
                        height: targetRect.height + (step?.spotlightPadding || 12) * 2 + 4,
                        borderRadius: '14px',
                        border: '2px solid rgba(168, 85, 247, 0.6)',
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className={`absolute pointer-events-auto transition-all duration-300 ease-out 
                    ${isMobileRender
                        ? (isMobileTop ? 'fixed top-4 left-4 right-4 w-[auto] max-w-none' : 'fixed bottom-4 left-4 right-4 w-[auto] max-w-none')
                        : 'w-[320px] max-w-[calc(100vw-32px)]'}
                `}
                style={isMobileRender ? {} : {
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    transform: isCenterPlacement ? 'translate(-50%, -50%)' : undefined,
                }}
            >
                <div className="bg-[#1a1625] rounded-xl p-4 sm:p-5 border border-white/10 shadow-2xl">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{currentStep + 1}</span>
                            </div>
                            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                        </div>
                        <button onClick={skipTour} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{step?.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{step?.content}</p>

                    <div className="h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
                        <div
                            className="h-full bg-purple-600 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <button
                            onClick={prevStep}
                            disabled={isFirstStep}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isFirstStep ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button onClick={skipTour} className="text-gray-500 hover:text-white text-xs transition-colors">Skip</button>
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                            {isLastStep ? <><Check className="w-4 h-4" /> Done</> : <><span className="mr-1">Next</span><ChevronRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Export a button component that can restart the tour
export function RestartTourButton({
    tourId,
    label = 'Take a Tour',
    className = ''
}: {
    tourId: string
    label?: string
    className?: string
}) {
    const [isLoading, setIsLoading] = useState(false)

    const handleRestart = () => {
        setIsLoading(true)

        // Clear the completion flag
        localStorage.removeItem(`tour_completed_${tourId}`)

        // Try to access the active tour instance directly
        // This avoids a page reload and server request
        const globalRestart = (window as any)[`restartTour_${tourId}`]

        if (typeof globalRestart === 'function') {
            // Instant restart
            globalRestart()
            // Small timeout to reset loading state (UI feedback)
            setTimeout(() => setIsLoading(false), 500)
        } else {
            // Fallback only if absolutely necessary
            window.location.reload()
        }
    }

    return (
        <button
            onClick={handleRestart}
            disabled={isLoading}
            className={`flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors ${className}`}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
            ) : (
                <MapPin className="w-4 h-4" />
            )}
            {isLoading ? 'Starting...' : label}
        </button>
    )
}
