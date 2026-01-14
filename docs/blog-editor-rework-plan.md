# ARMYVERSE Blog Editor Rework - Light Mode Implementation Plan

## Executive Summary

This document outlines the complete rework of the ARMYVERSE blog editor from dark/glassmorphism mode to a premium light-mode editorial experience. The redesign transforms the editor into a Medium-style writing environment optimized for BTS-focused content creation.

## Current State Analysis

### Existing Features ([components/blog/BlogEditor.tsx](../components/blog/BlogEditor.tsx))
- TipTap-based rich text editor
- Image upload (drag/drop/paste)
- Templates system
- Version history with localStorage
- SEO panel with scoring
- Preview mode
- Focus mode
- Keyboard shortcuts
- Mobile-responsive design with bottom sheets
- AI Assist panel
- Tags, mood, cover image, visibility controls

### Current Design Language
- Dark purple-black gradient backgrounds
- Glassmorphism UI elements
- Neon glow effects
- Heavy texture and gradients
- BTS-themed color scheme (purple, pink, dark)

## Design Philosophy: Light Mode Editorial

### Core Principles
1. **Editorial Elegance**: Clean, serif typography for headlines; airy, readable body text
2. **Content-First**: Minimal chrome, maximum writing space
3. **Premium Feel**: Subtle animations, refined spacing, quality interactions
4. **BTS Identity**: Maintain brand through accent colors and subtle design elements

### Visual Direction
- **Background**: Soft off-white (#FAFAFA) with subtle paper texture
- **Typography**:
  - Headings: Playfair Display (serif) - elegant, editorial
  - Body: Inter/System fonts - clean, modern
- **Accent Colors**: BTS purple (#8B5CF6) as primary accent
- **Surfaces**: White cards with subtle shadows
- **Borders**: Light gray (#E5E7EB) with purple accent on focus
- **Text**: Dark gray (#1F2937) for primary, medium gray for secondary

## Implementation Plan

### Phase 1: Core Editor UI Overhaul

#### 1.1 Layout Restructure
**File**: [components/blog/BlogEditor.tsx](../components/blog/BlogEditor.tsx)

**Changes**:
- Replace dark gradient backgrounds with light gradient
- Update glassmorphism containers to white cards with subtle shadows
- Change all text colors from white to dark gray
- Update button styles to light theme variants

**New CSS Classes to Add** ([app/globals.css](../app/globals.css)):
```css
/* Light mode editor base */
.editor-light-mode {
  background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
  min-height: 100vh;
}

/* Light mode card */
.card-light {
  background: white;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.card-light-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Light mode buttons */
.btn-primary-light {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.btn-secondary-light {
  background: white;
  border: 1px solid #E5E7EB;
  color: #374151;
}

.btn-secondary-light:hover {
  background: #F9FAFB;
  border-color: #8B5CF6;
}

/* Light mode inputs */
.input-light {
  background: white;
  border: 1px solid #E5E7EB;
  color: #1F2937;
}

.input-light::placeholder {
  color: #9CA3AF;
}

.input-light:focus {
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
```

#### 1.2 Top Action Bar Redesign

**Current**: Dark glassmorphism bar
**New**: White sticky header with subtle shadow

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✏️ Create Blog Post    [Focus] [History] [SEO] [Preview]  │
│                         💚 45    👁️   🔍    ⚡             │
│                                              [Draft] [Publish]│
└─────────────────────────────────────────────────────────────┘
```

**Changes**:
- White background with subtle bottom border
- Purple accent on active states
- SEO score badge with green/yellow/red indicators
- Simplified icon set (use Lucide icons consistently)

#### 1.3 Title Input Redesign

**Current**: Large white text on dark glass
**New**: Editorial-style serif heading

**Specifications**:
- Font: Playfair Display, 48px, semibold
- Color: #1F2937 (dark gray)
- Placeholder: "Give your post a title..."
- Remove subtitle field (per PRD)
- Add character counter (60 recommended, 70 max)

#### 1.4 Main Editor Area

**Current**: White box on dark gradient
**New**: Seamless white canvas

**Changes**:
- Remove background color from editor container
- Make editor span full width in center column
- Increase base font size to 18px
- Line height: 1.7 for better readability
- Max width: 720px for content (editorial standard)

**Editor Styling**:
```css
.editor-content-light {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 18px;
  line-height: 1.7;
  color: #1F2937;
}

.editor-content-light h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #111827;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.editor-content-light h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
}

.editor-content-light h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.editor-content-light p {
  margin-bottom: 1.25rem;
}

.editor-content-light blockquote {
  border-left: 3px solid #8B5CF6;
  padding-left: 1rem;
  color: #4B5563;
  font-style: italic;
}

.editor-content-light img {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

#### 1.5 Toolbar Redesign

**Current**: Dark glass toolbar
**New**: Light floating or sticky toolbar

**Two Options**:
1. **Floating bubble menu** (Medium-style): appears on text selection
2. **Sticky toolbar**: minimal icons below title

**Recommended**: Hybrid approach
- Sticky toolbar for common formatting (bold, italic, headings)
- Floating bubble menu for context-aware formatting
- Slash command menu for block insertion

**Toolbar Icons**:
- Use Lucide icons with purple accent on active
- Gray (#6B7280) default, purple (#8B5CF6) active
- Tooltip labels for accessibility

### Phase 2: Right Sidebar Redesign

#### 2.1 Sidebar Container

**Current**: Dark glass panels
**New**: White cards with light gray borders

**Layout**:
```
┌─────────────────────────┐
│  📷 Cover Image         │
│  [Upload area]          │
├─────────────────────────┤
│  🏷️ Tags (3/8)         │
│  [Tag chips]            │
│  [+ Add tag]            │
├─────────────────────────┤
│  ✨ Mood                │
│  [Emotional] [Fun]      │
│  [Hype] [Chill]         │
├─────────────────────────┤
│  🔍 SEO Preview         │
│  URL snippet preview    │
│  Score: 78 🟡           │
├─────────────────────────┤
│  🌐 Publish             │
│  [Draft] [Published]    │
│  [Public/Unlisted]      │
└─────────────────────────┘
```

**Styling**:
- White background (#FFFFFF)
- Light gray borders (#E5E7EB)
- Subtle shadows on hover
- Purple accents for active states
- Section headers with icons and medium-gray text

#### 2.2 Cover Image Section

**Current**: Dark with neon accents
**New**: Clean upload area

**Design**:
- Dashed border: #D1D5DB
- Upload icon: gray (#9CA3AF)
- Hover state: purple border, light purple background
- Image preview: shadow and rounded corners

**States**:
- Empty: Gray dashed box with "Drop image or click to upload"
- Loaded: Image preview with remove button (top-right)
- Alt text input below image

#### 2.3 Tags Section

**Current**: Glass chips with gradient
**New**: Pill-shaped tags

**Design**:
- Selected tags: Purple background (#8B5CF6), white text
- Unselected: Light gray background (#F3F4F6), gray text
- Remove button: × icon on hover
- Input: White with gray border, purple focus
- Suggestions: Light gray chips, purple on hover

**Max Tags**: 8 (enforced)

#### 2.4 Mood Section

**Current**: Neon-glowed buttons
**New**: Subtle pill buttons

**Design**:
- Grid: 2 columns × 3 rows
- Unselected: Light gray background, gray text
- Selected: Purple background with subtle glow
- Icons: Lucide icons in matching color

#### 2.5 SEO Preview Section

**Current**: Dark with green/yellow/red badges
**New**: Card-style preview

**Design**:
- Google-style SERP preview
- Title: blue link color
- URL: green URL color
- Description: gray text
- Score badge: colored circle with number

**Score Indicators**:
- 80+: Green (#10B981)
- 60-79: Yellow (#F59E0B)
- <60: Red (#EF4444)

#### 2.6 Publish Controls

**Current**: Glass buttons with neon glow
**New**: Clean segmented control

**Design**:
- Status toggle: Draft | Published
- Visibility: Public | Unlisted | Private (when published)
- Save button: Primary purple gradient
- Draft save: Secondary gray button

### Phase 3: Enhanced Editor Features

#### 3.1 Slash Command Menu

**New Feature**: Type "/" to insert blocks

**Implementation**:
- Use TipTap's suggestion system
- Menu appears on "/" at line start
- Categories: Text, Media, Embeds, Advanced

**Menu Items**:
```
/heading - Heading 1
/heading2 - Heading 2
/heading3 - Heading 3
/quote - Blockquote
/pullquote - Pull Quote
/code - Code Block
/bullets - Bullet List
/numbers - Numbered List
/task - Task List
/divider - Horizontal Rule
/image - Upload Image
/youtube - YouTube Embed
/spotify - Spotify Embed
/twitter - Twitter/X Embed
/lyrics - Lyrics Block (BTS special)
/table - Table
```

**Styling**:
- White background with shadow
- Purple accent on selection
- Keyboard navigation (↑↓, Enter)
- Icon + name + shortcut key

#### 3.2 Bubble Menu (Inline Formatting)

**New Feature**: Selection-based formatting menu

**Implementation**:
- Use TipTap Bubble Menu extension
- Appears on text selection
- Follows cursor/selection

**Menu Items**:
- Bold, Italic, Underline, Strike
- Link (keyboard shortcut: Ctrl+K)
- Code (inline)
- Highlight

**Styling**:
- White pill-shaped background
- Shadow
- Purple active indicators
- Fade in/out animation

#### 3.3 Floating "+" Menu

**New Feature**: Block insertion between paragraphs

**Implementation**:
- Shows on hover between paragraphs
- Click to open insert menu
- Same options as slash command

**Styling**:
- Purple circle with "+" icon
- Appears on left margin
- Fades in on hover

#### 3.4 Media Blocks Enhancement

**Current**: Basic image with resize
**Enhanced**: Full media block system

**Image Block Features**:
- Size presets: Small (25%), Medium (50%), Large (75%), Full (100%)
- Alignment: Left, Center, Right
- Caption input
- Alt text input (required warning if missing)
- Lightbox on click (zoom)

**Embed Blocks**:
- YouTube: Paste URL, auto-embed
- Spotify: Album, track, or playlist
- Twitter/X: Paste tweet URL
- Generic: oEmbed fallback

**Styling**:
- Wrapper with purple border on selection
- Resize handles on corners
- Caption in light gray below

#### 3.5 BTS Special Blocks

**New Feature**: Lyrics Block

**Design**:
- Centered text
- Serif font (Georgia or Playfair Display)
- Increased line height
- Subtle purple accent on left
- Stanza separation

**Implementation**:
```html
<div class="lyrics-block">
  <p>Verse 1 line 1</p>
  <p>Verse 1 line 2</p>
  <p class="stanza-break"></p>
  <p>Verse 2 line 1</p>
</div>
```

**Styling**:
```css
.lyrics-block {
  font-family: 'Georgia', serif;
  text-align: center;
  color: #4B5563;
  line-height: 2;
  padding: 2rem 0;
}

.lyrics-block p {
  margin-bottom: 0.5rem;
}

.lyrics-block .stanza-break {
  height: 2rem;
}
```

### Phase 4: Navigation & Utilities

#### 4.1 Table of Contents (Auto-Generated)

**New Feature**: Live TOC from headings

**Implementation**:
- Parse H1, H2, H3 from content
- Generate hierarchical list
- Click to scroll to section
- Highlight current section on scroll

**Placement**:
- Desktop: Right sidebar, collapsible
- Mobile: Bottom sheet, accessible from FAB

**Styling**:
- Nested indentation for hierarchy
- Purple accent on active
- Smooth scroll to section

#### 4.2 Word Count & Reading Time

**Current**: Basic calculation
**Enhanced**: Live stats bar

**Display**:
- Word count: "1,234 words"
- Reading time: "6 min read"
- Character count: "7,404 characters"

**Location**:
- Desktop: Bottom of title card
- Mobile: Title card subtitle

#### 4.3 Outline Mode

**New Feature**: Collapse/expand sections

**Implementation**:
- Add collapse buttons to headings
- Toggle content visibility
- Persist state in session

**Styling**:
- Small chevron icon
- Rotates on expand/collapse
- Smooth height transition

#### 4.4 Keyboard Shortcuts Modal

**Current**: Dark theme
**Updated**: Light theme

**Categories**:
- Formatting (Ctrl+B, I, U, etc.)
- Structure (H1, H2, H3, lists)
- Editor (Ctrl+K for link, Ctrl+S for save)
- Navigation (Ctrl+Shift+F for focus)

**Styling**:
- White modal background
- Grouped sections with dividers
- Keyboard key styling: gray boxes
- Purple accent for category headers

### Phase 5: Modals & Panels

#### 5.1 SEO Panel

**Current**: Dark glassmorphism
**New**: White card with green/yellow/red indicators

**Sections**:
1. Overall Score (large circular indicator)
2. Title Length (with recommended range)
3. Content Length (reading time)
4. Cover Image (with alt text check)
5. Tags (count check)
6. URL Preview (SERP style)

**Styling**:
- Progress bar with color coding
- Checkmark/X icons for each criterion
- Improvement suggestions

#### 5.2 History Panel

**Current**: Dark glass
**New**: White timeline

**Design**:
- Timeline layout with dots
- Relative timestamps ("2 minutes ago")
- Content preview (title + tags)
- Restore button on hover

**Storage**:
- Keep last 20 versions
- Store in localStorage
- Compress large content

#### 5.3 Templates Modal

**Current**: Dark grid
**New**: White card grid

**Layout**:
- 3-column grid
- Card: icon, title, description
- Hover: subtle lift + shadow
- Click: insert template

**Template Categories**:
- Album Review
- Song Analysis
- Concert Recap
- MV Breakdown
- Member Appreciation
- Concept Deep Dive
- Timeline/History
- Opinion Piece

#### 5.4 Preview Mode

**Current**: Dark glass overlay
**New**: Full-screen light preview

**Design**:
- Mimic published blog page exactly
- White background
- Center column (max-width: 720px)
- Cover image at top
- Title + tags + date
- Content with proper typography
- Close button (top-right)

### Phase 6: Mobile Experience

#### 6.1 Mobile Layout

**Current**: Bottom sheets for sidebar
**Enhanced**: Improved mobile flow

**Changes**:
1. Collapsible toolbar (tap to expand)
2. Settings FAB (floating action button)
3. Bottom sheet for sidebar (swipe to close)
4. Larger tap targets (44px minimum)
5. Safe area insets for notched devices

#### 6.2 Mobile Toolbar

**Design**:
- Sticky below title
- Horizontal scroll for all tools
- Grouped sections with labels
- Purple accent on active

**Sections**:
- Format: B, I, U, S
- Structure: H1, H2, H3, Lists
- Insert: Image, Link, Divider
- More: (tap for full menu)

#### 6.3 Mobile Sidebar

**Design**:
- Bottom sheet (slides up)
- Handle bar at top
- Scrollable content
- Safe area padding
- Swipe down to close

**Sections** (same as desktop):
- Cover Image
- Tags
- Mood
- SEO
- Publish

### Phase 7: Performance & Accessibility

#### 7.1 Performance Optimizations

**Editor Load Time**:
- Lazy load preview assets
- Code-split TipTap extensions
- Debounce autosave (500ms)
- Virtual scrolling for long content

**Animations**:
- Use CSS transforms (GPU accelerated)
- Reduce motion on mobile
- Respect `prefers-reduced-motion`

#### 7.2 Accessibility

**Keyboard Navigation**:
- Tab through all controls
- Arrow keys for menus
- Escape to close modals
- Focus-visible indicators

**Screen Readers**:
- ARIA labels on all buttons
- Live region for autosave status
- Semantic HTML structure
- Alt text prompts for images

**Color Contrast**:
- All text: WCAG AA (4.5:1 minimum)
- Purple accent: sufficient contrast on white
- Focus indicators: visible

**Focus Management**:
- Focus trap in modals
- Return focus after close
- Skip link to main content

### Phase 8: Data & API

#### 8.1 Content Model Updates

**Current Blog Model** ([lib/models/Blog.ts](../lib/models/Blog.ts) - to verify):

```typescript
interface BlogPost {
  title: string
  content: HTML // TipTap output
  excerpt?: string // Auto-generated from content
  tags: string[]
  mood: string
  coverImage: string
  coverAlt: string
  status: 'draft' | 'published'
  visibility: 'public' | 'unlisted' | 'private'
  seoMeta: {
    description: string
    slug: string
  }
  author: {
    id: string
    name: string
    avatar: string
  }
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}
```

#### 8.2 API Updates

**Required Updates** ([app/api/blogs/route.ts](../app/api/blogs/route.ts)):

1. Add excerpt auto-generation
2. Add slug auto-generation
3. Add alt text validation
4. Add SEO endpoint (for real-time scoring)

**New Endpoint**: `POST /api/blogs/seo-score`
```typescript
// Returns SEO score and suggestions
interface SEOScoreResponse {
  score: number
  suggestions: SEOSuggestion[]
}
```

#### 8.3 Local Storage

**Autosave Key**: `blog-editor-autosave`

**Schema**:
```typescript
interface LocalDraft {
  id: string
  title: string
  content: string
  tags: string[]
  mood: string
  coverImage: string
  coverAlt: string
  lastSaved: number
}
```

**Version History Key**: `blog-editor-versions-{postId}`

### Phase 9: Rollout & Migration

#### 9.1 Feature Flags

**Implementation**:
- Environment variable: `NEXT_PUBLIC_LIGHT_EDITOR`
- Gradual rollout: 10% → 50% → 100%
- User preference: persist in localStorage

#### 9.2 Migration Path

**For Existing Users**:
1. Add "Try New Editor" banner
2. Option to switch back (temporary)
3. Migrate drafts automatically
4. Preserve version history

#### 9.3 Testing Checklist

**Functionality**:
- [ ] All formatting options work
- [ ] Image upload (drag, drop, paste)
- [ ] Embeds (YouTube, Spotify, Twitter)
- [ ] Slash commands
- [ ] Bubble menu
- [ ] Autosave
- [ ] Version history restore
- [ ] SEO scoring
- [ ] Preview mode
- [ ] Publish flow

**Responsive**:
- [ ] Desktop (>1024px)
- [ ] Tablet (768-1024px)
- [ ] Mobile (<768px)

**Accessibility**:
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Touch targets (44px minimum)
- [ ] Color contrast

**Browsers**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Implementation Order

### Sprint 1: Foundation (Week 1-2)
1. Create light mode CSS variables and classes
2. Implement layout restructure
3. Redesign action bar and title input
4. Update main editor styling

### Sprint 2: Sidebar & Toolbar (Week 2-3)
5. Redesign right sidebar (all sections)
6. Implement toolbar redesign
7. Add responsive adjustments for mobile

### Sprint 3: Advanced Features (Week 3-4)
8. Implement slash command menu
9. Add bubble menu for inline formatting
10. Create floating "+" insert menu

### Sprint 4: Media & Special Blocks (Week 4-5)
11. Enhance image blocks (resize, align, caption)
12. Add embed blocks (YouTube, Spotify, Twitter)
13. Create BTS lyrics block
14. Implement code block with syntax highlighting

### Sprint 5: Navigation & Utilities (Week 5-6)
15. Implement TOC (auto-generated)
16. Add word count/reading time enhancements
17. Create outline mode
18. Update keyboard shortcuts modal

### Sprint 6: Modals & Panels (Week 6-7)
19. Redesign SEO panel (light theme)
20. Update history panel
21. Redesign templates modal
22. Create full-screen preview mode

### Sprint 7: Mobile Polish (Week 7-8)
23. Implement mobile toolbar
24. Polish mobile bottom sheets
25. Optimize touch targets
26. Add safe area insets

### Sprint 8: Performance & Accessibility (Week 8-9)
27. Performance optimizations
28. Accessibility audit and fixes
29. Cross-browser testing
30. Load time optimization

### Sprint 9: Testing & Rollout (Week 9-10)
31. Internal testing
32. Beta user testing
33. Bug fixes
34. Gradual rollout (10% → 100%)

## File Changes Summary

### New Files
- `components/blog/BlogEditorLight.tsx` - New light mode editor
- `components/blog/editor/SlashCommandMenu.tsx`
- `components/blog/editor/BubbleMenu.tsx`
- `components/blog/editor/FloatingInsertMenu.tsx`
- `components/blog/editor/LyricsBlock.tsx`
- `lib/blog/seo-scoring.ts` - SEO algorithm

### Modified Files
- `components/blog/BlogEditor.tsx` - Major rework
- `app/globals.css` - Add light mode classes
- `app/api/blogs/route.ts` - SEO endpoint
- `lib/blog/templates.ts` - Update for light mode

### CSS Architecture

**New CSS Variables**:
```css
:root {
  /* Light mode colors */
  --editor-bg-primary: #FAFAFA;
  --editor-bg-secondary: #FFFFFF;
  --editor-bg-tertiary: #F9FAFB;

  --editor-border: #E5E7EB;
  --editor-border-focus: #8B5CF6;

  --editor-text-primary: #1F2937;
  --editor-text-secondary: #6B7280;
  --editor-text-tertiary: #9CA3AF;

  --editor-accent: #8B5CF6;
  --editor-accent-hover: #7C3AED;

  --editor-success: #10B981;
  --editor-warning: #F59E0B;
  --editor-error: #EF4444;

  --editor-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --editor-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --editor-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

## Success Metrics Tracking

**Before Launch (Baseline)**:
- Editor load time: ____
- Average session duration: ____
- Publish completion rate: ____
- Error rate: ____

**After Launch (4 weeks)**:
- Editor load time: <2s
- Average session duration: +15%
- Publish completion rate: +20%
- Error rate: <1%
- Mobile usage: ____

## Open Questions

1. Should we support dark mode toggle in light editor?
   - Recommendation: No, keep separate experiences
   - User preference saved in localStorage

2. Should we migrate existing dark editor posts?
   - Recommendation: Content is HTML, should work fine
   - Test with existing posts

3. Should we keep dark editor available?
   - Recommendation: Phase out after 3 months
   - User feedback to guide decision

4. Should we add collaboration features?
   - Out of scope for Phase 1
   - Consider for Phase 2

5. Should we add AI writing assistance?
   - Partially implemented (AI Assist panel exists)
   - Enhance in Phase 2

## References

### Design Inspiration
- Medium.com (editorial style)
- Notion (block-based editor)
- Substack (clean writing experience)
- Ghost (publisher-focused)

### Technical References
- [TipTap Documentation](https://tiptap.dev/docs)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Medium Editor (legacy)](https://github.com/yabwe/medium-editor)

### BTS Brand Guidelines
- Purple: #8B5CF6 (primary)
- Pink: #EC4899 (secondary)
- BTS Official Purple: #5D2970 (BTS Purple)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-11
**Author**: ARMYVERSE Team
**Status**: Ready for Implementation
