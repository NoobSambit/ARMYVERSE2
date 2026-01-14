'use client'

import { useEffect, useState } from 'react'
import { X, Youtube, Eye, Heart, TrendingUp, Calendar, Award, Target, BarChart3 } from 'lucide-react'
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#0f0b16] border border-white/10 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-md">
              <h2 className="text-lg font-bold text-white truncate">{videoDetail?.title || 'Loading...'}</h2>
              <p className="text-xs text-white/60">{videoDetail?.artist || 'Video Statistics'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-73px)] custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                <p className="text-white/60">Loading video details...</p>
              </div>
            </div>
          ) : videoDetail ? (
            <div className="p-6 space-y-6">
              {/* Video Embed */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bento-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-white/60">Total Views</span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatNumber(videoDetail.totalViews)}</p>
                </div>

                <div className="bento-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-white/60">Likes</span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatNumber(videoDetail.likes)}</p>
                </div>

                <div className="bento-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/60">Best Day</span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatNumber(videoDetail.mostViewsInADay)}</p>
                </div>

                <div className="bento-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/60">Published</span>
                  </div>
                  <p className="text-sm font-bold text-white">{formatDate(videoDetail.published)}</p>
                </div>
              </div>

              {/* Milestone */}
              {videoDetail.expectedMilestone && (
                <div className="bento-card rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-yellow-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white/60">Expected to hit {formatNumber(videoDetail.milestoneViews)} views</p>
                      <p className="text-white font-medium">{formatDate(videoDetail.milestoneDate)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart Performance */}
              {(videoDetail.peakPosition > 0 || videoDetail.chartedWeeks > 0) && (
                <div className="bento-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold text-white">Chart Performance</h3>
                  </div>
                  <div className="flex gap-6">
                    {videoDetail.peakPosition > 0 && (
                      <div>
                        <p className="text-xs text-white/60">Peak Position</p>
                        <p className="text-lg font-bold text-white">#{videoDetail.peakPosition}</p>
                      </div>
                    )}
                    {videoDetail.chartedWeeks > 0 && (
                      <div>
                        <p className="text-xs text-white/60">Charted For</p>
                        <p className="text-lg font-bold text-white">{videoDetail.chartedWeeks} weeks</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-white/10">
                <div className="flex gap-2">
                  {(['overview', 'daily', 'monthly', 'yearly'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize
                        ${activeTab === tab
                          ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Top Lists */}
                    {videoDetail.topLists && videoDetail.topLists.length > 0 && (
                      <div className="bento-card rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Top Lists
                        </h4>
                        <ul className="space-y-2">
                          {videoDetail.topLists.map((list, idx) => (
                            <li key={idx} className="text-sm text-white/80 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              {list}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Milestones */}
                    {videoDetail.milestones && videoDetail.milestones.length > 0 && (
                      <div className="bento-card rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Milestones
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {videoDetail.milestones.map((milestone, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            >
                              {milestone}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Best Day */}
                    {videoDetail.mostViewsInADay > 0 && (
                      <div className="bento-card rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Most Views in a Day</h4>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-green-400">
                            {formatNumber(videoDetail.mostViewsInADay)}
                          </p>
                          <p className="text-sm text-white/60">on {formatDate(videoDetail.mostViewsDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'daily' && videoDetail.dailyViews && videoDetail.dailyViews.length > 0 && (
                  <div className="space-y-2">
                    <div className="bento-card rounded-xl p-4">
                      <h4 className="font-semibold text-white mb-4">Recent Daily Views</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {videoDetail.dailyViews.slice().reverse().map((day, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="text-sm text-white/60 w-24 shrink-0">{day.date}</span>
                            <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
                                style={{
                                  width: `${Math.min(100, (day.views / videoDetail.mostViewsInADay) * 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white w-20 text-right shrink-0">
                              {formatNumber(day.views)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'monthly' && videoDetail.monthlyViews && videoDetail.monthlyViews.length > 0 && (
                  <div className="space-y-2">
                    <div className="bento-card rounded-xl p-4">
                      <h4 className="font-semibold text-white mb-4">Monthly Views</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {videoDetail.monthlyViews.slice().reverse().map((month, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="text-sm text-white/60 w-24 shrink-0">{month.date}</span>
                            <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"
                                style={{
                                  width: `${Math.min(100, (month.views / Math.max(...videoDetail.monthlyViews.map(m => m.views))) * 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white w-20 text-right shrink-0">
                              {formatNumber(month.views)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'yearly' && videoDetail.yearlyViews && videoDetail.yearlyViews.length > 0 && (
                  <div className="space-y-2">
                    <div className="bento-card rounded-xl p-4">
                      <h4 className="font-semibold text-white mb-4">Yearly Views</h4>
                      <div className="space-y-3">
                        {videoDetail.yearlyViews.slice().reverse().map((year, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="text-sm text-white/60 w-20 shrink-0">{year.year}</span>
                            <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"
                                style={{
                                  width: `${Math.min(100, (year.views / Math.max(...videoDetail.yearlyViews.map(y => y.views))) * 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-white w-24 text-right shrink-0">
                              {formatNumber(year.views)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* External Link */}
              <a
                href={`https://www.youtube.com/watch?v=${videoDetail.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass-primary w-full justify-center"
              >
                <Youtube className="w-5 h-5" />
                Watch on YouTube
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
