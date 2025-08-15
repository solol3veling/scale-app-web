import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Target,
  Calendar,
  ArrowRight,
  ExternalLink,
  Clock,
  Hash,
  Activity,
  Zap
} from "lucide-react"
import { AnalyticsOverview, PostsAnalyticsData, ContentInsights, AnalyticsPost } from "@/types/api"

interface EnhancedAnalyticsDashboardProps {
  overviewData: AnalyticsOverview | null;
  postsData: PostsAnalyticsData | null;
  insightsData: ContentInsights | null;
  onContentSelect: (post: AnalyticsPost) => void;
  onPlatformSelect: (platform: string, data: any) => void;
}

export function EnhancedAnalyticsDashboard({ 
  overviewData, 
  postsData, 
  insightsData,
  onContentSelect,
  onPlatformSelect 
}: EnhancedAnalyticsDashboardProps) {
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
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  if (!overviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading analytics overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top-level Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overviewData.totalPosts)}</div>
            <p className="text-xs text-muted-foreground">Published across all platforms</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overviewData.totalEngagements)}</div>
            <div className="flex items-center gap-1 text-xs">
              {overviewData.engagementGrowth.growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={overviewData.engagementGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(overviewData.engagementGrowth.growthRate)}
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewData.engagementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average across all content</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reach</CardTitle>
            <Eye className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overviewData.totalReach)}</div>
            <div className="flex items-center gap-1 text-xs">
              {overviewData.audienceGrowth.growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={overviewData.audienceGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(overviewData.audienceGrowth.growthRate)}
              </span>
              <span className="text-muted-foreground">audience growth</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Highlights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-medium cursor-pointer hover:bg-accent/50 transition-colors border-2 hover:border-primary/20"
              onClick={() => onPlatformSelect(overviewData.topPerformingPlatform.name, overviewData.topPerformingPlatform)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Top Platform
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-semibold text-lg">{overviewData.topPerformingPlatform.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatNumber(overviewData.topPerformingPlatform.engagements)} engagements
              </div>
              <div className="text-sm">
                <span className="font-medium">{overviewData.topPerformingPlatform.engagementRate.toFixed(1)}%</span> engagement rate
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-blue-500" />
              Top Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-semibold text-lg">{overviewData.topPerformingAccount.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatNumber(overviewData.topPerformingAccount.engagements)} engagements
              </div>
              <div className="text-sm">
                <span className="font-medium">{overviewData.topPerformingAccount.engagementRate.toFixed(1)}%</span> engagement rate
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium cursor-pointer hover:bg-accent/50 transition-colors border-2 hover:border-primary/20"
              onClick={() => onContentSelect(overviewData.topPerformingPost as any)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Top Post
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm line-clamp-2">{overviewData.topPerformingPost.content}</div>
              <div className="text-sm text-muted-foreground">
                {formatNumber(overviewData.topPerformingPost.totalEngagements)} engagements
              </div>
              <div className="text-sm">
                <span className="font-medium">{overviewData.topPerformingPost.engagementRate.toFixed(1)}%</span> rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Top Performing Posts */}
      {postsData && postsData.posts && postsData.posts.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Top Performing Content
              <Badge variant="secondary">Click to view details</Badge>
            </CardTitle>
            <CardDescription>Your highest-performing content from recent posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {postsData.posts.slice(0, 5).map((post, index) => (
                <div 
                  key={post.postId} 
                  className="flex gap-4 p-4 rounded-lg border cursor-pointer hover:bg-accent/20 transition-colors hover:border-primary/20"
                  onClick={() => onContentSelect(post)}
                >
                  <div className="flex-shrink-0">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{post.bestPerformingPlatform}</Badge>
                        <Badge variant="outline">{post.mediaType}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          {post.engagementRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(post.totalViews)}
                      </span>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Insights */}
      {insightsData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Optimal Posting Times
              </CardTitle>
              <CardDescription>When your audience is most active</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsData.bestPostingTimes.slice(0, 3).map((time, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div>
                      <span className="font-medium">{time.dayOfWeek}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {time.timeOfDay.hour}:{time.timeOfDay.minute.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {time.averageEngagementRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {time.postCount} posts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-purple-500" />
                Top Hashtags
              </CardTitle>
              <CardDescription>Your most effective hashtags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insightsData.topHashtags.slice(0, 5).map((hashtag, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">#{hashtag.hashtag}</span>
                      <Badge variant="outline" className="text-xs">
                        {hashtag.usageCount} uses
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600 text-sm">
                        {hashtag.averageEngagementRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(hashtag.totalEngagements)} eng.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      {overviewData.keyInsights && overviewData.keyInsights.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Key Insights
            </CardTitle>
            <CardDescription>AI-powered insights from your analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {overviewData.keyInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Recommendations */}
      {insightsData?.recommendations && insightsData.recommendations.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Recommendations
            </CardTitle>
            <CardDescription>Actionable suggestions to improve your content performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insightsData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}