import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  ArrowRight,
  ExternalLink
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
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

// Real API Response Interface based on actual endpoints
interface AnalyticsOverviewData {
  generalStats?: {
    totalPosts: number;
    scheduledPosts: number;
    draftedPosts: number;
    publishedPosts: number;
    totalEngagements: number;
    publishingSuccessRate: number;
    topPlatform: string;
    topPlatformPosts: number;
  };
  platformRankings?: Array<{
    platform: string;
    totalPosts: number;
    totalEngagements: number;
    successRate: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgSharesPerPost: number;
  }>;
  engagementTimeSeries?: Array<{
    timestamp: string;
    engagements: number;
    successRate: number;
    postsPublished: number;
  }>;
  engagementBreakdown?: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    totalSaves: number;
    percentages: Record<string, number>;
  };
  postTimeAnalysis?: {
    hourlyDistribution: Record<string, number>;
    dayOfWeekDistribution: Record<string, number>;
    peakPerformanceTime: string;
    mostPostTime: string;
    schedulingRate: number;
  };
  topPerformingPosts?: Array<{
    post: {
      id: string;
      content: string;
      publishedAt: string;
      accounts: Array<{ platform: string; handle: string; displayName: string }>;
    };
    totalEngagements: number;
    engagementRate: number;
    platform: string;
  }>;
  performanceMetrics?: {
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgSharesPerPost: number;
    avgViewsPerPost: number;
    avgSavesPerPost: number;
    overallEngagementRate: number;
  };
  bestTimeToPost?: {
    bestHour: number;
    bestDayOfWeek: string;
    successRateAtBestTime: number;
    hourlySuccessRates: Record<string, number>;
    dailySuccessRates: Record<string, number>;
  };
}

interface ComprehensiveAnalyticsDashboardProps {
  analyticsData: AnalyticsOverviewData | null;
  onPlatformClick: (platform: string) => void;
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

export function ComprehensiveAnalyticsDashboard({ 
  analyticsData, 
  onPlatformClick, 
  onPostClick 
}: ComprehensiveAnalyticsDashboardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number): string => `${num.toFixed(1)}%`;

  // Add safe data access with fallbacks
  const safeData = {
    generalStats: analyticsData?.generalStats || {},
    platformRankings: analyticsData?.platformRankings || [],
    engagementTimeSeries: analyticsData?.engagementTimeSeries || [],
    engagementBreakdown: analyticsData?.engagementBreakdown || {},
    postTimeAnalysis: analyticsData?.postTimeAnalysis || {},
    topPerformingPosts: analyticsData?.topPerformingPosts || [],
    performanceMetrics: analyticsData?.performanceMetrics || {},
    bestTimeToPost: analyticsData?.bestTimeToPost || {}
  };

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const timeSeriesData = safeData.engagementTimeSeries?.map(item => ({
    ...item,
    date: new Date(item.timestamp).toLocaleDateString(),
  })) || [];

  const platformData = safeData.platformRankings?.map(platform => ({
    ...platform,
    color: PLATFORM_COLORS[platform.platform as keyof typeof PLATFORM_COLORS] || '#8884d8'
  })) || [];

  const engagementBreakdownData = [
    { name: 'Likes', value: safeData.engagementBreakdown?.totalLikes || 0, color: ENGAGEMENT_COLORS[0] },
    { name: 'Comments', value: safeData.engagementBreakdown?.totalComments || 0, color: ENGAGEMENT_COLORS[1] },
    { name: 'Shares', value: safeData.engagementBreakdown?.totalShares || 0, color: ENGAGEMENT_COLORS[2] },
    { name: 'Views', value: safeData.engagementBreakdown?.totalViews || 0, color: ENGAGEMENT_COLORS[3] },
    { name: 'Saves', value: safeData.engagementBreakdown?.totalSaves || 0, color: ENGAGEMENT_COLORS[4] }
  ].filter(item => item.value > 0);

  const hourlyData = Object.entries(safeData.postTimeAnalysis?.hourlyDistribution || {}).map(([hour, posts]) => ({
    hour: `${hour}:00`,
    posts,
    successRate: safeData.bestTimeToPost?.hourlySuccessRates?.[hour] || 0
  }));

  const dailyData = Object.entries(safeData.postTimeAnalysis?.dayOfWeekDistribution || {}).map(([day, posts]) => ({
    day: day.slice(0, 3),
    posts,
    successRate: safeData.bestTimeToPost?.dailySuccessRates?.[day] || 0
  }));

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(safeData.generalStats?.totalPosts || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {safeData.generalStats?.publishedPosts || 0} published, {safeData.generalStats?.scheduledPosts || 0} scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(safeData.generalStats?.totalEngagements || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(safeData.performanceMetrics?.overallEngagementRate || 0)} engagement rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(safeData.generalStats?.publishingSuccessRate || 0)}</div>
            <p className="text-xs text-muted-foreground">Publishing success rate</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Platform</CardTitle>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeData.generalStats?.topPlatform || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {safeData.generalStats?.topPlatformPosts || 0} posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Engagement Time Series & Platform Rankings */}
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
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="engagements" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="postsPublished" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No time series data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Rankings */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platformData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalEngagements" fill="#8884d8" />
                    <Bar dataKey="successRate" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {platformData.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlatformClick(platform.platform)}
                        className="flex items-center gap-2 hover:bg-gray-100"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: platform.color }} 
                        />
                        {platform.platform}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(platform.totalEngagements)} engagements
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No platform data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Engagement Breakdown & Best Time Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Breakdown Pie Chart */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Engagement Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagementBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
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
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No engagement data available
              </div>
            )}
          </CardContent>
        </Card>

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
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Best Day</p>
                  <p className="text-sm text-muted-foreground">{safeData.bestTimeToPost?.bestDayOfWeek || 'N/A'}</p>
                </div>
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Best Hour</p>
                  <p className="text-sm text-muted-foreground">{safeData.bestTimeToPost?.bestHour || 0}:00</p>
                </div>
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Success Rate</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPercentage(safeData.bestTimeToPost?.successRateAtBestTime || 0)}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posting Time Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hourly Distribution */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Hourly Posting Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="posts" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No hourly data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Distribution */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Daily Posting Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="posts" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No daily data available
              </div>
            )}
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
          {safeData.topPerformingPosts && safeData.topPerformingPosts.length > 0 ? (
            <div className="space-y-4">
              {safeData.topPerformingPosts.slice(0, 5).map((post, index) => (
                <div 
                  key={post.post.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium line-clamp-2">{post.post.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">{post.platform}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(post.totalEngagements)} engagements
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatPercentage(post.engagementRate)} rate
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.post.publishedAt).toLocaleDateString()}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No top performing posts data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics Summary */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Average Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {formatNumber(safeData.performanceMetrics?.avgLikesPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Likes/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(safeData.performanceMetrics?.avgCommentsPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Comments/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(safeData.performanceMetrics?.avgSharesPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Shares/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(safeData.performanceMetrics?.avgViewsPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Views/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(safeData.performanceMetrics?.avgSavesPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Saves/Post</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}