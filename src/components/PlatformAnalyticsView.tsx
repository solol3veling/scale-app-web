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
  AlertTriangle,
  ExternalLink
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

interface PlatformAnalyticsData {
  platform: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  platformStats: {
    totalPosts: number;
    publishedPosts: number;
    failedPosts: number;
    scheduledPosts: number;
    successRate: number;
    totalEngagements: number;
    avgEngagementPerPost: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgSharesPerPost: number;
    avgViewsPerPost: number;
    avgSavesPerPost: number;
  };
  engagementTimeSeries: Array<{
    timestamp: string;
    engagements: number;
    successRate: number;
    postsPublished: number;
  }>;
  topPosts: Array<{
    post: {
      id: string;
      content: string;
      publishedAt: string;
      accounts: Array<{ platform: string; handle: string; displayName: string }>;
    };
    totalEngagements: number;
    engagementRate: number;
    publishedAt: string;
  }>;
  mostFailedPosts: Array<{
    post: {
      id: string;
      content: string;
    };
    errorMessage: string;
    failedAt: string;
    retryCount: number;
  }>;
  bestTimeAnalysis: {
    bestHourToPost: number;
    bestDayToPost: string;
    bestTimeSuccessRate: number;
    hourlySuccessRates: Array<{
      hour: number;
      successRate: number;
      totalPosts: number;
      successfulPosts: number;
    }>;
    dailySuccessRates: Array<{
      dayName: string;
      successRate: number;
      totalPosts: number;
      successfulPosts: number;
    }>;
  };
  engagementBreakdown: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    totalSaves: number;
    percentages: Record<string, number>;
  };
  performanceComparison: {
    platformSuccessRate: number;
    overallAverageSuccessRate: number;
    engagementRankAmongPlatforms: number;
    performanceLevel: string;
    aboveAverage: boolean;
  };
}

interface PlatformAnalyticsViewProps {
  platformData: PlatformAnalyticsData | null;
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

const PLATFORM_COLORS = {
  FACEBOOK: '#1877f2',
  INSTAGRAM: '#e4405f',
  TWITTER: '#1da1f2',
  LINKEDIN: '#0077b5',
  YOUTUBE: '#ff0000',
  PINTEREST: '#bd081c'
};

const ENGAGEMENT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export function PlatformAnalyticsView({ platformData, onBack, onPostClick }: PlatformAnalyticsViewProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number): string => `${num.toFixed(1)}%`;

  if (!platformData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No platform data available</p>
      </div>
    );
  }

  const platformColor = PLATFORM_COLORS[platformData.platform as keyof typeof PLATFORM_COLORS] || '#8884d8';

  // Prepare chart data
  const timeSeriesData = platformData.engagementTimeSeries.map(item => ({
    ...item,
    date: new Date(item.timestamp).toLocaleDateString(),
  }));

  const engagementBreakdownData = [
    { name: 'Likes', value: platformData.engagementBreakdown.totalLikes, color: ENGAGEMENT_COLORS[0] },
    { name: 'Comments', value: platformData.engagementBreakdown.totalComments, color: ENGAGEMENT_COLORS[1] },
    { name: 'Shares', value: platformData.engagementBreakdown.totalShares, color: ENGAGEMENT_COLORS[2] },
    { name: 'Views', value: platformData.engagementBreakdown.totalViews, color: ENGAGEMENT_COLORS[3] },
    { name: 'Saves', value: platformData.engagementBreakdown.totalSaves, color: ENGAGEMENT_COLORS[4] }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full" 
              style={{ backgroundColor: platformColor }} 
            />
            {platformData.platform} Analytics
          </h2>
          <p className="text-muted-foreground">
            {new Date(platformData.startDate).toLocaleDateString()} - {new Date(platformData.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Platform Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(platformData.platformStats.totalPosts)}</div>
            <p className="text-xs text-muted-foreground">
              {platformData.platformStats.publishedPosts} published, {platformData.platformStats.failedPosts} failed
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(platformData.platformStats.successRate)}</div>
            <p className="text-xs text-muted-foreground">
              {platformData.performanceComparison.aboveAverage ? 'Above' : 'Below'} average
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(platformData.platformStats.totalEngagements)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(platformData.platformStats.avgEngagementPerPost)} avg per post
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Rank</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{platformData.performanceComparison.engagementRankAmongPlatforms}</div>
            <p className="text-xs text-muted-foreground">
              {platformData.performanceComparison.performanceLevel}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Time Series & Engagement Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Time Series */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="engagements" 
                  stroke={platformColor} 
                  fill={platformColor} 
                  fillOpacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="#82ca9d" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Breakdown */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Engagement Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Average Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {formatNumber(platformData.platformStats.avgLikesPerPost)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Likes/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(platformData.platformStats.avgCommentsPerPost)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Comments/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(platformData.platformStats.avgSharesPerPost)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Shares/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(platformData.platformStats.avgViewsPerPost)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Views/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(platformData.platformStats.avgSavesPerPost)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Saves/Post</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Time Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Best Time to Post */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Best Time to Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Best Day</p>
                  <p className="text-sm text-muted-foreground">{platformData.bestTimeAnalysis.bestDayToPost}</p>
                </div>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Best Hour</p>
                  <p className="text-sm text-muted-foreground">{platformData.bestTimeAnalysis.bestHourToPost}:00</p>
                </div>
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Success Rate</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPercentage(platformData.bestTimeAnalysis.bestTimeSuccessRate)}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Success Rates */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Daily Success Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={platformData.bestTimeAnalysis.dailySuccessRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="successRate" fill={platformColor} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformData.topPosts.slice(0, 5).map((post, index) => (
              <div 
                key={post.post.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium line-clamp-2">{post.post.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(post.totalEngagements)} engagements
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(post.engagementRate)} rate
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPostClick(post.post.id)}
                  className="flex items-center gap-2"
                >
                  View Details
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Failed Posts (if any) */}
      {platformData.mostFailedPosts.length > 0 && (
        <Card className="hover-lift border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Failed Posts Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.mostFailedPosts.slice(0, 3).map((failedPost, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex-1">
                    <p className="font-medium line-clamp-2">{failedPost.post.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="destructive">Failed</Badge>
                      <span className="text-sm text-red-600">{failedPost.errorMessage}</span>
                      <span className="text-sm text-muted-foreground">
                        {failedPost.retryCount} retries
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(failedPost.failedAt).toLocaleDateString()}
                      </span>
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