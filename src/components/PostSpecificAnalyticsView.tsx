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
  Hash,
  AtSign,
  Image,
  Video,
  FileText,
  Activity,
  Star,
  Award,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { PostSpecificAnalytics } from "@/types/api"
import { usePostSpecificAnalytics } from "@/hooks/useAnalytics"

interface PostSpecificAnalyticsViewProps {
  postId: string;
  onBack: () => void;
}

const PLATFORM_COLORS = {
  FACEBOOK: '#1877F2',
  TWITTER: '#1DA1F2', 
  INSTAGRAM: '#E4405F',
  LINKEDIN: '#0A66C2',
  PINTEREST: '#BD081C',
  YOUTUBE: '#FF0000'
}

export function PostSpecificAnalyticsView({ postId, onBack }: PostSpecificAnalyticsViewProps) {
  const { data: analytics, isLoading, error } = usePostSpecificAnalytics(postId);

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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading post analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load post analytics</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Prepare platform engagement data for charts
  const platformEngagementData = analytics.platformEngagements.map(platform => ({
    name: platform.platform,
    likes: platform.likes,
    comments: platform.comments,
    shares: platform.shares,
    views: platform.views,
    engagement: platform.totalEngagement,
    engagementRate: platform.engagementRate,
    color: PLATFORM_COLORS[platform.platform] || '#8884d8'
  }));

  // Prepare engagement breakdown pie chart data
  const engagementBreakdownData = [
    { name: 'Likes', value: analytics.overallEngagement.totalLikes, color: '#ff6b9d' },
    { name: 'Comments', value: analytics.overallEngagement.totalComments, color: '#4dabf7' },
    { name: 'Shares', value: analytics.overallEngagement.totalShares, color: '#69db7c' },
    { name: 'Views', value: analytics.overallEngagement.totalViews, color: '#ffd43b' },
    { name: 'Saves', value: analytics.overallEngagement.totalSaves, color: '#9775fa' }
  ].filter(item => item.value > 0);

  // Prepare platform performance radar chart data
  const radarData = analytics.platformEngagements.map(platform => ({
    platform: platform.platform,
    likes: (platform.likes / Math.max(...analytics.platformEngagements.map(p => p.likes))) * 100,
    comments: (platform.comments / Math.max(...analytics.platformEngagements.map(p => p.comments))) * 100,
    shares: (platform.shares / Math.max(...analytics.platformEngagements.map(p => p.shares))) * 100,
    views: (platform.views / Math.max(...analytics.platformEngagements.map(p => p.views))) * 100,
  }));

  const getPerformanceColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={onBack}
        className="mb-4"
      >
        ← Back to Dashboard
      </Button>

      {/* Post Header */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Post Analytics</CardTitle>
              <CardDescription>Detailed performance metrics for this post</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={getPerformanceColor(analytics.performance.performanceRating)}
              >
                {analytics.performance.performanceRating}
              </Badge>
              {analytics.performance.isTopPerformer && (
                <Badge variant="outline" className="text-yellow-600 bg-yellow-100">
                  <Star className="h-3 w-3 mr-1" />
                  Top Performer
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Content</h4>
              <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">
                {analytics.content}
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {analytics.publishedAt 
                    ? `Published ${new Date(analytics.publishedAt).toLocaleDateString()}`
                    : analytics.scheduledFor
                      ? `Scheduled for ${new Date(analytics.scheduledFor).toLocaleDateString()}`
                      : 'Draft'
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{analytics.platformData.length} platform{analytics.platformData.length > 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{analytics.characterCount} characters</span>
              </div>
            </div>

            {analytics.hashtags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Hash className="h-4 w-4 text-muted-foreground" />
                {analytics.hashtags.map((hashtag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{hashtag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overall Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance Score</CardTitle>
            <Award className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.performanceScore}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Activity className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overallEngagement.totalEngagement)}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.overallEngagement.overallEngagementRate)}</div>
            <p className="text-xs text-muted-foreground">Overall rate</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rank</CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{analytics.performance.rankAmongAllPosts}</div>
            <p className="text-xs text-muted-foreground">Among all posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance Chart */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Platform Performance Breakdown
          </CardTitle>
          <CardDescription>Engagement metrics by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformEngagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [formatNumber(Number(value)), name]}
                  labelFormatter={(label) => `Platform: ${label}`}
                />
                <Bar dataKey="likes" fill="#ff6b9d" name="Likes" />
                <Bar dataKey="comments" fill="#4dabf7" name="Comments" />
                <Bar dataKey="shares" fill="#69db7c" name="Shares" />
                <Bar dataKey="views" fill="#ffd43b" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Breakdown & Publishing Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Breakdown */}
        {engagementBreakdownData.length > 0 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Engagement Distribution
              </CardTitle>
              <CardDescription>Breakdown of engagement types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={engagementBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {engagementBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Publishing Status */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Publishing Summary
            </CardTitle>
            <CardDescription>Success rate across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-2xl font-bold text-green-600">{analytics.publishingSummary.successfulPublishes}</div>
                  <div className="text-xs text-muted-foreground">Successful</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-2xl font-bold text-red-600">{analytics.publishingSummary.failedPublishes}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{analytics.publishingSummary.pendingPublishes}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {analytics.platformData.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{platform.platform}</span>
                      <span className="text-sm text-muted-foreground">@{platform.accountHandle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {platform.publishingStatus === 'SUCCESS' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : platform.publishingStatus === 'FAILED' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm">{platform.publishingStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Comparison
          </CardTitle>
          <CardDescription>How this post compares to your other content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <span className="font-medium">vs Average Engagement</span>
                <span className={`text-lg font-bold ${analytics.comparison.vsAverageEngagement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.comparison.vsAverageEngagement >= 0 ? '+' : ''}{formatPercentage(analytics.comparison.vsAverageEngagement)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <span className="font-medium">vs Average Reach</span>
                <span className={`text-lg font-bold ${analytics.comparison.vsAverageReach >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.comparison.vsAverageReach >= 0 ? '+' : ''}{formatPercentage(analytics.comparison.vsAverageReach)}
                </span>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Performance Summary</p>
                <p className="text-sm text-muted-foreground">{analytics.comparison.comparisonSummary}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold mb-2">{analytics.comparison.betterThanXPosts}</div>
                <p className="text-sm text-muted-foreground">Posts this performed better than</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold mb-2">
                  {analytics.performance.isTopPerformer ? 'Top 10%' : 'Not Top'}
                </div>
                <p className="text-sm text-muted-foreground">Performance tier</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {analytics.performance.insights && analytics.performance.insights.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>Performance analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.performance.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Similar Posts */}
      {analytics.comparison.similarPosts && analytics.comparison.similarPosts.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Similar Performing Posts</CardTitle>
            <CardDescription>Posts with comparable engagement levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.comparison.similarPosts.map((similarPost, index) => (
                <div key={index} className="flex gap-4 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm line-clamp-2 mb-2">{similarPost.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Engagement: {formatNumber(similarPost.totalEngagement)}</span>
                      <Badge variant="outline">{similarPost.similarity}</Badge>
                    </div>
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