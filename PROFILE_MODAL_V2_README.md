# Profile Modal v2 - Implementation Guide

## Overview
Profile Modal v2 is a comprehensive, tabbed interface for managing user profiles in ARMYVERSE. It replaces the simple profile card with a feature-rich modal that includes profile management, personalization, connections, privacy settings, and notifications.

## Features

### 🎯 Core Features
- **Tabbed Interface**: 5 organized tabs for different aspects of profile management
- **Live Preview**: Real-time preview of how the profile appears to others
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: Full keyboard navigation, screen reader support, and ARIA compliance
- **Auto-save**: Intelligent auto-saving for certain fields with manual save option
- **Validation**: Real-time validation with helpful error messages

### 📱 Tabs Overview

#### 1. Profile Tab
- Basic information (display name, username, pronouns, bio)
- Avatar and banner upload with drag & drop
- ARMY-specific fields (bias, era, ARMY since)
- Advanced options (top song/album, location, language)
- Quick actions (copy profile link, view public profile)

#### 2. Personalization Tab
- Accent color picker with custom color support
- Theme intensity slider
- Background style selection
- Card density preferences
- Motion preferences (reduce animations)
- Badge style selection

#### 3. Connections Tab
- Spotify integration with OAuth flow
- Social media links (Twitter, Instagram, YouTube, Website)
- Per-link visibility controls
- Connection status monitoring

#### 4. Privacy & Safety Tab
- Profile visibility controls (public, followers, private)
- Field-level visibility toggles
- Content filtering options
- Communication preferences
- Blocked users management
- Data export and account deletion

#### 5. Notifications Tab
- Delivery channel preferences (in-app, email)
- Quiet hours configuration
- Notification type controls
- Category-specific settings

## Technical Implementation

### 🏗️ Architecture

```
components/profile/
├── ProfileModal.tsx          # Main modal component
├── ProfilePreview.tsx        # Live preview panel
├── ProfileForm.tsx           # Profile tab form
├── PersonalizationForm.tsx   # Personalization tab form
├── ConnectionsForm.tsx       # Connections tab form
├── PrivacyForm.tsx           # Privacy tab form
├── NotificationsForm.tsx     # Notifications tab form
├── AvatarUploader.tsx        # Avatar upload component
└── BannerUploader.tsx        # Banner upload component
```

### 🔧 Key Components

#### ProfileModal.tsx
- Main container with tabbed interface
- State management for profile data
- API integration for save/load
- Keyboard shortcuts and accessibility
- Focus trap and navigation

#### ProfilePreview.tsx
- Live preview of public profile
- Respects privacy settings
- Real-time updates
- Responsive design

#### Form Components
- Individual forms for each tab
- Validation and error handling
- Auto-save functionality
- Analytics tracking

#### Upload Components
- Drag & drop support
- Image compression
- Progress indicators
- Error handling

### 🗄️ Data Model

The User model has been extended with a comprehensive profile subdocument:

```typescript
interface ProfileData {
  // Public fields
  displayName: string
  handle: string
  pronouns: string
  bio: string
  avatarUrl: string
  bannerUrl: string
  bias: string[]
  biasWrecker: string
  favoriteEra: string
  armySinceYear: number
  topSong: { id: string; name: string; artist: string } | null
  topAlbum: { id: string; name: string; artist: string } | null
  socials: {
    twitter: string
    instagram: string
    youtube: string
    website: string
    visibility: Record<string, boolean>
  }
  location: string
  timezone: string
  language: string
  
  // Personalization
  personalization: {
    accentColor: string
    themeIntensity: number
    backgroundStyle: 'gradient' | 'noise' | 'bts-motif' | 'clean'
    density: 'comfortable' | 'compact'
    reduceMotion: boolean
    badgeStyle: 'minimal' | 'collectible'
  }
  
  // Privacy & Safety
  privacy: {
    visibility: 'public' | 'followers' | 'private'
    fieldVisibility: Record<string, boolean>
    explicitContentFilter: boolean
    allowMentions: boolean
    allowDMs: boolean
    blockedUserIds: string[]
  }
  
  // Notifications
  notifications: {
    channels: { inApp: boolean; email: boolean }
    quietHours: { start: string; end: string; timezone: string }
    blog: { comments: boolean; reactions: boolean; saves: boolean }
    playlists: { exports: boolean; likes: boolean }
    spotify: { weeklyRecap: boolean; recommendations: boolean }
  }
  
  // Stats
  stats: {
    totalPlaylists: number
    totalLikes: number
    totalSaves: number
  }
}
```

### 🔌 API Endpoints

#### GET /api/user/profile
- Returns merged profile data (MongoDB + Firebase Auth)
- Handles authentication
- Returns default values for missing fields

#### PUT /api/user/profile
- Validates and saves profile updates
- Enforces handle uniqueness
- Supports partial updates
- Returns updated profile data

### 🎨 Design System

#### Colors
- Primary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Warning: Yellow (#F59E0B)
- Info: Blue (#3B82F6)

#### Typography
- Headings: Inter, 600 weight
- Body: Inter, 400 weight
- Small: Inter, 400 weight, 0.875rem

#### Spacing
- 8px base unit
- 12px, 16px, 24px, 32px, 48px scale

#### Components
- Glassmorphism design with subtle borders
- Gradient backgrounds
- Soft shadows
- Rounded corners (12px, 16px)
- Smooth transitions

### ♿ Accessibility Features

#### Keyboard Navigation
- Tab navigation throughout modal
- Shift+Tab for reverse navigation
- Enter/Space for button activation
- Arrow keys for dropdowns
- Escape to close modal
- Ctrl/Cmd+S to save

#### Screen Reader Support
- Proper ARIA labels and descriptions
- Role attributes for custom components
- Live regions for dynamic content
- Semantic HTML structure

#### Visual Accessibility
- High contrast focus indicators
- Sufficient color contrast ratios
- Scalable text (up to 200% zoom)
- No color-only information

### 📊 Analytics Integration

The modal tracks various user interactions:

```typescript
// Profile events
'profile_opened'
'profile_saved'
'profile_tab_changed'
'profile_link_copied'

// Field events
'field_toggled_visibility'
'handle_availability_checked'
'spotify_search_performed'

// Connection events
'connection_connected'
'connection_disconnected'

// Upload events
'avatar_uploaded'
'banner_uploaded'

// Privacy events
'privacy_setting_changed'
'notification_setting_changed'
'data_exported'
'account_deletion_initiated'
```

## Usage

### Basic Usage

```tsx
import ProfileModal from '@/components/profile/ProfileModal'

function App() {
  return (
    <ProfileModal
      trigger={<button>Edit Profile</button>}
      defaultTab="profile"
    />
  )
}
```

### Advanced Usage

```tsx
import ProfileModal from '@/components/profile/ProfileModal'

function App() {
  const handleProfileUpdate = (updates) => {
    console.log('Profile updated:', updates)
  }

  return (
    <ProfileModal
      trigger={<button>Edit Profile</button>}
      defaultTab="personalization"
      onUpdate={handleProfileUpdate}
    />
  )
}
```

## Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Optional
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760
```

### Feature Flags

```typescript
// Enable/disable features
const FEATURES = {
  SPOTIFY_INTEGRATION: true,
  SOCIAL_LINKS: true,
  ADVANCED_PRIVACY: true,
  NOTIFICATIONS: true,
  DATA_EXPORT: true,
  ACCOUNT_DELETION: true
}
```

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components load only when needed
- **Image Compression**: Automatic compression for uploads
- **Debounced Requests**: Reduces API calls for real-time features
- **Memoization**: Prevents unnecessary re-renders
- **Virtual Scrolling**: For large lists (if needed)

### Bundle Size
- Core modal: ~45KB gzipped
- All components: ~85KB gzipped
- Dependencies: ~120KB gzipped
- Total: ~250KB gzipped

## Security Considerations

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- XSS prevention
- SQL injection prevention
- File upload security

### Authentication
- Firebase Auth integration
- Session management
- CSRF protection
- Rate limiting

### Privacy
- Data encryption in transit
- Secure file storage
- Privacy controls
- GDPR compliance

## Testing

### Unit Tests
- Component rendering
- Form validation
- API integration
- Error handling

### Integration Tests
- End-to-end workflows
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility compliance

### Manual Testing
- See `QA_CHECKLIST.md` for comprehensive testing guide

## Deployment

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Firebase project
- Next.js 14+

### Build Process
```bash
npm install
npm run build
npm start
```

### Environment Setup
1. Configure Firebase
2. Set up MongoDB
3. Configure environment variables
4. Run database migrations
5. Deploy to production

## Monitoring

### Error Tracking
- Console error monitoring
- API error tracking
- User error reporting
- Performance monitoring

### Analytics
- User engagement metrics
- Feature usage statistics
- Performance metrics
- Error rates

## Troubleshooting

### Common Issues

#### Modal Not Opening
- Check if user is authenticated
- Verify trigger element is properly wrapped
- Check for JavaScript errors

#### Save Not Working
- Check network connectivity
- Verify API endpoint is accessible
- Check for validation errors
- Review server logs

#### Upload Failures
- Check file size limits
- Verify file type restrictions
- Check network connectivity
- Review server configuration

#### Accessibility Issues
- Test with screen readers
- Verify keyboard navigation
- Check color contrast
- Test with different zoom levels

### Debug Mode

Enable debug mode for development:

```typescript
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Profile Modal Debug:', {
    user: user,
    profile: profile,
    errors: errors
  })
}
```

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style
- Use TypeScript
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Testing
- Write unit tests for new features
- Update integration tests
- Test accessibility
- Test performance

## Roadmap

### Phase 1 (Current)
- ✅ Core modal implementation
- ✅ All 5 tabs
- ✅ Live preview
- ✅ Accessibility
- ✅ Analytics

### Phase 2 (Future)
- [ ] Advanced image editing
- [ ] Bulk import/export
- [ ] Advanced privacy controls
- [ ] Custom themes
- [ ] Plugin system

### Phase 3 (Future)
- [ ] AI-powered suggestions
- [ ] Social features
- [ ] Advanced analytics
- [ ] Mobile app integration
- [ ] Third-party integrations

## Support

### Documentation
- Component documentation
- API documentation
- User guides
- Video tutorials

### Community
- GitHub issues
- Discord server
- Stack Overflow
- Reddit community

### Professional Support
- Enterprise support
- Custom development
- Training and consulting
- Priority bug fixes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- BTS for inspiration
- ARMY community for feedback
- Open source contributors
- Design system contributors
- Accessibility advocates
