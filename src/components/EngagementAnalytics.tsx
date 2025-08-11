import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp,
  Users,
  Target,
  Calendar,
  Hash,
  Clock,
  BarChart3
} from "lucide-react"
import { EngagementAnalyticsData } from "@/types/api"

interface EngagementAnalyticsProps {
  data: EngagementAnalyticsData;
}

export function EngagementAnalytics({ data }: EngagementAnalyticsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toString()
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overallMetrics.totalEngagement)}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Engagement Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.overallMetrics.avgEngagementRate)}</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Posts with Engagement</CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overallMetrics.totalPostsWithEngagement)}</div>
            <p className="text-xs text-muted-foreground">Active content</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Platform</CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overallMetrics.bestPerformingPlatform}</div>
            <p className="text-xs text-muted-foreground">Top performer</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatNumber(data.overallMetrics.totalLikes)}</div>
            <p className="text-sm text-muted-foreground">Avg per post: {formatNumber(data.overallMetrics.avgLikesPerPost)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatNumber(data.overallMetrics.totalComments)}</div>
            <p className="text-sm text-muted-foreground">Avg per post: {formatNumber(data.overallMetrics.avgCommentsPerPost)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-green-500" />
              Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatNumber(data.overallMetrics.totalShares)}</div>
            <p className="text-sm text-muted-foreground">Avg per post: {formatNumber(data.overallMetrics.avgSharesPerPost)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Media Performance</CardTitle>
            <CardDescription>How different content types perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Best Media Type</span>
              <Badge variant="secondary">{data.contentInsights.mediaPerformance.bestPerformingMediaType}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Images</span>
                <span className="font-medium">{formatNumber(data.contentInsights.mediaPerformance.imagePostsAvgEngagement)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Videos</span>
                <span className="font-medium">{formatNumber(data.contentInsights.mediaPerformance.videoPostsAvgEngagement)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Mixed Media</span>
                <span className="font-medium">{formatNumber(data.contentInsights.mediaPerformance.mixedMediaAvgEngagement)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Text Only</span>
                <span className="font-medium">{formatNumber(data.contentInsights.mediaPerformance.textOnlyAvgEngagement)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Hashtag Performance
            </CardTitle>
            <CardDescription>Impact of hashtags on engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Optimal Count</span>
              <Badge variant="secondary">{data.contentInsights.hashtagPerformance.optimalHashtagCount} tags</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">With Hashtags</span>
                <span className="font-medium">{formatNumber(data.contentInsights.hashtagPerformance.avgEngagementWithHashtags)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Without Hashtags</span>
                <span className="font-medium">{formatNumber(data.contentInsights.hashtagPerformance.avgEngagementWithoutHashtags)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Multiplier</span>
                <span className="font-medium text-green-600">
                  {data.contentInsights.hashtagPerformance.hashtagEngagementMultiplier.toFixed(1)}x
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timing Performance */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Best Posting Times
          </CardTitle>
          <CardDescription>When your audience is most active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Best Times</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm font-medium">Best Hour</span>
                  <Badge variant="secondary">{data.contentInsights.timingPerformance.bestPostingHour}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-sm font-medium">Best Day</span>
                  <Badge variant="secondary">{data.contentInsights.timingPerformance.bestPostingDay}</Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Consistency</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">Posting Consistency</span>
                  <span className="font-medium">{formatPercentage(data.trends.consistencyScore)}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">Growth Rate</span>
                  <span className={`font-medium ${data.trends.engagementGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.trends.engagementGrowthRate > 0 ? '+' : ''}{formatPercentage(data.trends.engagementGrowthRate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Your highest engagement content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPerformingPosts.slice(0, 5).map((post, index) => (
              <div key={post.postId} className="flex gap-4 p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                <div className="flex-shrink-0">
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{post.contentPreview}</span>
                    <Badge variant="outline">{post.platformCount} platform{post.platformCount > 1 ? 's' : ''}</Badge>
                    {post.hasMedia && <Badge variant="outline">Media</Badge>}
                    {post.hashtagCount > 0 && <Badge variant="outline">{post.hashtagCount} tags</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {formatNumber(post.totalLikes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {formatNumber(post.totalComments)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {formatNumber(post.totalShares)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(post.totalImpressions)}
                    </span>
                    <span className="text-green-600 font-medium">
                      {formatPercentage(post.engagementRate)} engagement
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Published {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions to improve your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Trend Direction</span>
                <Badge variant={data.trends.trendDirection === 'up' ? 'default' : 'secondary'}>
                  {data.trends.trendDirection}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Strategy: {data.trends.recommendedPostingStrategy}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key Insights</h4>
              <ul className="space-y-1">
                {data.trends.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}