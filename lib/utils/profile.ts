import { z } from 'zod'

// Validation schemas
export const handleSchema = z.string()
  .min(3, 'Handle must be at least 3 characters')
  .max(24, 'Handle must be less than 24 characters')
  .regex(/^[a-z0-9_-]+$/, 'Handle can only contain lowercase letters, numbers, hyphens, and underscores')
  .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Handle cannot start or end with a hyphen')
  .refine(val => !val.startsWith('_') && !val.endsWith('_'), 'Handle cannot start or end with an underscore')

export const displayNameSchema = z.string()
  .min(2, 'Display name must be at least 2 characters')
  .max(40, 'Display name must be less than 40 characters')
  .trim()

export const bioSchema = z.string()
  .max(160, 'Bio must be less than 160 characters')
  .trim()

export const pronounsSchema = z.string()
  .max(50, 'Pronouns must be less than 50 characters')
  .trim()

export const urlSchema = z.string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))

// Social media URL validation
export const socialUrlSchema = z.string()
  .refine((val) => {
    if (!val) return true
    try {
      const url = new URL(val)
      return ['http:', 'https:'].includes(url.protocol)
    } catch {
      return false
    }
  }, 'Please enter a valid URL')
  .optional()
  .or(z.literal(''))

// Time validation for quiet hours
export const timeSchema = z.string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format')
  .optional()

// Validation functions
export const validateHandle = (handle: string): { isValid: boolean; error?: string } => {
  try {
    handleSchema.parse(handle)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message }
    }
    return { isValid: false, error: 'Invalid handle' }
  }
}

export const validateDisplayName = (name: string): { isValid: boolean; error?: string } => {
  try {
    displayNameSchema.parse(name)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message }
    }
    return { isValid: false, error: 'Invalid display name' }
  }
}

export const validateBio = (bio: string): { isValid: boolean; error?: string } => {
  try {
    bioSchema.parse(bio)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message }
    }
    return { isValid: false, error: 'Invalid bio' }
  }
}

export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    urlSchema.parse(url)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message }
    }
    return { isValid: false, error: 'Invalid URL' }
  }
}

// Transform functions
export const slugifyHandle = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/^-+|-+$/g, '')
    .substring(0, 24)
}

export const formatSocialUrl = (url: string, platform: string): string => {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    
    // Ensure https
    if (urlObj.protocol !== 'https:') {
      urlObj.protocol = 'https:'
    }
    
    return urlObj.toString()
  } catch {
    // If URL is invalid, try to construct a valid one
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '')
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/${cleanUrl.replace('@', '')}`
      case 'instagram':
        return `https://instagram.com/${cleanUrl.replace('@', '')}`
      case 'youtube':
        if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
          return `https://${cleanUrl}`
        }
        return `https://youtube.com/@${cleanUrl}`
      default:
        return `https://${cleanUrl}`
    }
  }
}

export const extractSocialHandle = (url: string, platform: string): string => {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    switch (platform) {
      case 'twitter':
        return pathname.replace('/', '').replace('@', '')
      case 'instagram':
        return pathname.replace('/', '').replace('@', '')
      case 'youtube':
        if (pathname.startsWith('/@')) {
          return pathname.replace('/@', '')
        }
        return pathname.replace('/', '')
      default:
        return pathname.replace('/', '')
    }
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace('@', '')
  }
}

// Default profile values
export const getDefaultProfile = () => ({
  displayName: undefined,
  handle: undefined,
  pronouns: undefined,
  bio: undefined,
  avatarUrl: undefined,
  bannerUrl: undefined,
  bias: [],
  biasWrecker: undefined,
  favoriteEra: undefined,
  armySinceYear: undefined,
  topSong: undefined,
  topAlbum: undefined,
  socials: {
    twitter: undefined,
    instagram: undefined,
    youtube: undefined,
    website: undefined,
    visibility: {
      twitter: true,
      instagram: true,
      youtube: true,
      website: true
    }
  },
  location: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: 'en',
  personalization: {
    accentColor: '#8B5CF6',
    themeIntensity: 50,
    backgroundStyle: 'mesh-gradient' as const,
    badgeStyle: 'minimal' as const
  },
  privacy: {
    visibility: 'public' as const,
    fieldVisibility: {
      bias: true,
      era: true,
      socials: true,
      stats: true
    },
    explicitContentFilter: true,
    allowMentions: true,
    allowDMs: true,
    blockedUserIds: [] as string[]
  },
  notifications: {
    channels: {
      inApp: true,
      email: true
    },
    quietHours: {
      start: '',
      end: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    blog: {
      comments: true,
      reactions: true,
      saves: true
    },
    playlists: {
      exports: true,
      likes: true
    },
    spotify: {
      weeklyRecap: true,
      recommendations: true
    }
  },
  stats: {
    totalPlaylists: 0,
    totalLikes: 0,
    totalSaves: 0
  }
})

// Profile visibility helpers
export const isFieldVisible = (field: string, privacy: any, isOwnProfile: boolean = false): boolean => {
  if (isOwnProfile) return true
  
  // Handle undefined privacy object
  if (!privacy) return true
  
  if (privacy.visibility === 'private') return false
  if (privacy.visibility === 'followers') {
    // TODO: Implement follower check
    return true
  }
  
  return privacy.fieldVisibility?.[field] ?? true
}

export const getPublicProfile = (profile: any) => {
  if (!profile) return {}
  
  const publicProfile = { ...profile }
  
  // Remove private fields
  delete publicProfile.privacy
  delete publicProfile.notifications
  delete publicProfile.stats
  
  // Filter socials based on visibility
  if (publicProfile.socials && publicProfile.socials.visibility) {
    Object.keys(publicProfile.socials.visibility).forEach(platform => {
      if (!publicProfile.socials.visibility[platform]) {
        delete publicProfile.socials[platform]
      }
    })
  }
  
  return publicProfile
}
