import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  Calendar,
  Users,
  BarChart3,
  Clock
} from 'lucide-react'
import {
  EngagementTimeSeriesChart,
  PlatformRankingsChart,
  PostingTimeAnalysisChart,
  EngagementBreakdownChart
} from '@/components/charts'

interface RealAnalyticsData {
  // From generalStats
  totalPosts: number
  totalPublishedPosts: number
  totalScheduledPosts: number
  totalEngagement: number
  mostActiveplatform: string
  
  // From performanceMetrics
  performanceMetrics: {
    avgLikesPerPost: number
    avgCommentsPerPost: number
    avgSharesPerPost: number
    avgViewsPerPost: number
    avgSavesPerPost: number
    overallEngagementRate: number
  }
  
  // From publishingStats
  publishingStats: {
    successRate: number
    successfulPublishes: number
    mostSuccessfulPlatform: string
  }
  
  // From platformRankings
  platformRankings: Array<{
    platform: string
    totalPosts: number
    totalEngagements: number
    successRate: number
    avgLikesPerPost: number
    avgCommentsPerPost: number
    avgSharesPerPost: number
  }>
  
  // From topPosts
  topPosts: Array<{
    post: any
    totalEngagements: number
    engagementRate: number
    platform: string
  }>
  
  // From engagementAnalysis
  engagementAnalysis: {
    totalLikes: number
    totalComments: number
    totalShares: number
    totalViews: number
    totalSaves: number
    averageLikesPerPost: number
    averageCommentsPerPost: number
    averageSharesPerPost: number
  }
  
  // From postingTimeAnalysis
  postingTimeAnalysis: {
    peakPostingDay: string
    peakPostingHour: string
    hourlyBreakdown: Array<{
      hour: string
      posts: number
      percentage: number
    }>
    dailyBreakdown: Array<{
      day: string
      posts: number
      percentage: number
    }>
  }
  
  // From timeSeriesData
  timeSeriesData: Array<{
    timestamp?: string
    date?: string
    engagements: number
    successRate?: number
    postsPublished?: number
  }>
  
  // From bestTimeToPost
  bestTimeToPost?: {
    bestHour: number
    bestDayOfWeek: string
    successRateAtBestTime: number
    hourlySuccessRates: Record<string, number>
    dailySuccessRates: Record<string, number>
  }
}

interface RealAnalyticsDashboardProps {
  analyticsData: RealAnalyticsData
  onContentSelect?: (post: any) => void
  onPlatformSelect?: (platform: string, data: any) => void
  className?: string
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const RealAnalyticsDashboard: React.FC<RealAnalyticsDashboardProps> = ({
  analyticsData,
  onContentSelect,
  onPlatformSelect,
  className = ""
}) => {
  const {
    totalPosts,
    totalPublishedPosts,
    totalScheduledPosts,
    totalEngagement,
    mostActiveplatform,
    performanceMetrics,
    publishingStats,
    platformRankings,
    topPosts,
    engagementAnalysis,
    postingTimeAnalysis,
    timeSeriesData,
    bestTimeToPost
  } = analyticsData

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalPosts)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {totalPublishedPosts} published
              </Badge>
              <span className="ml-2">{totalScheduledPosts} scheduled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalEngagement)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              Avg {performanceMetrics.overallEngagementRate.toFixed(1)}% rate
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishingStats.successRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{publishingStats.successfulPublishes} successful</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Platform</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostActiveplatform}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Most active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Time Series and Platform Rankings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {timeSeriesData && timeSeriesData.length > 0 && (
          <EngagementTimeSeriesChart 
            data={timeSeriesData.map(item => ({
              timestamp: item.timestamp || item.date || new Date().toISOString(),
              engagements: item.engagements,
              successRate: item.successRate || 0,
              postsPublished: item.postsPublished || 0
            }))}
            className="col-span-1"
          />
        )}
        
        {platformRankings && platformRankings.length > 0 && (
          <PlatformRankingsChart 
            data={platformRankings}
            className="col-span-1"
          />
        )}
      </div>

      {/* Charts Row 2: Posting Time Analysis and Engagement Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {postingTimeAnalysis && (
          <PostingTimeAnalysisChart 
            hourlyData={postingTimeAnalysis.hourlyBreakdown || []}
            dailyData={postingTimeAnalysis.dailyBreakdown || []}
            peakDay={postingTimeAnalysis.peakPostingDay}
            peakHour={postingTimeAnalysis.peakPostingHour}
            className="col-span-1"
          />
        )}
        
        {engagementAnalysis && (
          <EngagementBreakdownChart 
            data={engagementAnalysis}
            className="col-span-1"
          />
        )}
      </div>

      {/* Best Time to Post Insights */}
      {bestTimeToPost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Optimal Posting Times
            </CardTitle>
            <CardDescription>
              AI-powered recommendations for maximum engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg border bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">
                  {bestTimeToPost.bestHour}:00
                </div>
                <div className="text-sm text-blue-700">Best Hour</div>
                <div className="text-xs text-blue-600">
                  {bestTimeToPost.successRateAtBestTime.toFixed(1)}% success rate
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg border bg-green-50">
                <div className="text-2xl font-bold text-green-600">
                  {bestTimeToPost.bestDayOfWeek}
                </div>
                <div className="text-sm text-green-700">Best Day</div>
                <div className="text-xs text-green-600">
                  Highest engagement
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg border bg-purple-50">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(bestTimeToPost.hourlySuccessRates).length}
                </div>
                <div className="text-sm text-purple-700">Active Hours</div>
                <div className="text-xs text-purple-600">
                  Tracked daily
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Posts */}
      {topPosts && topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>
              Your highest engagement content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPosts.slice(0, 5).map((post, index) => (
                <div 
                  key={post.post?.id || index} 
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => onContentSelect?.(post.post)}
                >
                  <div className="flex-shrink-0">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {post.post?.content || 'Post content'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {post.platform}
                      </Badge>
                      <span>{formatNumber(post.totalEngagements)} engagements</span>
                      <span>{post.engagementRate.toFixed(1)}% rate</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}