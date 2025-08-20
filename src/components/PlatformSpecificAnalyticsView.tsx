import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  TrendingUp, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2,
  Users,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { usePlatformOverview } from "@/hooks/useAnalytics"
import { Platform } from "@/types/api"

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="text-sm font-medium text-foreground">{data.name}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-semibold text-foreground">{data.value.toLocaleString()}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Percentage: <span className="font-semibold text-foreground">{(data.payload.percent * 100).toFixed(1)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

interface PlatformSpecificAnalyticsViewProps {
  platform: Platform;
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

export function PlatformSpecificAnalyticsView({ platform, onBack }: PlatformSpecificAnalyticsViewProps) {
  const { data: platformData, isLoading, error } = usePlatformOverview(platform);

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
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <h2 className="text-2xl font-bold">Loading {platform} Analytics...</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <h2 className="text-2xl font-bold text-red-600">Error Loading {platform} Analytics</h2>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load platform analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!platformData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <h2 className="text-2xl font-bold">{platform} Analytics</h2>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No platform data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const platformColor = PLATFORM_COLORS[platform] || '#8884d8';
  const stats = platformData.platformStats || {};
  const timeSeries = platformData.engagementTimeSeries || [];
  const topPosts = platformData.topPosts || [];
  const failedPosts = platformData.mostFailedPosts || [];
  const bestTime = platformData.bestTimeAnalysis || {};
  const engagement = platformData.engagementBreakdown || {};

  const timeSeriesData = timeSeries.map(item => ({
    ...item,
    date: new Date(item.timestamp).toLocaleDateString(),
  }));

  const engagementBreakdownData = [
    { name: 'Likes', value: engagement.totalLikes || 0, color: '#e91e63' },
    { name: 'Comments', value: engagement.totalComments || 0, color: '#2196f3' },
    { name: 'Shares', value: engagement.totalShares || 0, color: '#4caf50' },
    { name: 'Views', value: engagement.totalViews || 0, color: '#ff9800' },
    { name: 'Saves', value: engagement.totalSaves || 0, color: '#9c27b0' }
  ].filter(item => item.value > 0);

  const hourlySuccessData = bestTime.hourlySuccessRates?.map((item: any) => ({
    hour: `${item.hour}:00`,
    successRate: item.successRate,
    totalPosts: item.totalPosts
  })) || [];

  const dailySuccessData = bestTime.dailySuccessRates?.map((item: any) => ({
    day: item.dayName?.slice(0, 3),
    successRate: item.successRate,
    totalPosts: item.totalPosts
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: platformColor }}
          >
            <span className="text-white font-bold text-sm">{platform.charAt(0)}</span>
          </div>
          <h2 className="text-2xl font-bold">{platform} Analytics</h2>
        </div>
      </div>

      {/* Platform Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <MessageSquare className="h-5 w-5" style={{ color: platformColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalPosts || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedPosts || 0} published, {stats.failedPosts || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalEngagements || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.avgEngagementPerPost || 0)} avg per post
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.successRate || 0)}</div>
            <p className="text-xs text-muted-foreground">Publishing success rate</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Engagement</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.avgEngagementPerPost || 0)}</div>
            <p className="text-xs text-muted-foreground">Per post average</p>
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
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="engagements" 
                    stroke={platformColor} 
                    strokeWidth={2}
                    name="Engagements"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="postsPublished" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Posts Published"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No time series data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Breakdown */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Engagement Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagementBreakdownData.length > 0 ? (
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
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No engagement data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Time Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hourly Success Rates */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Hourly Success Rates</CardTitle>
          </CardHeader>
          <CardContent>
            {hourlySuccessData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlySuccessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="successRate" fill={platformColor} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No hourly data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Success Rates */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Daily Success Rates</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySuccessData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailySuccessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="successRate" fill={platformColor} />
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

      {/* Top & Failed Posts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performing Posts */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Top Performing Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPosts.length > 0 ? (
              <div className="space-y-4">
                {topPosts.slice(0, 5).map((post: any, index: number) => (
                  <div key={post.post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{post.post.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(post.totalEngagements)} engagements
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatPercentage(post.engagementRate)} rate
                        </span>
                      </div>
                    </div>
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

        {/* Failed Posts */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Failed Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {failedPosts.length > 0 ? (
              <div className="space-y-4">
                {failedPosts.slice(0, 5).map((post: any, index: number) => (
                  <div key={post.post.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{post.post.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="destructive" className="text-xs">Failed</Badge>
                        <span className="text-sm text-red-600">{post.errorMessage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No failed posts data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Time Summary */}
      {bestTime.bestHourToPost !== undefined && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Optimal Posting Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold" style={{ color: platformColor }}>
                  {bestTime.bestHourToPost}:00
                </div>
                <p className="text-sm text-muted-foreground">Best Hour</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold" style={{ color: platformColor }}>
                  {bestTime.bestDayToPost}
                </div>
                <p className="text-sm text-muted-foreground">Best Day</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold" style={{ color: platformColor }}>
                  {formatPercentage(bestTime.bestTimeSuccessRate || 0)}
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}