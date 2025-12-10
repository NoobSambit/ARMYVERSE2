import { CSSProperties } from 'react'

/**
 * Background Style Type Definitions
 * Performance-optimized profile background styles for ARMYVERSE
 */

export type BackgroundStyleId =
  | 'purple-nebula'
  | 'stage-lights'
  | 'army-constellation'
  | 'purple-aurora'
  | 'mesh-gradient'
  | 'glassmorphism'
  | 'geometric-grid'
  | 'holographic'

// Legacy style IDs (for backward compatibility during migration)
export type LegacyBackgroundStyleId =
  | 'gradient'
  | 'noise'
  | 'bts-motif'
  | 'clean'

export type AnyBackgroundStyleId = BackgroundStyleId | LegacyBackgroundStyleId

export interface BackgroundStyleDefinition {
  id: BackgroundStyleId
  name: string
  description: string
  category: 'bts-themed' | 'modern-premium'
}

/**
 * Background Style Metadata
 * Used in PersonalizationForm for user selection UI
 */
export const BACKGROUND_STYLE_DEFINITIONS: BackgroundStyleDefinition[] = [
  // BTS-Themed Styles
  {
    id: 'purple-nebula',
    name: 'Purple Nebula',
    description: 'Cosmic purple galaxy with flowing energy',
    category: 'bts-themed'
  },
  {
    id: 'stage-lights',
    name: 'Stage Lights',
    description: 'Dynamic concert spotlight beams',
    category: 'bts-themed'
  },
  {
    id: 'army-constellation',
    name: 'Color Prism',
    description: 'Multicolored light spectrum effect',
    category: 'modern-premium'
  },
  {
    id: 'purple-aurora',
    name: 'Aurora Flow',
    description: 'Flowing wave bands with soft glow',
    category: 'bts-themed'
  },
  // Modern Premium Styles
  {
    id: 'mesh-gradient',
    name: 'Gradient Mesh',
    description: 'Interweaving gradient blend pattern',
    category: 'modern-premium'
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Frosted glass with soft blur effect',
    category: 'modern-premium'
  },
  {
    id: 'geometric-grid',
    name: 'Geometric Grid',
    description: 'Structured pattern with depth layers',
    category: 'modern-premium'
  },
  {
    id: 'holographic',
    name: 'Holographic',
    description: 'Iridescent shimmer with depth',
    category: 'modern-premium'
  }
]

/**
 * Mobile Detection
 * Used to reduce gradient complexity on mobile devices for better performance
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Supports Backdrop Filter Detection
 * Glassmorphism falls back to gradient-only if backdrop-filter isn't supported
 */
const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false
  return CSS.supports('backdrop-filter', 'blur(10px)') || CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
}

/**
 * Generate Background Styles
 * Creates performance-optimized CSS styles with dynamic accent colors and intensity
 *
 * @param accentColor - User's selected accent color (hex format)
 * @param intensityFactor - Theme intensity (0.0 to 1.0 scale)
 * @param withAlpha - Helper function to add alpha channel to hex colors
 * @returns Record of all background styles with CSSProperties
 */
export const getBackgroundStyles = (
  accentColor: string,
  intensityFactor: number,
  withAlpha: (hex: string, alpha: number) => string
): Record<AnyBackgroundStyleId, CSSProperties> => {
  const isMobile = isMobileDevice()
  const hasBackdropFilter = supportsBackdropFilter()

  return {
    /**
     * 1. Purple Nebula (BTS-Themed)
     * Cosmic nebula effect with 4 overlapping radial gradients
     * Performance: 3 gradients on mobile, 4 on desktop
     */
    'purple-nebula': {
      backgroundColor: '#0a0012',
      backgroundImage: isMobile
        ? // Mobile: 3 gradients for performance
          `radial-gradient(circle at 25% 30%, ${withAlpha(accentColor, 0.5 + intensityFactor * 0.35)} 0%, transparent 40%),
           radial-gradient(circle at 75% 60%, ${withAlpha(accentColor, 0.4 + intensityFactor * 0.3)} 0%, transparent 45%),
           radial-gradient(circle at 50% 80%, ${withAlpha(accentColor, 0.35 + intensityFactor * 0.25)} 0%, transparent 50%)`
        : // Desktop: 4 gradients for richer effect
          `radial-gradient(circle at 25% 30%, ${withAlpha(accentColor, 0.5 + intensityFactor * 0.35)} 0%, transparent 40%),
           radial-gradient(circle at 75% 60%, ${withAlpha(accentColor, 0.4 + intensityFactor * 0.3)} 0%, transparent 45%),
           radial-gradient(circle at 50% 80%, ${withAlpha(accentColor, 0.35 + intensityFactor * 0.25)} 0%, transparent 50%),
           radial-gradient(circle at 90% 15%, ${withAlpha(accentColor, 0.25 + intensityFactor * 0.2)} 0%, transparent 25%)`,
      backgroundSize: '100% 100%',
      contain: 'paint' // Performance: isolate to own layer
    },

    /**
     * 2. Stage Lights (BTS-Themed)
     * Concert spotlight beams using conic gradients from corners
     * Performance: GPU-accelerated conic gradients
     */
    'stage-lights': {
      backgroundColor: '#0f0520',
      backgroundImage: `conic-gradient(from 135deg at 0% 0%, ${withAlpha(accentColor, 0.35 + intensityFactor * 0.35)} 0deg, transparent 60deg),
                        conic-gradient(from 225deg at 100% 0%, ${withAlpha(accentColor, 0.3 + intensityFactor * 0.3)} 0deg, transparent 60deg),
                        conic-gradient(from 45deg at 0% 100%, ${withAlpha(accentColor, 0.25 + intensityFactor * 0.25)} 0deg, transparent 60deg),
                        radial-gradient(circle at 50% 50%, ${withAlpha(accentColor, 0.12 + intensityFactor * 0.15)} 0%, transparent 60%)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    },

    /**
     * 3. Color Prism (Modern Premium)
     * Multicolored prismatic light spectrum - combines accent color with complementary colors
     * Performance: 4 gradients with rainbow effect, accent color remains dominant
     */
    'army-constellation': {
      backgroundColor: '#0a0418',
      backgroundImage: isMobile
        ? // Mobile: 3 color zones
          `radial-gradient(circle at 30% 20%, ${withAlpha(accentColor, 0.3 + intensityFactor * 0.25)} 0%, transparent 45%),
           radial-gradient(circle at 70% 50%, ${withAlpha('#ff69b4', 0.18 + intensityFactor * 0.15)} 0%, transparent 45%),
           radial-gradient(circle at 40% 80%, ${withAlpha('#00d4ff', 0.2 + intensityFactor * 0.18)} 0%, transparent 45%)`
        : // Desktop: 4 color zones for full spectrum
          `radial-gradient(circle at 30% 20%, ${withAlpha(accentColor, 0.3 + intensityFactor * 0.25)} 0%, transparent 45%),
           radial-gradient(circle at 75% 25%, ${withAlpha('#ff69b4', 0.18 + intensityFactor * 0.15)} 0%, transparent 40%),
           radial-gradient(circle at 65% 70%, ${withAlpha('#00d4ff', 0.2 + intensityFactor * 0.18)} 0%, transparent 45%),
           radial-gradient(circle at 20% 75%, ${withAlpha('#ffd700', 0.15 + intensityFactor * 0.12)} 0%, transparent 40%)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    },

    /**
     * 4. Aurora Flow (BTS-Themed)
     * Smooth flowing aurora waves with vertical gradient curtains
     * Performance: Multiple soft gradients create flowing aurora effect
     */
    'purple-aurora': {
      backgroundColor: '#060014',
      backgroundImage: `linear-gradient(90deg,
                        transparent 0%,
                        ${withAlpha(accentColor, 0.1 + intensityFactor * 0.15)} 15%,
                        ${withAlpha(accentColor, 0.35 + intensityFactor * 0.3)} 25%,
                        ${withAlpha(accentColor, 0.15 + intensityFactor * 0.2)} 35%,
                        transparent 45%,
                        ${withAlpha(accentColor, 0.12 + intensityFactor * 0.18)} 55%,
                        ${withAlpha(accentColor, 0.4 + intensityFactor * 0.35)} 65%,
                        ${withAlpha(accentColor, 0.2 + intensityFactor * 0.25)} 75%,
                        ${withAlpha(accentColor, 0.1 + intensityFactor * 0.15)} 85%,
                        transparent 100%),
                        radial-gradient(ellipse 150% 50% at 50% 0%, ${withAlpha(accentColor, 0.25 + intensityFactor * 0.2)} 0%, transparent 60%),
                        radial-gradient(ellipse 150% 50% at 50% 100%, ${withAlpha(accentColor, 0.2 + intensityFactor * 0.18)} 0%, transparent 60%)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    },

    /**
     * 5. Gradient Mesh (Modern Premium) - DEFAULT STYLE
     * Grid mesh with gradient nodes - like a 3D wireframe
     * Performance: Diagonal repeating lines create mesh grid pattern
     */
    'mesh-gradient': {
      backgroundColor: '#0b0318',
      backgroundImage: `repeating-linear-gradient(45deg,
                        transparent 0px,
                        transparent 80px,
                        ${withAlpha(accentColor, 0.15 + intensityFactor * 0.2)} 80px,
                        ${withAlpha(accentColor, 0.15 + intensityFactor * 0.2)} 82px,
                        transparent 82px,
                        transparent 160px),
                        repeating-linear-gradient(-45deg,
                        transparent 0px,
                        transparent 80px,
                        ${withAlpha(accentColor, 0.15 + intensityFactor * 0.2)} 80px,
                        ${withAlpha(accentColor, 0.15 + intensityFactor * 0.2)} 82px,
                        transparent 82px,
                        transparent 160px),
                        radial-gradient(circle at 20% 30%, ${withAlpha(accentColor, 0.3 + intensityFactor * 0.25)} 0%, transparent 40%),
                        radial-gradient(circle at 80% 70%, ${withAlpha(accentColor, 0.25 + intensityFactor * 0.2)} 0%, transparent 40%)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    },

    /**
     * 6. Glassmorphism (Modern Premium)
     * Frosted glass effect with backdrop blur (when supported)
     * Performance: Falls back to gradient-only on mobile/unsupported browsers
     */
    'glassmorphism': hasBackdropFilter && !isMobile
      ? // Desktop with backdrop-filter support
        {
          backgroundColor: withAlpha('#1a0f2e', 0.4),
          backgroundImage: `radial-gradient(circle at 30% 30%, ${withAlpha(accentColor, 0.15 + intensityFactor * 0.17)} 0%, transparent 50%),
                            radial-gradient(circle at 70% 70%, ${withAlpha(accentColor, 0.12 + intensityFactor * 0.15)} 0%, transparent 50%)`,
          backdropFilter: 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: 'blur(12px) saturate(150%)',
          backgroundSize: '100% 100%',
          contain: 'paint'
        }
      : // Mobile or no backdrop-filter support: gradient-only fallback
        {
          backgroundColor: '#120824',
          backgroundImage: `radial-gradient(circle at 30% 30%, ${withAlpha(accentColor, 0.25 + intensityFactor * 0.23)} 0%, transparent 50%),
                            radial-gradient(circle at 70% 70%, ${withAlpha(accentColor, 0.18 + intensityFactor * 0.2)} 0%, transparent 50%),
                            linear-gradient(135deg, ${withAlpha(accentColor, 0.08)} 0%, transparent 50%)`,
          backgroundSize: '100% 100%',
          contain: 'paint'
        },

    /**
     * 7. Geometric Grid (Modern Premium)
     * Structured grid pattern with radial highlights
     * Performance: Repeating gradients are efficient, limited to 4 layers total
     */
    'geometric-grid': {
      backgroundColor: '#0c0318',
      backgroundImage: `radial-gradient(circle at 25% 35%, ${withAlpha(accentColor, 0.15 + intensityFactor * 0.25)} 0%, transparent 40%),
                        radial-gradient(circle at 75% 65%, ${withAlpha(accentColor, 0.12 + intensityFactor * 0.2)} 0%, transparent 40%),
                        repeating-linear-gradient(0deg,
                          transparent 0px,
                          transparent 49px,
                          ${withAlpha(accentColor, 0.08 + intensityFactor * 0.12)} 49px,
                          ${withAlpha(accentColor, 0.08 + intensityFactor * 0.12)} 50px),
                        repeating-linear-gradient(90deg,
                          transparent 0px,
                          transparent 49px,
                          ${withAlpha(accentColor, 0.08 + intensityFactor * 0.12)} 49px,
                          ${withAlpha(accentColor, 0.08 + intensityFactor * 0.12)} 50px)`,
      backgroundSize: '100% 100%, 100% 100%, 50px 50px, 50px 50px',
      contain: 'paint'
    },

    /**
     * 8. Holographic (Modern Premium)
     * Iridescent rainbow shimmer with accent color overlay
     * Performance: Conic gradient + radial overlay, GPU-accelerated
     */
    'holographic': {
      backgroundColor: '#0a0220',
      backgroundImage: `radial-gradient(circle at 50% 50%, ${withAlpha(accentColor, 0.35 + intensityFactor * 0.3)} 0%, transparent 70%),
                        conic-gradient(from 45deg at 50% 50%,
                          ${withAlpha(accentColor, 0.22 + intensityFactor * 0.2)} 0deg,
                          ${withAlpha('#ff00ff', 0.15 + intensityFactor * 0.15)} 60deg,
                          ${withAlpha('#00ffff', 0.12 + intensityFactor * 0.12)} 120deg,
                          ${withAlpha(accentColor, 0.18 + intensityFactor * 0.18)} 180deg,
                          ${withAlpha('#ffff00', 0.1 + intensityFactor * 0.1)} 240deg,
                          ${withAlpha('#ff00ff', 0.12 + intensityFactor * 0.12)} 300deg,
                          ${withAlpha(accentColor, 0.22 + intensityFactor * 0.2)} 360deg)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    },

    /**
     * LEGACY STYLES (for backward compatibility)
     * These map to new styles but maintain old IDs during migration
     */
    'gradient': {
      // Legacy: Maps to simplified mesh-gradient
      backgroundColor: '#0e0520',
      backgroundImage: `linear-gradient(140deg, ${withAlpha(accentColor, 0.45 + intensityFactor * 0.35)} 0%, ${withAlpha(accentColor, 0.1)} 100%)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    },

    'noise': {
      // Legacy: Simplified texture pattern
      backgroundColor: '#12021f',
      backgroundImage: `radial-gradient(circle at 20% 20%, ${withAlpha(accentColor, 0.2 + intensityFactor * 0.15)} 0%, transparent 55%),
                        radial-gradient(circle at 80% 0%, ${withAlpha(accentColor, 0.12 + intensityFactor * 0.1)} 0%, transparent 45%)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    },

    'bts-motif': {
      // Legacy: Simplified pattern
      backgroundColor: '#11041d',
      backgroundImage: `radial-gradient(circle at 15% 25%, ${withAlpha(accentColor, 0.25 + intensityFactor * 0.2)} 0%, transparent 55%),
                        radial-gradient(circle at 85% 35%, ${withAlpha(accentColor, 0.18 + intensityFactor * 0.15)} 0%, transparent 50%)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    },

    'clean': {
      // Legacy: Simple gradient
      backgroundColor: '#0e0520',
      backgroundImage: `linear-gradient(120deg, ${withAlpha(accentColor, 0.18 + intensityFactor * 0.15)} 0%, ${withAlpha('#000000', 0.5)} 100%)`,
      backgroundSize: '100% 100%',
      contain: 'paint'
    }
  }
}
