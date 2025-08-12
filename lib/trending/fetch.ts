// Trending API utilities for ArmyVerse BTS app
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''

// Helper function to add delays between API calls
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface TrendingVideo {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  viewCount: number
  likeCount: number
  videoUrl: string
  badges: Array<{ type: string; text: string; color: string }>
}

export interface TrendingTrack {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  popularity: number
  duration: string
  spotifyUrl: string
  releaseDate: string
  estimatedStreams: number
  badges: Array<{ type: string; text: string; color: string }>
}

export interface MemberSpotlight {
  member: string
  track: {
    id: string
    name: string
    artist: string
    album: string
    albumArt: string
    popularity: number
    spotifyUrl: string
    estimatedStreams: number
  }
}

// Minimal shape for YouTube search items we actually use
type YouTubeSearchItem = {
  id: { videoId: string }
  snippet: {
    title: string
    thumbnails: { high?: { url: string }; medium?: { url: string } }
    channelTitle: string
    publishedAt: string
  }
}

// YouTube trending via server endpoint with caching to minimize quota
export const fetchYouTubeTrending = async (): Promise<TrendingVideo[]> => {
  try {
    const res = await fetch('/api/trending/youtube', { cache: 'no-store' })
    if (!res.ok) {
      return getFallbackYouTubeData()
    }
    const payload = await res.json()
    const items = payload.search?.items || []
    const stats = payload.stats?.items || []

    if (!items.length) return getFallbackYouTubeData()

    const trendingVideos: TrendingVideo[] = items.map((item: YouTubeSearchItem, index: number) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(stats[index]?.statistics?.viewCount || '0'),
      likeCount: parseInt(stats[index]?.statistics?.likeCount || '0'),
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      badges: getMilestoneBadges(parseInt(stats[index]?.statistics?.viewCount || '0'))
    }))
    return trendingVideos
  } catch (error) {
    console.error('❌ Error fetching YouTube trending:', error)
    console.log('🔄 Using fallback YouTube data')
    return getFallbackYouTubeData()
  }
}

// Spotify API - Get trending BTS tracks
export const fetchSpotifyTrending = async (): Promise<TrendingTrack[]> => {
  try {
    const res = await fetch('/api/trending/spotify', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return (data.tracks || []) as TrendingTrack[]
  } catch (error) {
    console.error('Error fetching Spotify trending:', error)
    return []
  }
}

// Get all solo members with their top tracks - Future-proof approach
export const fetchAllMembersSpotlight = async (): Promise<MemberSpotlight[]> => {
  try {
    const res = await fetch('/api/trending/spotify', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return (data.members || []) as MemberSpotlight[]
  } catch (error) {
    console.error('Error fetching member spotlights:', error)
    return []
  }
}

// Get YouTube data for BTS members - Future-proof approach
export const fetchMembersYouTubeData = async (): Promise<MemberSpotlight[]> => {
  try {
    console.debug('🎬 Fetching YouTube member data...')
    
    const membersData = [
      { 
        name: 'Jimin', 
        channelKeywords: ['지민', 'Jimin BTS', 'Park Jimin'],
        excludeKeywords: ['wiz khalifa', 'billie eilish', 'charlie puth', 'bts ot7', '방탄소년단 전체']
      },
      { 
        name: 'Jungkook', 
        channelKeywords: ['정국', 'Jungkook BTS', 'Jeon Jungkook'],
        excludeKeywords: ['wiz khalifa', 'billie eilish', 'charlie puth', 'bts ot7', '방탄소년단 전체']
      },
      { 
        name: 'V', 
        channelKeywords: ['태형', 'V BTS', 'Kim Taehyung', 'Taehyung'],
        excludeKeywords: ['wiz khalifa', 'billie eilish', 'charlie puth', 'bts ot7', '방탄소년단 전체']
      },
      { 
        name: 'RM', 
        channelKeywords: ['남준', 'RM BTS', 'Kim Namjoon', 'Namjoon'],
        excludeKeywords: ['wiz khalifa', 'billie eilish', 'charlie puth', 'bts ot7', '방탄소년단 전체']
      },
      { 
        name: 'Suga', 
        channelKeywords: ['윤기', 'Suga BTS', 'Agust D', 'Min Yoongi'],
        excludeKeywords: ['wiz khalifa', 'billie eilish', 'charlie puth', 'bts ot7', '방탄소년단 전체']
      },
      { 
        name: 'J-Hope', 
        channelKeywords: ['호석', 'J-Hope BTS', 'Jung Hoseok', 'Hobi'],
        excludeKeywords: ['wiz khalifa', 'billie eilish', 'charlie puth', 'bts ot7', '방탄소년단 전체']
      },
      { 
        name: 'Jin', 
        channelKeywords: ['석진', 'Jin BTS', 'Kim Seokjin', 'Seokjin'],
        excludeKeywords: ['wiz khalifa', 'billie eilish', 'charlie puth', 'bts ot7', '방탄소년단 전체']
      }
    ]
    
    const memberSpotlights: MemberSpotlight[] = []
    
    for (const member of membersData) {
      try {
        let bestVideo = null
        let highestViewCount = 0
        
        // Search for member solo content with rate limiting
        for (const keyword of member.channelKeywords.slice(0, 1)) { // Reduced to 1 search per member to save quota
          try {
            // Add delay to prevent rate limiting
            await sleep(1000)
            
            const response = await fetch(
              `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword + ' solo')}&maxResults=3&order=viewCount&type=video&key=${YOUTUBE_API_KEY}`
            )
            
            if (!response.ok) {
              console.error(`❌ YouTube API error for ${member.name}:`, response.status)
              if (response.status === 403) {
                console.error('🚫 YouTube API 403 for member search - Rate limit or quota exceeded')
                await sleep(5000)
                break
              }
              continue
            }
            
            const data = await response.json()
            
            if (data.items && data.items.length > 0) {
              for (const video of data.items) {
                const title = video.snippet.title.toLowerCase()
                const channelTitle = video.snippet.channelTitle.toLowerCase()
                
                // Check if this is likely a solo video and not excluded content
                const isExcluded = member.excludeKeywords.some(excludeWord => 
                  title.includes(excludeWord.toLowerCase()) || 
                  channelTitle.includes(excludeWord.toLowerCase())
                )
                
                const isSolo = !title.includes('bts (') && 
                              !title.includes('방탄소년단 (') && 
                              !title.includes('bangtan sonyeondan') &&
                              !isExcluded &&
                              (title.includes(member.name.toLowerCase()) || 
                               member.channelKeywords.some(kw => title.includes(kw.toLowerCase())))
                
                if (isSolo) {
                  // Try to get video statistics, but don't fail if it doesn't work
                  let viewCount = 1000000
                  try {
                    await sleep(500)
                    const statsResponse = await fetch(
                      `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${video.id.videoId}&key=${YOUTUBE_API_KEY}`
                    )
                    
                    if (statsResponse.ok) {
                      const statsData = await statsResponse.json()
                      viewCount = parseInt(statsData.items[0]?.statistics.viewCount || '1000000')
                    }
                  } catch (error) {
                    console.warn(`⚠️ Could not get stats for ${video.snippet.title}:`, error)
                  }
                  
                  if (viewCount > highestViewCount) {
                    highestViewCount = viewCount
                    bestVideo = {
                      ...video,
                      viewCount: viewCount
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error(`❌ Error fetching YouTube data for ${member.name}:`, error)
          }
        }
        
        if (bestVideo) {
          memberSpotlights.push({
            member: member.name,
            track: {
              id: bestVideo.id.videoId,
              name: bestVideo.snippet.title,
              artist: member.name,
              album: 'YouTube',
              albumArt: bestVideo.snippet.thumbnails.high?.url || bestVideo.snippet.thumbnails.medium?.url,
              popularity: Math.min(Math.floor(bestVideo.viewCount / 1000000), 100),
              spotifyUrl: `https://www.youtube.com/watch?v=${bestVideo.id.videoId}`,
              estimatedStreams: bestVideo.viewCount
            }
          })
        } else {
          // Fallback: create a placeholder so all members appear
          memberSpotlights.push({
            member: member.name,
            track: {
              id: `yt-placeholder-${member.name}`,
              name: `${member.name} Solo Content`,
              artist: member.name,
              album: 'YouTube',
              albumArt: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
              popularity: 50,
              spotifyUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${member.name} BTS solo`),
              estimatedStreams: 1000000
            }
          })
        }
      } catch (error) {
        console.error(`❌ Error fetching YouTube data for ${member.name}:`, error)
      }
    }
    
    // Sort by popularity (view count) and ensure we have all 7 members
    return memberSpotlights.sort((a, b) => b.track.estimatedStreams - a.track.estimatedStreams)
  } catch (error) {
    console.error('❌ Error fetching members YouTube data:', error)
    return getFallbackMemberYouTubeData()
  }
}

// Fallback data when YouTube API fails
const getFallbackYouTubeData = (): TrendingVideo[] => {
  return [
    {
      id: 'fallback-1',
      title: 'BTS (방탄소년단) \'Dynamite\' Official MV',
      thumbnail: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=480&h=270',
      channelTitle: 'HYBE LABELS',
      publishedAt: '2020-08-21T00:00:00Z',
      viewCount: 1400000000,
      likeCount: 24000000,
      videoUrl: 'https://www.youtube.com/results?search_query=BTS+Dynamite',
      badges: [{ type: 'views', text: '💎 1B+ Views', color: 'bg-yellow-500' }]
    },
    {
      id: 'fallback-2',
      title: 'BTS (방탄소년단) \'Butter\' Official MV',
      thumbnail: 'https://images.pexels.com/photos/6975421/pexels-photo-6975421.jpeg?auto=compress&cs=tinysrgb&w=480&h=270',
      channelTitle: 'HYBE LABELS',
      publishedAt: '2021-05-21T00:00:00Z',
      viewCount: 900000000,
      likeCount: 18000000,
      videoUrl: 'https://www.youtube.com/results?search_query=BTS+Butter',
      badges: [{ type: 'views', text: '💎 100M+ Views', color: 'bg-blue-500' }]
    },
    {
      id: 'fallback-3',
      title: 'BTS (방탄소년단) \'Permission to Dance\' Official MV',
      thumbnail: 'https://images.pexels.com/photos/6975456/pexels-photo-6975456.jpeg?auto=compress&cs=tinysrgb&w=480&h=270',
      channelTitle: 'HYBE LABELS',
      publishedAt: '2021-07-09T00:00:00Z',
      viewCount: 650000000,
      likeCount: 15000000,
      videoUrl: 'https://www.youtube.com/results?search_query=BTS+Permission+to+Dance',
      badges: [{ type: 'views', text: '💎 100M+ Views', color: 'bg-blue-500' }]
    },
    {
      id: 'fallback-4',
      title: 'BTS (방탄소년단) \'Life Goes On\' Official MV',
      thumbnail: 'https://images.pexels.com/photos/6975387/pexels-photo-6975387.jpeg?auto=compress&cs=tinysrgb&w=480&h=270',
      channelTitle: 'HYBE LABELS',
      publishedAt: '2020-11-20T00:00:00Z',
      viewCount: 400000000,
      likeCount: 12000000,
      videoUrl: 'https://www.youtube.com/results?search_query=BTS+Life+Goes+On',
      badges: [{ type: 'views', text: '💎 100M+ Views', color: 'bg-blue-500' }]
    },
    {
      id: 'fallback-5',
      title: 'BTS (방탄소년단) \'Spring Day\' Official MV',
      thumbnail: 'https://images.pexels.com/photos/6975434/pexels-photo-6975434.jpeg?auto=compress&cs=tinysrgb&w=480&h=270',
      channelTitle: 'HYBE LABELS',
      publishedAt: '2017-02-13T00:00:00Z',
      viewCount: 380000000,
      likeCount: 11000000,
      videoUrl: 'https://www.youtube.com/results?search_query=BTS+Spring+Day',
      badges: [{ type: 'views', text: '💎 100M+ Views', color: 'bg-blue-500' }]
    }
  ]
}

// Fallback member data when YouTube API fails
const getFallbackMemberYouTubeData = (): MemberSpotlight[] => {
  return [
    {
      member: 'Jimin',
      track: {
        id: 'fallback-jimin',
        name: 'Jimin Solo Content',
        artist: 'Jimin',
        album: 'YouTube',
        albumArt: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
        popularity: 95,
        spotifyUrl: 'https://www.youtube.com/results?search_query=Jimin+BTS+solo',
        estimatedStreams: 50000000
      }
    },
    {
      member: 'Jungkook',
      track: {
        id: 'fallback-jungkook',
        name: 'Jungkook Solo Content',
        artist: 'Jungkook',
        album: 'YouTube',
        albumArt: 'https://images.pexels.com/photos/6975421/pexels-photo-6975421.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
        popularity: 94,
        spotifyUrl: 'https://www.youtube.com/results?search_query=Jungkook+BTS+solo',
        estimatedStreams: 45000000
      }
    },
    {
      member: 'V',
      track: {
        id: 'fallback-v',
        name: 'V Solo Content',
        artist: 'V',
        album: 'YouTube',
        albumArt: 'https://images.pexels.com/photos/6975456/pexels-photo-6975456.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
        popularity: 93,
        spotifyUrl: 'https://www.youtube.com/results?search_query=V+BTS+solo',
        estimatedStreams: 40000000
      }
    },
    {
      member: 'RM',
      track: {
        id: 'fallback-rm',
        name: 'RM Solo Content',
        artist: 'RM',
        album: 'YouTube',
        albumArt: 'https://images.pexels.com/photos/6975387/pexels-photo-6975387.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
        popularity: 92,
        spotifyUrl: 'https://www.youtube.com/results?search_query=RM+BTS+solo',
        estimatedStreams: 35000000
      }
    },
    {
      member: 'Suga',
      track: {
        id: 'fallback-suga',
        name: 'Suga Solo Content',
        artist: 'Suga',
        album: 'YouTube',
        albumArt: 'https://images.pexels.com/photos/6975434/pexels-photo-6975434.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
        popularity: 91,
        spotifyUrl: 'https://www.youtube.com/results?search_query=Suga+BTS+solo',
        estimatedStreams: 30000000
      }
    },
    {
      member: 'J-Hope',
      track: {
        id: 'fallback-jhope',
        name: 'J-Hope Solo Content',
        artist: 'J-Hope',
        album: 'YouTube',
        albumArt: 'https://images.pexels.com/photos/6975398/pexels-photo-6975398.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
        popularity: 90,
        spotifyUrl: 'https://www.youtube.com/results?search_query=J-Hope+BTS+solo',
        estimatedStreams: 25000000
      }
    },
    {
      member: 'Jin',
      track: {
        id: 'fallback-jin',
        name: 'Jin Solo Content',
        artist: 'Jin',
        album: 'YouTube',
        albumArt: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
        popularity: 89,
        spotifyUrl: 'https://www.youtube.com/results?search_query=Jin+BTS+solo',
        estimatedStreams: 20000000
      }
    }
  ]
}

// Helper functions

const getMilestoneBadges = (count: number): Array<{ type: string; text: string; color: string }> => {
  const badges: Array<{ type: string; text: string; color: string }> = []
  if (count >= 1000000000) badges.push({ type: 'views', text: '💎 1B+ Views', color: 'bg-yellow-500' })
  else if (count >= 100000000) badges.push({ type: 'views', text: '💎 100M+ Views', color: 'bg-blue-500' })
  else if (count >= 10000000) badges.push({ type: 'views', text: '💎 10M+ Views', color: 'bg-red-500' })
  return badges
}

// Format view count for display
export const formatViewCount = (count: number): string => {
  if (count >= 1000000000) {
    return `${(count / 1000000000).toFixed(1)}B`
  } else if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

// Format popularity for Spotify
export const formatPopularity = (popularity: number): string => {
  return `${popularity}% popularity`
}