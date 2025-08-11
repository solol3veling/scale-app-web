import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowLeft 
} from "lucide-react"
import { usePlatformAnalytics } from "@/hooks/useAnalytics"
import { Platform } from "@/types/api"
import { useState } from "react"

interface PlatformAnalyticsProps {
  platform: Platform;
  onBack?: () => void;
}

export function PlatformAnalytics({ platform, onBack }: PlatformAnalyticsProps) {
  const [dateRange, setDateRange] = useState('30d');
  const { data: platformData, isLoading, error, refetch } = usePlatformAnalytics(platform, dateRange);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toString()
  };

  const getPlatformColor = (platform: Platform): string => {
    const colors = {
      FACEBOOK: 'bg-blue-600',
      TWITTER: 'bg-blue-500', 
      INSTAGRAM: 'bg-pink-500',
      LINKEDIN: 'bg-blue-700',
      GOOGLE: 'bg-green-500'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const getPlatformName = (platform: Platform): string => {
    return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className={`w-8 h-8 rounded-full ${getPlatformColor(platform)}`} />
            <div>
              <h2 className="text-xl font-semibold">{getPlatformName(platform)} Analytics</h2>
              <p className="text-sm text-muted-foreground">Platform-specific performance insights</p>
            </div>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover-lift gradient-card border-0 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-5 w-5 bg-gray-200 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className={`w-8 h-8 rounded-full ${getPlatformColor(platform)}`} />
            <div>
              <h2 className="text-xl font-semibold">{getPlatformName(platform)} Analytics</h2>
              <p className="text-sm text-muted-foreground">Platform-specific performance insights</p>
            </div>
          </div>
        </div>
        
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">Failed to load {getPlatformName(platform)} analytics</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!platformData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className={`w-8 h-8 rounded-full ${getPlatformColor(platform)}`} />
            <div>
              <h2 className="text-xl font-semibold">{getPlatformName(platform)} Analytics</h2>
              <p className="text-sm text-muted-foreground">Platform-specific performance insights</p>
            </div>
          </div>
        </div>
        
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No analytics data available for {getPlatformName(platform)}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className={`w-8 h-8 rounded-full ${getPlatformColor(platform)}`} />
          <div>
            <h2 className="text-xl font-semibold">{getPlatformName(platform)} Analytics</h2>
            <p className="text-sm text-muted-foreground">Platform-specific performance insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="h-9 w-9 p-0" 
            size="sm" 
            onClick={refetch}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(platformData.overallMetrics.totalPosts)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Likes</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(platformData.overallMetrics.totalLikes)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <Eye className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(platformData.overallMetrics.totalViews)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformData.overallMetrics.engagementRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
            <CardDescription>Detailed engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Comments</p>
                <p className="text-xl font-bold">{formatNumber(platformData.overallMetrics.totalComments)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="text-xl font-bold">{formatNumber(platformData.overallMetrics.totalShares)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-xl font-bold">{formatNumber(platformData.overallMetrics.totalImpressions)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg. Engagement/Post</p>
                <p className="text-xl font-bold">{formatNumber(platformData.overallMetrics.averageEngagementPerPost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold">{formatNumber(platformData.overallMetrics.totalEngagement)}</p>
              <p className="text-sm text-muted-foreground">Total Engagement</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold">{platformData.dateRange}</p>
                <p className="text-xs text-muted-foreground">Date Range</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{getPlatformName(platform)}</p>
                <p className="text-xs text-muted-foreground">Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      {platformData.topPosts && platformData.topPosts.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Your best content on {getPlatformName(platform)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.topPosts.slice(0, 5).map((post, index) => (
                <div key={post.postId} className="flex gap-4 p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(post.engagement.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {formatNumber(post.engagement.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {formatNumber(post.engagement.comments)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {formatNumber(post.engagement.shares)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Series Performance */}
      {platformData.timeSeriesData && platformData.timeSeriesData.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Daily performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.timeSeriesData.slice(0, 10).map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getPlatformColor(platform)}`} />
                    <span className="text-sm font-medium">{new Date(data.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {data.posts} posts
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {formatNumber(data.likes || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(data.views || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {formatNumber(data.totalEngagement || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}