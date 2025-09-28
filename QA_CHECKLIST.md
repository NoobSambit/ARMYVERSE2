# Profile Modal v2 - QA Checklist

## Overview
This checklist covers the new Profile Modal v2 implementation with tabbed interface, live preview, and comprehensive profile management.

## Pre-Testing Setup
- [ ] Ensure user is logged in with Firebase Auth
- [ ] Clear browser cache and localStorage
- [ ] Test on both desktop and mobile viewports
- [ ] Enable browser dev tools for console monitoring

## Core Functionality

### Modal Behavior
- [ ] Modal opens from trigger element
- [ ] Modal closes with Escape key
- [ ] Modal closes with X button
- [ ] Modal closes when clicking overlay
- [ ] Focus trap works correctly (Tab navigation stays within modal)
- [ ] Keyboard shortcuts work (Ctrl/Cmd+S to save)

### Tab Navigation
- [ ] All 5 tabs are present: Profile, Personalization, Connections, Privacy & Safety, Notifications
- [ ] Tab switching works with mouse clicks
- [ ] Tab switching works with keyboard navigation
- [ ] Active tab is visually highlighted
- [ ] Tab content loads correctly for each tab
- [ ] Tab icons display properly

### Responsive Design
- [ ] Modal is responsive on desktop (max-width 1200px)
- [ ] Modal is responsive on tablet (768px-1024px)
- [ ] Modal is responsive on mobile (320px-767px)
- [ ] Preview panel toggles correctly on mobile
- [ ] Text remains readable at all sizes
- [ ] Buttons remain accessible at all sizes

## Profile Tab

### Basic Information
- [ ] Display name field accepts 2-40 characters
- [ ] Display name validation works (shows error for invalid length)
- [ ] Username/handle field accepts 3-24 characters
- [ ] Username validation works (alphanumeric, hyphens, underscores only)
- [ ] Username availability check works (shows loading, success, error states)
- [ ] Pronouns field accepts free text with suggestions
- [ ] Bio field accepts up to 160 characters with counter
- [ ] Character counters update in real-time

### Avatar & Banner
- [ ] Avatar uploader accepts drag & drop
- [ ] Avatar uploader accepts file selection
- [ ] Avatar uploader validates file type (JPEG, PNG, WebP)
- [ ] Avatar uploader validates file size (max 5MB)
- [ ] Avatar uploader compresses images
- [ ] Avatar uploader shows progress during upload
- [ ] Avatar uploader shows success/error states
- [ ] Banner uploader works similarly to avatar
- [ ] Banner uploader crops to 16:6 aspect ratio
- [ ] Remove buttons work for both avatar and banner

### ARMY Information
- [ ] Bias selection works (multi-select from BTS members)
- [ ] Bias wrecker selection works (single select)
- [ ] Favorite era selection works (dropdown)
- [ ] ARMY since year selection works (dropdown)
- [ ] All selections save correctly

### Advanced Options (Show More)
- [ ] "Show More" toggle expands/collapses advanced options
- [ ] Top song search works with Spotify integration
- [ ] Top song selection saves correctly
- [ ] Location field accepts text input
- [ ] Language selection works (dropdown)
- [ ] All advanced options save correctly

### Quick Actions
- [ ] Copy profile link works (copies to clipboard)
- [ ] View public profile opens in new tab
- [ ] Both actions only show when handle is set

## Personalization Tab

### Accent Color
- [ ] Color picker shows predefined colors
- [ ] Color selection works
- [ ] Custom color input works
- [ ] Selected color is visually indicated
- [ ] Changes apply to preview immediately

### Theme Intensity
- [ ] Slider works (0-100 range)
- [ ] Value displays correctly
- [ ] Changes apply to preview immediately

### Background Style
- [ ] All 4 options are selectable
- [ ] Selected option is visually indicated
- [ ] Changes apply to preview immediately

### Card Density
- [ ] Both options are selectable
- [ ] Selected option is visually indicated
- [ ] Changes apply to preview immediately

### Motion Preferences
- [ ] Reduce animations toggle works
- [ ] Changes apply to preview immediately

### Badge Style
- [ ] Both options are selectable
- [ ] Selected option is visually indicated
- [ ] Changes apply to preview immediately

## Connections Tab

### Spotify Connection
- [ ] Connection status displays correctly
- [ ] Connect button works (redirects to Spotify OAuth)
- [ ] Disconnect button works
- [ ] Reconnect button works
- [ ] Permissions/scopes display correctly
- [ ] Loading states work correctly

### Social Links
- [ ] All 4 social platforms are present
- [ ] URL validation works for each platform
- [ ] URL formatting works (adds https, formats handles)
- [ ] Handle extraction works
- [ ] Visibility toggles work
- [ ] Test links work (open in new tab)
- [ ] Error states display correctly
- [ ] Success states display correctly

## Privacy & Safety Tab

### Profile Visibility
- [ ] All 3 visibility options are selectable
- [ ] Selected option is visually indicated
- [ ] Changes apply to preview immediately

### Field Visibility
- [ ] All 4 field toggles work
- [ ] Toggle states save correctly
- [ ] Changes apply to preview immediately

### Content & Communication
- [ ] Explicit content filter toggle works
- [ ] Allow mentions toggle works
- [ ] Allow DMs toggle works
- [ ] All toggles save correctly

### Blocked Users
- [ ] Blocked users list displays correctly
- [ ] Unblock functionality works
- [ ] Empty state displays correctly

### Data Controls
- [ ] Export data button works (downloads JSON)
- [ ] Delete account button shows confirmation
- [ ] Delete confirmation requires "DELETE" text
- [ ] Delete confirmation has proper safeguards
- [ ] Cancel button works in delete flow

## Notifications Tab

### Delivery Channels
- [ ] In-app notifications toggle works
- [ ] Email notifications toggle works
- [ ] Both toggles save correctly

### Quiet Hours
- [ ] Enable toggle works
- [ ] Start time input works
- [ ] End time input works
- [ ] Timezone selection works
- [ ] All fields save correctly

### Notification Types
- [ ] Blog notifications (comments, reactions, saves) work
- [ ] Playlist notifications (exports, likes) work
- [ ] Spotify notifications (weekly recap, recommendations) work
- [ ] All toggles save correctly

## Live Preview

### Preview Panel
- [ ] Preview panel shows/hides correctly
- [ ] Preview updates in real-time
- [ ] Preview respects visibility settings
- [ ] Preview shows correct user data
- [ ] Preview handles missing data gracefully

### Preview Content
- [ ] Avatar displays correctly
- [ ] Banner displays correctly (if set)
- [ ] Display name displays correctly
- [ ] Handle displays correctly
- [ ] Pronouns display correctly
- [ ] Bio displays correctly
- [ ] Bias displays correctly (if visible)
- [ ] Bias wrecker displays correctly
- [ ] Favorite era displays correctly (if visible)
- [ ] ARMY since displays correctly
- [ ] Top song displays correctly (if set)
- [ ] Top album displays correctly (if set)
- [ ] Location displays correctly (if set)
- [ ] Social links display correctly (if visible)
- [ ] Stats display correctly (if visible)

## Data Persistence

### Save Functionality
- [ ] Manual save button works
- [ ] Auto-save works for certain fields
- [ ] Save button shows loading state
- [ ] Save button shows success state
- [ ] Save button shows error state
- [ ] Unsaved changes indicator works
- [ ] All changes persist after page refresh

### API Integration
- [ ] GET /api/user/profile works
- [ ] PUT /api/user/profile works
- [ ] Handle uniqueness validation works
- [ ] Error handling works correctly
- [ ] Loading states work correctly

## Accessibility

### Keyboard Navigation
- [ ] Tab navigation works throughout modal
- [ ] Shift+Tab navigation works
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work in dropdowns
- [ ] Escape closes modal
- [ ] Focus indicators are visible
- [ ] Focus trap works correctly

### Screen Reader Support
- [ ] All form fields have proper labels
- [ ] All buttons have proper aria-labels
- [ ] Tab panels have proper ARIA attributes
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Modal has proper role and description

### Visual Accessibility
- [ ] High contrast mode works
- [ ] Text remains readable at 200% zoom
- [ ] Focus indicators are clearly visible
- [ ] Color is not the only way to convey information
- [ ] Text has sufficient contrast ratio

## Performance

### Loading Performance
- [ ] Modal opens quickly (< 500ms)
- [ ] Tab switching is smooth (< 200ms)
- [ ] Image uploads don't block UI
- [ ] Large forms don't cause lag
- [ ] Preview updates are smooth

### Network Performance
- [ ] API calls are efficient
- [ ] Image compression works
- [ ] Debounced requests work
- [ ] Error handling doesn't cause loops
- [ ] Offline behavior is graceful

## Error Handling

### Network Errors
- [ ] Connection errors display properly
- [ ] Timeout errors display properly
- [ ] Server errors display properly
- [ ] Retry mechanisms work
- [ ] Error states don't break UI

### Validation Errors
- [ ] Field validation errors display
- [ ] Form validation errors display
- [ ] Error messages are helpful
- [ ] Error states clear on correction
- [ ] Multiple errors display correctly

### Edge Cases
- [ ] Empty form submission
- [ ] Invalid file uploads
- [ ] Network interruption during upload
- [ ] Concurrent edits
- [ ] Browser back/forward navigation

## Analytics

### Event Tracking
- [ ] Profile opened event fires
- [ ] Profile saved event fires
- [ ] Tab changed event fires
- [ ] Field visibility toggled event fires
- [ ] Connection events fire
- [ ] Upload events fire
- [ ] Search events fire
- [ ] Privacy setting changed events fire
- [ ] Notification setting changed events fire

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Firefox Mobile

## Security

### Input Validation
- [ ] XSS prevention works
- [ ] SQL injection prevention works
- [ ] File upload security works
- [ ] URL validation works
- [ ] Input sanitization works

### Authentication
- [ ] Unauthenticated users can't access
- [ ] Users can only edit their own profile
- [ ] Session management works
- [ ] CSRF protection works

## Final Checklist

### Before Release
- [ ] All tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Performance is acceptable
- [ ] Accessibility standards met
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Analytics verified
- [ ] Error monitoring set up

### Post-Release
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Monitor user engagement
- [ ] Collect user feedback
- [ ] Plan improvements

## Notes
- Test with different user roles (admin, user)
- Test with different data states (empty profile, full profile)
- Test with different network conditions
- Test with different screen sizes
- Test with different input methods (mouse, keyboard, touch)
- Test with different assistive technologies
