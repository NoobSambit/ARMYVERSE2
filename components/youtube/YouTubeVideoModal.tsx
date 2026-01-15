'use client'

import { useEffect, useState } from 'react'
import { X, Youtube, Eye, Heart, TrendingUp, Calendar, Award, Target, BarChart3, Loader2 } from 'lucide-react'
import { YouTubeVideoDetail as IYouTubeVideoDetail } from '@/app/youtube/page'

interface YouTubeVideoModalProps {
  videoDetail: IYouTubeVideoDetail | null
  loading: boolean
  onClose: () => void
}

export default function YouTubeVideoModal({ videoDetail, loading, onClose }: YouTubeVideoModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'monthly' | 'yearly'>('overview')

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('/')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${day}, ${year}`
  }

  if (!videoDetail && !loading) return null

  return (
    <div
      className="fixed inset-x-0 top-16 bottom-0 sm:inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-x-0 top-0 bottom-0 sm:inset-0 bg-[#050505]/90 backdrop-blur-xl animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className="
          relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl flex flex-col
          bg-[#0F0F0F] sm:border sm:border-purple-500/20 sm:rounded-[32px] sm:shadow-2xl sm:shadow-purple-900/20
          animate-in zoom-in-95 duration-200 overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-500/10 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/20">
              <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate leading-tight mb-0.5 pr-2">
                {videoDetail?.title || 'Loading...'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-purple-200/40">
                {videoDetail?.artist || 'Video Statistics'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full sm:h-96 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 animate-spin" />
              <p className="text-purple-200/30 font-medium">Analyzing video data...</p>
            </div>
          ) : videoDetail ? (
            <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 pb-20 sm:pb-8">
              {/* Video Embed */}
              <div className="aspect-video w-full rounded-[16px] sm:rounded-[24px] overflow-hidden bg-black shadow-2xl border border-purple-500/10 shrink-0">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoDetail.videoId}`}
                  title={videoDetail.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-5 rounded-[16px] sm:rounded-[24px] bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-purple-200/40 uppercase tracking-wider">Views</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-white">{formatNumber(videoDetail.totalViews)}</p>
                </div>

                <div className="p-3 sm:p-5 rounded-[16px] sm:rounded-[24px] bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-purple-200/40 uppercase tracking-wider">Likes</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-white">{formatNumber(videoDetail.likes)}</p>
                </div>

                <div className="p-3 sm:p-5 rounded-[16px] sm:rounded-[24px] bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-purple-200/40 uppercase tracking-wider">Best Day</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-white">{formatNumber(videoDetail.mostViewsInADay)}</p>
                </div>

                <div className="p-3 sm:p-5 rounded-[16px] sm:rounded-[24px] bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-purple-200/40 uppercase tracking-wider">Published</span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-white truncate">{formatDate(videoDetail.published)}</p>
                </div>
              </div>

              {/* Milestone Banner */}
              {videoDetail.expectedMilestone && (
                <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border border-purple-500/20 flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-purple-200/60 font-medium">Next Milestone</p>
                    <p className="text-sm sm:text-base text-white font-semibold leading-tight">
                      <span className="text-white font-bold">{formatNumber(videoDetail.milestoneViews)}</span> views on {formatDate(videoDetail.milestoneDate)}
                    </p>
                  </div>
                </div>
              )}

              {/* Chart Performance */}
              {(videoDetail.peakPosition > 0 || videoDetail.chartedWeeks > 0) && (
                <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#151515] border border-purple-500/10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                       <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Chart History</h3>
                  </div>
                  <div className="flex gap-8 sm:gap-12">
                    {videoDetail.peakPosition > 0 && (
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/40 font-medium uppercase tracking-wider mb-0.5 sm:mb-1">Peak</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">#{videoDetail.peakPosition}</p>
                      </div>
                    )}
                    {videoDetail.chartedWeeks > 0 && (
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/40 font-medium uppercase tracking-wider mb-0.5 sm:mb-1">Weeks</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{videoDetail.chartedWeeks}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Tabs */}
              <div>
                <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-purple-500/10 pb-1 overflow-x-auto scrollbar-hide">
                  {(['overview', 'daily', 'monthly', 'yearly'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition-all relative top-[1px] whitespace-nowrap
                        ${activeTab === tab
                          ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-500/5'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="min-h-[250px] sm:min-h-[300px]">
                  {activeTab === 'overview' && (
                    <div className="grid gap-4">
                      {/* Top Lists */}
                      {videoDetail.topLists && videoDetail.topLists.length > 0 && (
                        <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#151515] border border-purple-500/10">
                          <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                            <BarChart3 className="w-4 h-4 text-purple-400" />
                            Chart Appearances
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {videoDetail.topLists.map((list, idx) => (
                              <span key={idx} className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-200 border border-purple-500/20">
                                {list}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestones */}
                      {videoDetail.milestones && videoDetail.milestones.length > 0 && (
                        <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#151515] border border-purple-500/10">
                          <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                            <Target className="w-4 h-4 text-fuchsia-400" />
                            Achievements
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {videoDetail.milestones.map((milestone, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-fuchsia-400 shrink-0" />
                                <span className="text-xs sm:text-sm text-white/80">{milestone}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'daily' && videoDetail.dailyViews && (
                    <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#151515] border border-purple-500/10">
                      <h4 className="font-bold text-white mb-4 sm:mb-6 text-sm sm:text-base">Daily View Trend</h4>
                      <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {videoDetail.dailyViews.slice().reverse().map((day, idx) => (
                          <div key={idx} className="flex items-center gap-3 sm:gap-4 group">
                            <span className="text-[10px] sm:text-xs text-white/40 w-16 sm:w-24 shrink-0 font-mono">{day.date}</span>
                            <div className="flex-1 h-2 sm:h-3 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{
                                  width: `${Math.min(100, (day.views / videoDetail.mostViewsInADay) * 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-white w-14 sm:w-20 text-right shrink-0 tabular-nums">
                              {formatNumber(day.views)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'monthly' && videoDetail.monthlyViews && (
                    <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#151515] border border-purple-500/10">
                      <h4 className="font-bold text-white mb-4 sm:mb-6 text-sm sm:text-base">Monthly View Trend</h4>
                      <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {videoDetail.monthlyViews.slice().reverse().map((month, idx) => (
                          <div key={idx} className="flex items-center gap-3 sm:gap-4 group">
                            <span className="text-[10px] sm:text-xs text-white/40 w-16 sm:w-24 shrink-0 font-mono">{month.date}</span>
                            <div className="flex-1 h-2 sm:h-3 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{
                                  width: `${Math.min(100, (month.views / Math.max(...videoDetail.monthlyViews.map(m => m.views))) * 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-white w-14 sm:w-20 text-right shrink-0 tabular-nums">
                              {formatNumber(month.views)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'yearly' && videoDetail.yearlyViews && (
                     <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#151515] border border-purple-500/10">
                      <h4 className="font-bold text-white mb-4 sm:mb-6 text-sm sm:text-base">Yearly View Trend</h4>
                      <div className="space-y-3 sm:space-y-4">
                        {videoDetail.yearlyViews.slice().reverse().map((year, idx) => (
                          <div key={idx} className="flex items-center gap-3 sm:gap-4 group">
                            <span className="text-[10px] sm:text-xs text-white/40 w-16 sm:w-24 shrink-0 font-mono">{year.year}</span>
                            <div className="flex-1 h-2 sm:h-3 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                                style={{
                                  width: `${Math.min(100, (year.views / Math.max(...videoDetail.yearlyViews.map(y => y.views))) * 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-white w-16 sm:w-24 text-right shrink-0 tabular-nums">
                              {formatNumber(year.views)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* External Link */}
              <a
                href={`https://www.youtube.com/watch?v=${videoDetail.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-center gap-2 w-full py-3 sm:py-4 rounded-[18px]
                  bg-white text-purple-900 font-bold text-sm hover:bg-purple-50 transition-colors
                "
              >
                <Youtube className="w-5 h-5" />
                Open on YouTube
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
