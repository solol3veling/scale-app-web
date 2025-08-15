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
  ExternalLink
} from "lucide-react"
import { AnalyticsData, EnhancedAnalyticsData, EngagementAnalyticsData, ContentAnalyticsData } from "@/types/api"

interface AnalyticsDashboardProps {
  primaryData: AnalyticsData | EnhancedAnalyticsData | null;
  engagementData: EngagementAnalyticsData | null;
  contentData: ContentAnalyticsData | null;
  isEnhanced?: boolean;
  onContentSelect: (post: any) => void;
  onPlatformSelect: (platform: string, data: any) => void;
}

export function AnalyticsDashboard({ 
  primaryData, 
  engagementData, 
  contentData, 
  isEnhanced = false,
  onContentSelect,
  onPlatformSelect 
}: AnalyticsDashboardProps) {
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

  const getMetricsForDisplay = () => {
    if (!primaryData) return null;
    
    if (isEnhanced && 'overallMetrics' in primaryData) {
      return {
        totalReach: primaryData.overallMetrics.totalViews,
        totalEngagement: primaryData.overallMetrics.totalEngagement,
        engagementRate: primaryData.overallMetrics.engagementRate,
        totalPosts: primaryData.overallMetrics.totalPosts
      };
    } else {
      return {
        totalReach: primaryData.totalReach,
        totalEngagement: primaryData.totalEngagement,
        engagementRate: primaryData.engagementRate,
        totalPosts: primaryData.platformBreakdown ? primaryData.platformBreakdown.reduce((total, platform) => total + platform.posts, 0) : 0
      };
    }
  };

  const metrics = getMetricsForDisplay();

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top-level Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reach</CardTitle>
            <Eye className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalReach)}</div>
            <p className="text-xs text-muted-foreground">Views/Impressions across platforms</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalEngagement)}</div>
            <p className="text-xs text-muted-foreground">Likes, comments, shares combined</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.engagementRate)}</div>
            <p className="text-xs text-muted-foreground">Average engagement per post</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <MessageSquare className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalPosts)}</div>
            <p className="text-xs text-muted-foreground">Published across all platforms</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance - Clickable */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Platform Performance
            <Badge variant="secondary">Click to drill down</Badge>
          </CardTitle>
          <CardDescription>Click on any platform to see detailed analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {primaryData?.platformBreakdown?.map((platform, index) => {
              const platformInfo = {
                FACEBOOK: { name: 'Facebook', color: 'bg-blue-600' },
                TWITTER: { name: 'Twitter', color: 'bg-blue-500' },
                INSTAGRAM: { name: 'Instagram', color: 'bg-pink-500' },
                LINKEDIN: { name: 'LinkedIn', color: 'bg-blue-700' },
                GOOGLE: { name: 'Google', color: 'bg-green-500' }
              };
              
              const platformKey = typeof platform.platform === 'string' 
                ? platform.platform.toUpperCase() as keyof typeof platformInfo
                : platform.platform;
              const info = platformInfo[platformKey] || { name: String(platform.platform), color: 'bg-gray-500' };
              
              return (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors border-2 hover:border-primary/20"
                  onClick={() => onPlatformSelect(info.name, platform)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded ${info.color}`} />
                        {info.name}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isEnhanced && 'likes' in platform ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="font-semibold">{formatNumber(platform.views)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Likes</p>
                          <p className="font-semibold">{formatNumber(platform.likes)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Reach</p>
                          <p className="font-semibold">{formatNumber(platform.reach)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Engagement</p>
                          <p className="font-semibold">{formatNumber(platform.engagement)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content - Clickable */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Top Performing Content
            <Badge variant="secondary">Click to view details</Badge>
          </CardTitle>
          <CardDescription>Click on any post to see detailed performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const posts = primaryData && 'topPosts' in primaryData 
                ? primaryData.topPosts 
                : (primaryData && 'topPostsByEngagement' in primaryData ? primaryData.topPostsByEngagement : []);
              
              return posts.slice(0, 5).map((post, index) => (
                <div 
                  key={'id' in post ? post.id : index} 
                  className="flex gap-4 p-4 rounded-lg border cursor-pointer hover:bg-accent/20 transition-colors hover:border-primary/20"
                  onClick={() => onContentSelect(post)}
                >
                  <div className="flex-shrink-0">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {'platform' in post ? (
                          <Badge variant="outline">
                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1).toLowerCase()}
                          </Badge>
                        ) : 'accounts' in post && post.accounts?.[0] && (
                          <Badge variant="outline">
                            {post.accounts[0].platform.charAt(0).toUpperCase() + post.accounts[0].platform.slice(1).toLowerCase()}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {'publishedAt' in post && post.publishedAt 
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : 'createdAt' in post 
                              ? new Date(post.createdAt).toLocaleDateString()
                              : 'N/A'}
                        </span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {'engagement' in post && post.engagement && 'totalEngagement' in post.engagement ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(post.engagement.views || 0)}
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
                        </>
                      ) : 'engagement' in post && post.engagement ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(post.engagement.reach)}
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
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      {engagementData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Best Performing Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="font-medium">Best Hour</span>
                  <Badge variant="secondary">{engagementData.contentInsights.timingPerformance.bestPostingHour}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="font-medium">Best Day</span>
                  <Badge variant="secondary">{engagementData.contentInsights.timingPerformance.bestPostingDay}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Content Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Best Media Type</span>
                  <Badge variant="secondary">{engagementData.contentInsights.mediaPerformance.bestPerformingMediaType}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Optimal Hashtag Count</span>
                  <Badge variant="secondary">{engagementData.contentInsights.hashtagPerformance.optimalHashtagCount} tags</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}