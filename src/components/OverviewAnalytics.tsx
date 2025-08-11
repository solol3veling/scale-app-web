import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3
} from "lucide-react"
import { AnalyticsData, EnhancedAnalyticsData } from "@/types/api"

interface OverviewAnalyticsProps {
  data: AnalyticsData | EnhancedAnalyticsData;
  isEnhanced?: boolean;
}

export function OverviewAnalytics({ data, isEnhanced = false }: OverviewAnalyticsProps) {
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
    if (isEnhanced && 'overallMetrics' in data) {
      return {
        totalReach: data.overallMetrics.totalViews,
        totalEngagement: data.overallMetrics.totalEngagement,
        engagementRate: data.overallMetrics.engagementRate,
        totalPosts: data.overallMetrics.totalPosts
      };
    } else {
      return {
        totalReach: data.totalReach,
        totalEngagement: data.totalEngagement,
        engagementRate: data.engagementRate,
        totalPosts: data.platformBreakdown ? data.platformBreakdown.reduce((total, platform) => total + platform.posts, 0) : 0
      };
    }
  };

  const metrics = getMetricsForDisplay();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
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

      {/* Detailed Analytics */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {data.platformBreakdown?.map((platform, index) => {
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
                <Card key={index} className="shadow-medium hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded ${info.color}`} />
                      {info.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEnhanced && 'likes' in platform ? (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Likes</p>
                            <p className="text-xl font-bold">{formatNumber(platform.likes)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Shares</p>
                            <p className="text-xl font-bold">{formatNumber(platform.shares)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Comments</p>
                            <p className="text-xl font-bold">{formatNumber(platform.comments)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Views</p>
                            <p className="text-lg font-semibold">{formatNumber(platform.views)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Impressions</p>
                            <p className="text-lg font-semibold">{formatNumber(platform.impressions)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Posts</p>
                            <p className="text-lg font-semibold">{platform.posts}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Reach</p>
                            <p className="text-2xl font-bold">{formatNumber(platform.reach)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Engagement</p>
                            <p className="text-2xl font-bold">{formatNumber(platform.engagement)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Posts</p>
                            <p className="text-lg font-semibold">{platform.posts}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Your most engaging content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const posts = 'topPosts' in data 
                    ? data.topPosts 
                    : ('topPostsByEngagement' in data ? data.topPostsByEngagement : []);
                  
                  return posts.map((post, index) => (
                    <div key={'id' in post ? post.id : index} className="flex gap-4 p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {'platform' in post ? (
                            <Badge variant="secondary">
                              {post.platform.charAt(0).toUpperCase() + post.platform.slice(1).toLowerCase()}
                            </Badge>
                          ) : 'accounts' in post && post.accounts?.[0] && (
                            <Badge variant="secondary">
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
                        <p className="text-sm leading-relaxed">{post.content}</p>
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
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          {data.timeSeriesData && data.timeSeriesData.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Daily performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.timeSeriesData.slice(0, 5).map((dataPoint, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{new Date(dataPoint.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(dataPoint.reach)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {formatNumber(dataPoint.engagement)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {dataPoint.posts}
                          </span>
                          {dataPoint.likes && (
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {formatNumber(dataPoint.likes)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{data.dateRange}</p>
                      <p className="text-sm text-muted-foreground">Date Range</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold">{formatNumber(metrics.totalReach)}</p>
                        <p className="text-xs text-muted-foreground">Total Reach</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{formatNumber(metrics.totalEngagement)}</p>
                        <p className="text-xs text-muted-foreground">Total Engagement</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Audience insights will appear when time series data is available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}