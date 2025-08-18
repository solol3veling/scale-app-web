import React from "react"
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
  Activity,
  Zap,
  PieChart
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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { AnalyticsData } from "@/types/api"

interface AdvancedAnalyticsDashboardProps {
  analyticsData: AnalyticsData | null;
  onContentSelect: (post: unknown) => void;
  onPlatformSelect: (platform: string, data: unknown) => void;
}

// Color schemes for charts
const PLATFORM_COLORS = {
  FACEBOOK: '#1877F2',
  TWITTER: '#1DA1F2', 
  INSTAGRAM: '#E4405F',
  LINKEDIN: '#0A66C2',
  PINTEREST: '#BD081C',
  YOUTUBE: '#FF0000'
}

const CHART_COLORS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500  
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444'  // red-500
]

const ENGAGEMENT_COLORS = {
  likes: '#ff6b9d',
  comments: '#4dabf7', 
  shares: '#69db7c',
  views: '#ffd43b',
  saves: '#9775fa'
}

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label, type = 'default' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">
          {type === 'platform' && `Platform: ${label}`}
          {type === 'time' && `Time: ${label}`}
          {type === 'day' && `${label}`}
          {type === 'trends' && `Date: ${label}`}
          {type === 'engagement' && `${label}`}
          {type === 'default' && label}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600 dark:text-gray-400">{entry.dataKey || entry.name}</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {typeof entry.value === 'number' ? 
                  (entry.value >= 1000 ? 
                    (entry.value / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : 
                    entry.value.toLocaleString()
                  ) : 
                  entry.value
                }
                {entry.unit && ` ${entry.unit}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PlatformBadge = ({ platform, size = 'sm' }: { platform: string; size?: 'sm' | 'md' | 'lg' }) => {
  const platformLogos: Record<string, string> = {
    FACEBOOK: '📘',
    TWITTER: '🐦', 
    INSTAGRAM: '📷',
    LINKEDIN: '💼',
    PINTEREST: '📌',
    YOUTUBE: '📺'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5', 
    lg: 'text-base px-4 py-2'
  };

  const logo = platformLogos[platform.toUpperCase()] || '📱';
  
  return (
    <div className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 ${sizeClasses[size]}`}>
      <span>{logo}</span>
      <span>{platform}</span>
    </div>
  );
};

export function AdvancedAnalyticsDashboard({ 
  analyticsData, 
  onContentSelect,
  onPlatformSelect 
}: AdvancedAnalyticsDashboardProps) {
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

  // Default data to always show charts
  const defaultHourlyData = React.useMemo(() => [
    { hour: '8:00', posts: 5, percentage: 12.5 },
    { hour: '9:00', posts: 8, percentage: 20 },
    { hour: '10:00', posts: 12, percentage: 30 },
    { hour: '11:00', posts: 7, percentage: 17.5 },
    { hour: '12:00', posts: 4, percentage: 10 },
    { hour: '13:00', posts: 6, percentage: 15 },
    { hour: '14:00', posts: 3, percentage: 7.5 },
    { hour: '15:00', posts: 2, percentage: 5 }
  ], []);

  const defaultDailyData = React.useMemo(() => [
    { day: 'Mon', posts: 15, percentage: 18.75 },
    { day: 'Tue', posts: 12, percentage: 15 },
    { day: 'Wed', posts: 18, percentage: 22.5 },
    { day: 'Thu', posts: 14, percentage: 17.5 },
    { day: 'Fri', posts: 10, percentage: 12.5 },
    { day: 'Sat', posts: 6, percentage: 7.5 },
    { day: 'Sun', posts: 5, percentage: 6.25 }
  ], []);

  // Prepare data for platform rankings chart with real API data
  const platformRankingsData = React.useMemo(() => {
    // Always show at least something - prefer real data when available
    const hasRealData = analyticsData?.platformRankings?.length > 0;
    
    if (hasRealData) {
      try {
        return analyticsData.platformRankings
          .map((platform: any) => ({
            name: platform.platform?.toUpperCase() || 'UNKNOWN',
            posts: Number(platform.totalPosts || 0),
            engagement: Number(platform.engagement || 0),
            reach: Number(platform.reach || 0),
            successRate: Number(platform.successRate || 0),
            rank: Number(platform.rank || 0),
            percentage: Number(platform.percentage || 0),
            color: PLATFORM_COLORS[platform.platform?.toUpperCase() as keyof typeof PLATFORM_COLORS] || '#8884d8'
          }))
          .filter(platform => platform.name !== 'UNKNOWN')
          .sort((a, b) => b.posts - a.posts); // Sort by posts descending
      } catch (error) {
        console.warn('Error processing platform rankings:', error);
      }
    }
    
    // Fallback to placeholder data when no real data available
    return [
      { name: 'FACEBOOK', posts: 25, engagement: 1250, reach: 2500, successRate: 92.5, rank: 1, percentage: 35.2, color: PLATFORM_COLORS.FACEBOOK },
      { name: 'INSTAGRAM', posts: 32, engagement: 1680, reach: 3360, successRate: 88.2, rank: 2, percentage: 44.1, color: PLATFORM_COLORS.INSTAGRAM },
      { name: 'TWITTER', posts: 18, engagement: 756, reach: 1512, successRate: 85.7, rank: 3, percentage: 23.4, color: PLATFORM_COLORS.TWITTER },
      { name: 'LINKEDIN', posts: 12, engagement: 480, reach: 960, successRate: 95.1, rank: 4, percentage: 16.5, color: PLATFORM_COLORS.LINKEDIN }
    ];
  }, [analyticsData?.platformRankings]);

  // Enhanced defensive programming for hourly data
  const hourlyData = React.useMemo(() => {
    if (!analyticsData?.postingTimeAnalysis?.hourlyBreakdown?.length) {
      return defaultHourlyData;
    }

    try {
      return analyticsData.postingTimeAnalysis.hourlyBreakdown
        .map((hour: any) => {
          // Handle multiple possible field variations
          let hourDisplay = 'N/A';
          
          if (typeof hour.hour === 'number') {
            hourDisplay = `${hour.hour}:00`;
          } else if (typeof hour.hour === 'string') {
            hourDisplay = hour.hour;
          } else if (hour.timeLabel) {
            hourDisplay = hour.timeLabel;
          } else if (hour.time) {
            hourDisplay = hour.time;
          }

          return {
            hour: hourDisplay,
            posts: Number(hour.postCount || hour.posts || hour.count || 0),
            percentage: Number(hour.percentage || hour.percent || 0)
          };
        })
        .filter(item => item.hour !== 'N/A' && item.posts >= 0);
    } catch (error) {
      console.warn('Error processing hourly data:', error);
      return defaultHourlyData;
    }
  }, [analyticsData?.postingTimeAnalysis?.hourlyBreakdown, defaultHourlyData]);

  // Enhanced defensive programming for daily data
  const dailyData = React.useMemo(() => {
    if (!analyticsData?.postingTimeAnalysis?.dailyBreakdown?.length) {
      return defaultDailyData;
    }

    try {
      return analyticsData.postingTimeAnalysis.dailyBreakdown
        .map((day: any) => {
          // Handle multiple possible field variations with safe string operations
          let dayDisplay = 'N/A';
          
          if (day.dayOfWeek && typeof day.dayOfWeek === 'string') {
            dayDisplay = day.dayOfWeek.length >= 3 ? day.dayOfWeek.slice(0, 3) : day.dayOfWeek;
          } else if (day.day && typeof day.day === 'string') {
            dayDisplay = day.day.length >= 3 ? day.day.slice(0, 3) : day.day;
          } else if (day.dayName && typeof day.dayName === 'string') {
            dayDisplay = day.dayName.length >= 3 ? day.dayName.slice(0, 3) : day.dayName;
          } else if (day.weekday && typeof day.weekday === 'string') {
            dayDisplay = day.weekday.length >= 3 ? day.weekday.slice(0, 3) : day.weekday;
          }

          return {
            day: dayDisplay,
            posts: Number(day.postCount || day.posts || day.count || 0),
            percentage: Number(day.percentage || day.percent || 0)
          };
        })
        .filter(item => item.day !== 'N/A' && item.posts >= 0);
    } catch (error) {
      console.warn('Error processing daily data:', error);
      return defaultDailyData;
    }
  }, [analyticsData?.postingTimeAnalysis?.dailyBreakdown, defaultDailyData]);


  // Prepare engagement breakdown data with defensive programming
  const engagementBreakdownData = React.useMemo(() => {
    const engagement = analyticsData?.engagementAnalysis || {};
    
    return [
      { name: 'Likes', value: Number(engagement.totalLikes || engagement.likes || 1200), color: '#ff6b9d' },
      { name: 'Comments', value: Number(engagement.totalComments || engagement.comments || 380), color: '#4dabf7' },
      { name: 'Shares', value: Number(engagement.totalShares || engagement.shares || 145), color: '#69db7c' },
      { name: 'Views', value: Number(engagement.totalViews || engagement.views || 8500), color: '#ffd43b' },
      { name: 'Saves', value: Number(engagement.totalSaves || engagement.saves || 275), color: '#9775fa' }
    ].filter(item => item.value > 0);
  }, [analyticsData?.engagementAnalysis]);

  // Prepare time series data for trends with defensive programming
  const trendsData = React.useMemo(() => {
    if (!analyticsData?.timeSeriesData?.length) {
      return [];
    }

    try {
      return analyticsData.timeSeriesData.map((item: any) => ({
        date: item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        engagement: Number(item.engagement || item.totalEngagement || 0),
        reach: Number(item.reach || item.totalReach || 0),
        posts: Number(item.posts || item.postCount || 0)
      })).filter(item => item.date !== 'N/A');
    } catch (error) {
      console.warn('Error processing trends data:', error);
      return [];
    }
  }, [analyticsData?.timeSeriesData]);

  // Prepare scheduling analysis data with defensive programming
  const schedulingData = React.useMemo(() => {
    if (!analyticsData?.schedulingAnalysis?.monthlyTrends?.length) {
      return [];
    }

    try {
      return analyticsData.schedulingAnalysis.monthlyTrends.map((trend: any) => ({
        month: trend.month || trend.name || 'Unknown',
        scheduled: Number(trend.scheduledCount || trend.scheduled || 0),
        published: Number(trend.publishedCount || trend.published || 0),
        conversionRate: Number(trend.conversionRate || trend.conversion || 0)
      })).filter(item => item.month !== 'Unknown');
    } catch (error) {
      console.warn('Error processing scheduling data:', error);
      return [];
    }
  }, [analyticsData?.schedulingAnalysis?.monthlyTrends]);

  // Debug API response structure - only if analytics data exists
  React.useEffect(() => {
    if (analyticsData) {
      console.log('📊 Analytics Data Structure:', {
        postingTimeAnalysis: analyticsData.postingTimeAnalysis,
        hourlyBreakdown: analyticsData.postingTimeAnalysis?.hourlyBreakdown,
        dailyBreakdown: analyticsData.postingTimeAnalysis?.dailyBreakdown
      });
    }
  }, [analyticsData]);

  // Prepare top performing posts data with real metrics
  const topPostsData = React.useMemo(() => {
    if (analyticsData?.topPosts?.length > 0) {
      return analyticsData.topPosts.slice(0, 5);
    }
    
    // Fallback: Use topPostsByEngagement if available
    if (analyticsData?.topPostsByEngagement?.length > 0) {
      return analyticsData.topPostsByEngagement.slice(0, 5);
    }
    
    // Return empty array to show "No posts available" message
    return [];
  }, [analyticsData?.topPosts, analyticsData?.topPostsByEngagement]);

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading advanced analytics...</p>
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
            <div className="text-2xl font-bold">{formatNumber(analyticsData.totalPosts || 0)}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600">{formatNumber(analyticsData.totalPublishedPosts || 0)} published</span>
              <span className="text-orange-600">{formatNumber(analyticsData.totalScheduledPosts || 0)} scheduled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.totalEngagement || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatNumber(analyticsData.performance?.averageEngagementPerPost || 0)} per post
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Publishing Success</CardTitle>
            <Target className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analyticsData.publishingStats?.successRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.publishingStats?.successfulPublishes || 0)} successful
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Platform</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.mostActiveplatform || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Most active platform</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance Comparison Chart */}
      <Card className="shadow-medium hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Platform Performance Comparison
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Posts, engagement, and success rates by platform
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={platformRankingsData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip type="platform" />} />
                <Bar 
                  dataKey="posts" 
                  fill="url(#postsGradient)" 
                  name="Total Posts"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="engagement" 
                  fill="url(#engagementGradient)" 
                  name="Engagement"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-b from-[#8884d8] to-[#8884d8]/30"></div>
              <span className="text-xs text-muted-foreground">Total Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-b from-[#82ca9d] to-[#82ca9d]/30"></div>
              <span className="text-xs text-muted-foreground">Engagement</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Breakdown & Posting Times */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Breakdown Pie Chart */}
        <Card className="shadow-medium hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <PieChart className="h-5 w-5 text-pink-600" />
              Engagement Breakdown
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Distribution of engagement types across platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={engagementBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={25}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {engagementBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip type="engagement" />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {engagementBreakdownData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Posting Pattern */}
        <Card className="shadow-medium hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-purple-600" />
              Posting Times Analysis
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Optimal posting hours throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                  <defs>
                    <linearGradient id="postingTimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip type="time" />} />
                  <Area 
                    type="monotone" 
                    dataKey="posts" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fill="url(#hourlyGradient)"
                    dot={{ r: 4, fill: '#06b6d4' }}
                    activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-b from-purple-500 to-purple-500/20"></div>
                <span className="text-xs text-muted-foreground">Posts per hour</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <CardDescription>Engagement and reach over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip type="trends" />} />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  name="Engagement"
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="reach" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Reach"
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Posts"
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Posting Pattern & Scheduling Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Posting Pattern */}
        <Card className="shadow-medium hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-green-600" />
              Weekly Posting Pattern
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your posting frequency by day of the week
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip type="day" />} />
                  <Bar 
                    dataKey="posts" 
                    fill="url(#weeklyGradient)" 
                    radius={[6, 6, 0, 0]}
                    stroke="#10b981"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-b from-green-500 to-green-500/30"></div>
                <span className="text-xs text-muted-foreground">Posts per day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling Efficiency */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Scheduling Analysis
            </CardTitle>
            <CardDescription>Scheduled vs published posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={schedulingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip type="default" />} />
                  <Bar dataKey="scheduled" fill="#f59e0b" name="Scheduled" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="published" fill="#10b981" name="Published" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content with Enhanced Metrics */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Top Performing Content
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700">
              <Activity className="h-3 w-3 mr-1" />
              Interactive Analysis
            </Badge>
          </CardTitle>
          <CardDescription>Your highest-performing posts with engagement breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPostsData.length > 0 ? (
              topPostsData.map((post, index) => (
                <div 
                  key={post.id || index} 
                  className="group relative flex gap-4 p-4 rounded-lg border hover:bg-accent/20 transition-all duration-200 hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex-shrink-0">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Show platform from multiple possible sources */}
                        {(post.accounts?.[0]?.platform || post.bestPerformingPlatform || post.platform) && (
                          <PlatformBadge 
                            platform={post.accounts?.[0]?.platform || post.bestPerformingPlatform || post.platform} 
                            size="sm" 
                          />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                        </span>
                        {/* Show performance score if available */}
                        {post.performanceScore && (
                          <Badge variant="outline" className="text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                            Score: {post.performanceScore}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContentSelect(post);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        title="View detailed analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(post.totalViews || post.views || 0)} Views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(post.totalLikes || post.likes || 0)} Likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {formatNumber(post.totalComments || post.comments || 0)} Comments
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {formatNumber(post.totalShares || post.shares || 0)} Shares
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onContentSelect(post)}
                        className="text-xs h-7 px-3 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No top performing posts data available</p>
                <p className="text-sm text-muted-foreground mt-1">Posts will appear here once engagement data is collected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Rankings Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Platform Rankings & Performance</CardTitle>
          <CardDescription>Detailed comparison of all your platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformRankingsData.map((platform, index) => (
              <div 
                key={platform.name}
                className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent/20 transition-colors"
                onClick={() => onPlatformSelect(platform.name, platform)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={platform.name} size="md" />
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(platform.posts)}</div>
                    <div className="text-muted-foreground text-xs">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(platform.engagement)}</div>
                    <div className="text-muted-foreground text-xs">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(platform.reach)}</div>
                    <div className="text-muted-foreground text-xs">Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{platform.successRate.toFixed(1)}%</div>
                    <div className="text-muted-foreground text-xs">Success</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-base">Peak Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Best posting day:</span>
                <Badge variant="secondary">{analyticsData.postingTimeAnalysis?.peakPostingDay || 'N/A'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Best posting hour:</span>
                <Badge variant="secondary">{analyticsData.postingTimeAnalysis?.peakPostingHour || 'N/A'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Success rate:</span>
                <Badge variant="secondary">{(analyticsData.publishingStats?.successRate || 0).toFixed(1)}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-base">Engagement Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Avg likes per post:</span>
                <span className="font-medium">{formatNumber(analyticsData.engagementAnalysis?.averageLikesPerPost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg comments per post:</span>
                <span className="font-medium">{formatNumber(analyticsData.engagementAnalysis?.averageCommentsPerPost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg shares per post:</span>
                <span className="font-medium">{formatNumber(analyticsData.engagementAnalysis?.averageSharesPerPost || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-base">Publishing Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Scheduling rate:</span>
                <span className="font-medium">{(analyticsData.schedulingAnalysis?.schedulingRate || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Currently scheduled:</span>
                <span className="font-medium">{formatNumber(analyticsData.schedulingAnalysis?.currentlyScheduled || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Best platform:</span>
                <Badge variant="secondary">{analyticsData.publishingStats?.mostSuccessfulPlatform || 'N/A'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}