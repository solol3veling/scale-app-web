import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Eye,
  Bookmark,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Award
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { usePostAnalyticsOverview } from "@/hooks/useAnalytics"

interface PostSpecificAnalyticsViewProps {
  postId: string;
  onBack: () => void;
}

const PLATFORM_COLORS = {
  FACEBOOK: '#1877f2',
  INSTAGRAM: '#e4405f',
  TWITTER: '#1da1f2',
  LINKEDIN: '#0077b5',
  YOUTUBE: '#ff0000',
  PINTEREST: '#bd081c'
};

export function PostSpecificAnalyticsView({ postId, onBack }: PostSpecificAnalyticsViewProps) {
  const { data: postData, isLoading, error } = usePostAnalyticsOverview(postId);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number): string => `${num.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
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

  if (error || !postData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? 'Failed to load post analytics' : 'No post data available'}
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const engagementHistoryData = postData.engagementHistory.map(item => ({
    ...item,
    date: new Date(item.timestamp).toLocaleDateString(),
    time: new Date(item.timestamp).toLocaleTimeString(),
  }));

  const platformPerformanceData = postData.platformPerformances.map(platform => ({
    ...platform,
    color: PLATFORM_COLORS[platform.platform as keyof typeof PLATFORM_COLORS] || '#8884d8'
  }));

  const engagementBreakdown = postData.platformPerformances.reduce((acc, platform) => {
    acc.likes += platform.likes;
    acc.comments += platform.comments;
    acc.shares += platform.shares;
    acc.views += platform.views;
    acc.saves += platform.saves;
    return acc;
  }, { likes: 0, comments: 0, shares: 0, views: 0, saves: 0 });

  const engagementBreakdownData = [
    { name: 'Likes', value: engagementBreakdown.likes, color: '#8884d8' },
    { name: 'Comments', value: engagementBreakdown.comments, color: '#82ca9d' },
    { name: 'Shares', value: engagementBreakdown.shares, color: '#ffc658' },
    { name: 'Views', value: engagementBreakdown.views, color: '#ff7c7c' },
    { name: 'Saves', value: engagementBreakdown.saves, color: '#8dd1e1' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Analytics
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Post Analytics</h2>
          <p className="text-muted-foreground line-clamp-2">
            {postData.post.content}
          </p>
        </div>
      </div>

      {/* Post Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(postData.postStats.totalEngagements)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(postData.postStats.overallEngagementRate)} rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platforms</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postData.postStats.totalPlatformsPublished}</div>
            <p className="text-xs text-muted-foreground">
              {postData.postStats.successfulPublications} successful
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(postData.postStats.publishingSuccessRate)}</div>
            <p className="text-xs text-muted-foreground">
              {postData.postStats.failedPublications} failed
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Platform</CardTitle>
            <Award className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postData.performanceInsights.bestPerformingPlatform}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(postData.performanceInsights.highestEngagementCount)} engagements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Post Content Card */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Post Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Content</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {postData.post.content}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Publishing Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled for:</span>
                    <span>{new Date(postData.post.scheduledFor).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published at:</span>
                    <span>{new Date(postData.post.publishedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={postData.post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {postData.post.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Performance Level</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Performance:</span>
                    <Badge variant="outline">{postData.performanceInsights.performanceLevel}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Platform:</span>
                    <span>{postData.performanceInsights.bestPerformingPlatform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Worst Platform:</span>
                    <span>{postData.performanceInsights.worstPerformingPlatform}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 1: Engagement History & Platform Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement History */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalEngagements" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="likes" stroke="#e4405f" />
                <Line type="monotone" dataKey="comments" stroke="#1877f2" />
                <Line type="monotone" dataKey="shares" stroke="#0077b5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalEngagements" fill="#8884d8" />
                <Bar dataKey="engagementRate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Breakdown */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Engagement Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engagementBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              <h4 className="font-medium">Total Engagement Metrics</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-600" />
                    <span>Likes</span>
                  </div>
                  <span className="font-bold">{formatNumber(engagementBreakdown.likes)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span>Comments</span>
                  </div>
                  <span className="font-bold">{formatNumber(engagementBreakdown.comments)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-green-600" />
                    <span>Shares</span>
                  </div>
                  <span className="font-bold">{formatNumber(engagementBreakdown.shares)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-600" />
                    <span>Views</span>
                  </div>
                  <span className="font-bold">{formatNumber(engagementBreakdown.views)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-orange-600" />
                    <span>Saves</span>
                  </div>
                  <span className="font-bold">{formatNumber(engagementBreakdown.saves)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Details */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Platform Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {postData.platformPerformances.map((platform, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg ${
                  platform.published ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: PLATFORM_COLORS[platform.platform as keyof typeof PLATFORM_COLORS] }} 
                    />
                    <h4 className="font-medium">{platform.platform}</h4>
                    {platform.published ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatNumber(platform.totalEngagements)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(platform.engagementRate)} rate
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-5">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-pink-600">{formatNumber(platform.likes)}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{formatNumber(platform.comments)}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{formatNumber(platform.shares)}</div>
                    <div className="text-xs text-muted-foreground">Shares</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{formatNumber(platform.views)}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">{formatNumber(platform.saves)}</div>
                    <div className="text-xs text-muted-foreground">Saves</div>
                  </div>
                </div>
                {!platform.published && platform.errorMessage && (
                  <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                    <strong>Error:</strong> {platform.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimal Timing Analysis */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Timing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Actual vs Optimal Timing</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Published at optimal time?</span>
                  <Badge variant={postData.optimalTiming.publishedAtOptimalTime ? 'default' : 'secondary'}>
                    {postData.optimalTiming.publishedAtOptimalTime ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Actual time</span>
                  <span>{postData.optimalTiming.actualPublishHour}:00 on {postData.optimalTiming.actualPublishDay}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Recommended time</span>
                  <span>{postData.optimalTiming.recommendedHour}:00 on {postData.optimalTiming.recommendedDay}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Success Rates</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span>Actual time success rate</span>
                  <span className="font-bold">{formatPercentage(postData.optimalTiming.actualTimeSuccessRate)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span>Recommended time success rate</span>
                  <span className="font-bold">{formatPercentage(postData.optimalTiming.recommendedTimeSuccessRate)}</span>
                </div>
                {postData.optimalTiming.timingInsight && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        <strong>Insight:</strong> {postData.optimalTiming.timingInsight}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {postData.performanceInsights.recommendations.length > 0 && (
        <Card className="hover-lift border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Target className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {postData.performanceInsights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}