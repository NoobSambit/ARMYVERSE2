import { TourStep } from '@/components/ui/GuidedTour'

// ============================================================================
// LANDING PAGE TOUR (Signed Out - Motivational)
// ============================================================================

export const BORALAND_LANDING_TOUR_ID = 'boraland-landing-tour'

export const boralandLandingTourSteps: TourStep[] = [
    {
        target: '[data-tour="landing-hero"]',
        title: '💜 Welcome, Future ARMY!',
        content: 'You\'ve discovered BORALAND — the ultimate BTS gaming experience! Play quizzes, collect photocards, and compete with ARMYs worldwide.',
        placement: 'bottom',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="landing-photocards"]',
        title: '🃏 Collect Rare Photocards!',
        content: 'Over 500+ exclusive digital photocards to collect! Each quiz you play could drop a rare card. Some are so rare only 1% of players have them!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="landing-badges"]',
        title: '🏆 Earn Epic Badges!',
        content: 'Unlock achievement badges as you play! From beginner to legendary status — can you collect them all?',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="landing-streaks"]',
        title: '🔥 Build Your Streak!',
        content: 'Play daily to build unstoppable streaks! Streak milestones unlock exclusive badges and bonus XP. Top players have 100+ day streaks!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="landing-leaderboard"]',
        title: '👑 Compete Globally!',
        content: 'Weekly ranked seasons with global leaderboards! Top 10 players earn legendary rewards. Will YOU be #1?',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="landing-cta"]',
        title: '🚀 Ready to Begin?',
        content: 'It\'s FREE to play, no downloads needed! Join thousands of ARMYs already playing. Your photocard collection awaits!',
        placement: 'top',
        spotlightPadding: 12,
    },
]

export const BORALAND_TOUR_ID = 'boraland-tour'

// ============================================================================
// DASHBOARD TOUR
// ============================================================================

// Desktop: Full 3-column layout with sidebars
export const boralandDashboardTourSteps: TourStep[] = [
    {
        target: '[data-tour="bora-header"]',
        title: '🎮 Welcome to Boraland!',
        content: 'This is your gaming hub! Use these tabs to navigate between different game modes: Home, BoraRush, Fangate, and ArmyBattles.',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="command-center"]',
        title: '🎯 Command Center',
        content: 'Your mission control! Access your Inventory, Leaderboard rankings, Mastery skills, and daily Quests from here.',
        placement: 'right',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="main-banner"]',
        title: '🏆 Featured Event',
        content: 'Check out the current live event! Click "Start Quiz" to test your BTS knowledge and earn exclusive photocards.',
        placement: 'bottom',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="game-modes"]',
        title: '🎲 Choose Your Mode',
        content: 'Practice Mode for learning without pressure, or Competitive Quiz to earn XP and climb the leaderboard!',
        placement: 'top',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="feature-cards"]',
        title: '✨ More Features',
        content: 'Explore Fangate for exclusive access verification, or join ArmyBattles for real-time streaming competitions!',
        placement: 'top',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="performance-stats"]',
        title: '📊 Your Performance',
        content: 'Track your progress here! See your level, XP, streak, dust balance, and quiz accuracy. Keep playing to level up! 💜',
        placement: 'left',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="card-showcase"]',
        title: '🃏 Card Showcase',
        content: 'Your latest collected photocard is displayed here! Click "Rotate Showcase" to see other cards in your collection.',
        placement: 'left',
        spotlightPadding: 12,
    },
]

// Mobile: Single column, sidebars hidden, bottom nav + floating buttons visible
export const boralandDashboardTourStepsMobile: TourStep[] = [
    {
        target: '[data-tour="bora-header"]',
        title: '🎮 Welcome to Boraland!',
        content: 'This is your gaming hub! Swipe through tabs to explore different game modes.',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="main-banner"]',
        title: '🏆 Featured Event',
        content: 'Tap "Start Quiz" to test your BTS knowledge and earn exclusive photocards!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="game-modes"]',
        title: '🎲 Game Modes',
        content: 'Practice Mode to learn, or Competitive Quiz to earn XP!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mobile-stats-button"]',
        title: '📊 Your Stats',
        content: 'Tap this button to see your level, XP, streak, and showcase cards!',
        placement: 'top',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mobile-nav"]',
        title: '📱 Navigation',
        content: 'Use this menu to access Quests, Inventory, Rankings, and Mastery!',
        placement: 'top',
        spotlightPadding: 4,
    },
]

// ============================================================================
// INVENTORY TOUR
// ============================================================================

export const BORALAND_INVENTORY_TOUR_ID = 'boraland-inventory-tour'

// Desktop: Has CommandCenter sidebar (hidden on mobile)
export const boralandInventoryTourSteps: TourStep[] = [
    {
        target: '[data-tour="inventory-filters"]',
        title: '🎒 Your Inventory',
        content: 'Welcome to your collection! Switch between Photocards, Collection view, and Badges.',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="inventory-grid"]',
        title: '🃏 Your Collection',
        content: 'Click on any card to view details, trade, or set it as your showcase card!',
        placement: 'bottom',
        spotlightPadding: 12,
    },
]

// Mobile: Same basic flow, no sidebar elements
export const boralandInventoryTourStepsMobile: TourStep[] = [
    {
        target: '[data-tour="inventory-filters"]',
        title: '🎒 Your Inventory',
        content: 'Switch between Photocards, Collection, and Badges tabs!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="inventory-grid"]',
        title: '🃏 Your Collection',
        content: 'Tap any card to view details or set as showcase!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mobile-nav"]',
        title: '📱 Quick Access',
        content: 'Navigate to other sections from here!',
        placement: 'top',
        spotlightPadding: 4,
    },
]

// ============================================================================
// LEADERBOARD TOUR
// ============================================================================

export const BORALAND_LEADERBOARD_TOUR_ID = 'boraland-leaderboard-tour'

// Desktop: Has right sidebar with your rank
export const boralandLeaderboardTourSteps: TourStep[] = [
    {
        target: '[data-tour="leaderboard-header"]',
        title: '🏆 Global Leaderboard',
        content: 'See how you rank against other ARMYs worldwide! Top players get exclusive rewards.',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="leaderboard-tabs"]',
        title: '📊 Different Rankings',
        content: 'Switch between XP rankings, quiz accuracy, card collection, and more!',
        placement: 'bottom',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="leaderboard-list"]',
        title: '👑 Top Players',
        content: 'The leaderboard shows top players with their stats. Can you make it to the top 10?',
        placement: 'bottom',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="your-rank"]',
        title: '📍 Your Position',
        content: 'Find your current rank here. Keep playing to climb higher!',
        placement: 'left',
        spotlightPadding: 12,
    },
]

// Mobile: No right sidebar, focus on main content
export const boralandLeaderboardTourStepsMobile: TourStep[] = [
    {
        target: '[data-tour="leaderboard-header"]',
        title: '🏆 Leaderboard',
        content: 'See how you rank against other ARMYs worldwide!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="leaderboard-tabs"]',
        title: '📊 Rankings',
        content: 'Switch between different ranking categories!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="leaderboard-list"]',
        title: '👑 Top Players',
        content: 'Scroll to find your position and see top players!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mobile-nav"]',
        title: '📱 More Features',
        content: 'Access other sections from here!',
        placement: 'top',
        spotlightPadding: 4,
    },
]

// ============================================================================
// MASTERY TOUR
// ============================================================================

export const BORALAND_MASTERY_TOUR_ID = 'boraland-mastery-tour'

// Desktop: Has right sidebar with badge rewards
export const boralandMasteryTourSteps: TourStep[] = [
    {
        target: '[data-tour="mastery-header"]',
        title: '🎖️ Mastery System',
        content: 'Level up your BTS knowledge! Unlock new tiers and earn exclusive rewards.',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mastery-progress"]',
        title: '📈 Your Progress',
        content: 'Track your mastery progress for each member and era. Complete quizzes to level up!',
        placement: 'bottom',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="badge-rewards-button"]',
        title: '🏆 Badge Rewards',
        content: 'Click to view all badge rewards you can unlock at each milestone!',
        placement: 'left',
        spotlightPadding: 8,
    },
]

// Mobile: No right sidebar, use floating wallet button
export const boralandMasteryTourStepsMobile: TourStep[] = [
    {
        target: '[data-tour="mastery-header"]',
        title: '🎖️ Mastery System',
        content: 'Level up your BTS knowledge and earn exclusive rewards!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="first-mastery-card"]',
        title: '📈 Your Progress',
        content: 'Track XP and level for each Member and Era!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mobile-wallet-button"]',
        title: '🏆 Rewards & Stats',
        content: 'Tap to view badge rewards and your wallet!',
        placement: 'top',
        spotlightPadding: 8,
    },
]

// ============================================================================
// QUESTS TOUR
// ============================================================================

export const BORALAND_QUESTS_TOUR_ID = 'boraland-quests-tour'

// Desktop: Has right sidebar with wallet/rewards
export const boralandQuestsTourSteps: TourStep[] = [
    {
        target: '[data-tour="quests-header"]',
        title: '📋 Daily Quests',
        content: 'Complete daily challenges to earn bonus XP and exclusive rewards!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="quest-cards"]',
        title: '🎯 Available Quests',
        content: 'Each quest has different objectives. Click to see details and claim rewards!',
        placement: 'bottom',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="quest-rewards-button"]',
        title: '🎁 Quest Rewards',
        content: 'View all rewards and your wallet here!',
        placement: 'left',
        spotlightPadding: 8,
    },
]

// Mobile: No right sidebar, use floating wallet button
export const boralandQuestsTourStepsMobile: TourStep[] = [
    {
        target: '[data-tour="quests-header"]',
        title: '📋 Daily Quests',
        content: 'Complete challenges to earn XP and rewards!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="quest-cards"]',
        title: '🎯 Your Quests',
        content: 'Tap quests to view details and claim rewards!',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="mobile-wallet-button"]',
        title: '🎁 Wallet & Rewards',
        content: 'Tap to view rewards and your stats!',
        placement: 'top',
        spotlightPadding: 8,
    },
]

// ============================================================================
// PLAY/QUIZ TOUR (no mobile differences needed - same layout)
// ============================================================================

export const BORALAND_PLAY_TOUR_ID = 'boraland-play-tour'

export const boralandPlayTourSteps: TourStep[] = [
    {
        target: '[data-tour="quiz-header"]',
        title: '🧠 Quiz Time!',
        content: 'Answer questions correctly to earn XP and collect photocards.',
        placement: 'bottom',
        spotlightPadding: 8,
    },
    {
        target: '[data-tour="question-card"]',
        title: '❓ The Question',
        content: 'Read carefully and answer before time runs out!',
        placement: 'bottom',
        spotlightPadding: 12,
    },
    {
        target: '[data-tour="answer-options"]',
        title: '🎯 Choose Wisely',
        content: 'Correct answers give you more points!',
        placement: 'top',
        spotlightPadding: 12,
    },
]
